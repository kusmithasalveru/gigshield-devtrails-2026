"""
News Task: Polls NewsData.io API for strike/curfew/bandh events.
Creates disruption events directly (no duration tracking needed).
"""
import json
import hashlib
from datetime import datetime, timezone
import requests
import psycopg2
from ..celery_app import app
from ..config import NEWSDATA_API_KEY, NEWSDATA_BASE_URL, DATABASE_URL
from ..monitors.zone_manager import get_active_zones


@app.task(name="src.tasks.news_task.poll_news", bind=True, max_retries=2)
def poll_news(self):
    """Poll NewsData.io for strike/curfew events in active cities."""
    if not NEWSDATA_API_KEY:
        print("[NEWS] No API key configured, skipping")
        return {"events_created": 0}

    zones = get_active_zones()
    if not zones:
        return {"events_created": 0}

    cities = list(set(z["city"] for z in zones))
    events_created = 0

    for city in cities:
        try:
            response = requests.get(NEWSDATA_BASE_URL, params={
                "apikey": NEWSDATA_API_KEY,
                "q": f"({city}) AND (strike OR curfew OR bandh OR shutdown)",
                "language": "en",
                "country": "in",
                "timeframe": 6  # Last 6 hours
            }, timeout=15)
            response.raise_for_status()
            data = response.json()

            articles = data.get("results", [])
            if not articles:
                continue

            # If we find relevant articles, create strike/curfew events for affected zones
            for article in articles[:3]:  # Process top 3 articles
                title = (article.get("title") or "").lower()
                if any(keyword in title for keyword in ["strike", "curfew", "bandh", "shutdown"]):
                    # Create event for all zones in this city
                    city_zones = [z for z in zones if z["city"] == city]
                    for zone in city_zones:
                        created = _create_strike_event(zone, article)
                        if created:
                            events_created += 1
                    break  # One event per city per poll

        except requests.RequestException as e:
            print(f"[NEWS] Error polling {city}: {e}")
            continue

    return {"events_created": events_created}


def _create_strike_event(zone, article):
    """Create a strike/curfew disruption event."""
    now = datetime.now(timezone.utc)
    date_str = now.strftime("%Y-%m-%d")
    event_hash = hashlib.sha256(
        f"{zone['id']}:strike:{date_str}".encode()
    ).hexdigest()

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO disruption_events
               (event_hash, zone_id, event_type, severity, trigger_data,
                duration_minutes, disrupted_hours, source, start_time)
               VALUES (%s, %s, 'strike', 'HIGH', %s, %s, %s, 'newsdata', %s)
               ON CONFLICT (event_hash) DO NOTHING RETURNING id""",
            (
                event_hash, zone["id"],
                json.dumps({"title": article.get("title"), "link": article.get("link")}),
                480, 4.0, now.isoformat()
            ),
        )
        result = cur.fetchone()
        conn.commit()
        if result:
            print(f"[NEWS] Strike event created for zone {zone['grid_cell']}")
            return True
        return False
    finally:
        conn.close()
