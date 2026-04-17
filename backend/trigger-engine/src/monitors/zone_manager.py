"""
Zone Manager: Fetches active zones (zones with active policies this week).
Caches results in Redis for 1 hour.
"""
import json
import psycopg2
import redis
from ..config import DATABASE_URL, REDIS_URL

redis_client = redis.from_url(REDIS_URL)
CACHE_KEY = "gigshield:active_zones"
CACHE_TTL = 3600  # 1 hour


def get_active_zones():
    """Get zones that have at least one active policy this week."""
    cached = redis_client.get(CACHE_KEY)
    if cached:
        return json.loads(cached)

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT DISTINCT z.id, z.city, z.grid_cell,
                   ST_Y(z.location::geometry) as lat,
                   ST_X(z.location::geometry) as lng,
                   z.risk_score
            FROM zones z
            JOIN workers w ON w.zone_id = z.id
            JOIN policies p ON p.worker_id = w.id
            WHERE p.status = 'active'
              AND p.start_date <= CURRENT_DATE
              AND p.end_date >= CURRENT_DATE
        """)
        columns = [desc[0] for desc in cur.description]
        zones = [dict(zip(columns, row)) for row in cur.fetchall()]

        # Convert Decimal types to float for JSON serialization
        for zone in zones:
            for key in ["lat", "lng", "risk_score"]:
                if zone.get(key) is not None:
                    zone[key] = float(zone[key])

        redis_client.setex(CACHE_KEY, CACHE_TTL, json.dumps(zones))
        return zones
    finally:
        conn.close()


def invalidate_cache():
    """Clear the zone cache (call when new policies are created)."""
    redis_client.delete(CACHE_KEY)
