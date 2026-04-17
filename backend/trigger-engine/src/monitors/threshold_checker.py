"""
Threshold Checker: Tracks ongoing threshold breaches using Redis.
When a trigger sustains beyond the required duration, creates a disruption event in PostgreSQL.
"""
import json
import hashlib
from datetime import datetime, timezone
import psycopg2
import redis
from ..config import DATABASE_URL, REDIS_URL, THRESHOLDS

redis_client = redis.from_url(REDIS_URL)


def generate_event_hash(zone_id, event_type, timestamp=None):
    """Generate dedup hash: one event per zone + type + hour window."""
    ts = timestamp or datetime.now(timezone.utc)
    date_str = ts.strftime("%Y-%m-%d")
    hour_bucket = ts.hour
    input_str = f"{zone_id}:{event_type}:{date_str}:{hour_bucket}"
    return hashlib.sha256(input_str.encode()).hexdigest()


def check_threshold(zone_id, event_type, current_value, timestamp=None):
    """
    Process a reading for a zone. Track duration in Redis.
    If threshold sustained long enough, create disruption event.
    Returns True if an event was created.
    """
    config = THRESHOLDS.get(event_type)
    if not config:
        return False

    ts = timestamp or datetime.now(timezone.utc)
    redis_key = f"trigger:{zone_id}:{event_type}"

    # Check if current value exceeds threshold
    exceeds = current_value >= config["value"]
    if event_type == "moderate_rain":
        exceeds = config["value"] <= current_value < config.get("max_value", float("inf"))

    if exceeds:
        # Append reading to Redis tracking
        existing = redis_client.get(redis_key)
        if existing:
            data = json.loads(existing)
            data["readings"].append({"value": current_value, "time": ts.isoformat()})
        else:
            data = {
                "start_time": ts.isoformat(),
                "readings": [{"value": current_value, "time": ts.isoformat()}],
            }
        redis_client.setex(redis_key, 7200, json.dumps(data))  # TTL 2 hours

        # Check if duration threshold is met
        start = datetime.fromisoformat(data["start_time"])
        duration_minutes = (ts - start).total_seconds() / 60

        if duration_minutes >= config["duration_min"]:
            # Create disruption event
            return _create_disruption_event(
                zone_id, event_type, config, current_value, data, duration_minutes, ts
            )
    else:
        # Reading dropped below threshold — clear tracking
        redis_client.delete(redis_key)

    return False


def _create_disruption_event(zone_id, event_type, config, current_value, data, duration_minutes, timestamp):
    """Insert disruption event into PostgreSQL. Returns True if created (not duplicate)."""
    event_hash = generate_event_hash(zone_id, event_type, timestamp)
    disrupted_hours = min(duration_minutes / 60, 4)  # Capped at 4 hours

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO disruption_events
               (event_hash, zone_id, event_type, severity, trigger_data, trigger_value,
                threshold_value, duration_minutes, disrupted_hours, source, start_time, end_time)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
               ON CONFLICT (event_hash) DO NOTHING
               RETURNING id""",
            (
                event_hash, zone_id, event_type, config["severity"],
                json.dumps(data["readings"]), current_value, config["value"],
                int(duration_minutes), round(disrupted_hours, 2),
                "open-meteo", data["start_time"], timestamp.isoformat(),
            ),
        )
        result = cur.fetchone()
        conn.commit()

        if result:
            print(f"[EVENT] Created {event_type} event for zone {zone_id}: {duration_minutes:.0f} min")
            # Clear the Redis tracking key
            redis_client.delete(f"trigger:{zone_id}:{event_type}")
            return True
        return False  # Duplicate
    finally:
        conn.close()
