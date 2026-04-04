"""
Pollution Task: Polls OpenAQ API for PM2.5 AQI data.
Checks severe pollution threshold (AQI > 300).
"""
import requests
from ..celery_app import app
from ..config import OPENAQ_BASE_URL
from ..monitors.zone_manager import get_active_zones
from ..monitors.threshold_checker import check_threshold


@app.task(name="src.tasks.pollution_task.poll_pollution", bind=True, max_retries=3)
def poll_pollution(self):
    """Poll OpenAQ for PM2.5 readings in all active zones."""
    zones = get_active_zones()
    if not zones:
        return {"zones_checked": 0, "events_created": 0}

    events_created = 0
    cities_checked = set()

    for zone in zones:
        city = zone["city"]
        if city in cities_checked:
            continue
        cities_checked.add(city)

        try:
            # OpenAQ: get latest PM2.5 measurements near the zone
            response = requests.get(f"{OPENAQ_BASE_URL}/latest", params={
                "coordinates": f"{zone['lat']},{zone['lng']}",
                "radius": 25000,  # 25km radius
                "parameter": "pm25",
                "limit": 5
            }, timeout=15)
            response.raise_for_status()
            data = response.json()

            results = data.get("results", [])
            if not results:
                print(f"[POLLUTION] No PM2.5 data for {city}")
                continue

            # Get the latest PM2.5 reading
            for result in results:
                for measurement in result.get("measurements", []):
                    if measurement.get("parameter") == "pm25":
                        aqi_value = measurement.get("value", 0)
                        print(f"[POLLUTION] {city}: PM2.5 AQI = {aqi_value}")

                        # Check severe pollution (AQI > 300)
                        if aqi_value > 300:
                            # Apply to all zones in this city
                            for z in zones:
                                if z["city"] == city:
                                    if check_threshold(z["id"], "severe_pollution", aqi_value):
                                        events_created += 1
                        break

        except requests.RequestException as e:
            print(f"[POLLUTION] Error polling {city}: {e}")
            continue

    return {"zones_checked": len(cities_checked), "events_created": events_created}
