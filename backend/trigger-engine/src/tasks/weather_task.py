"""
Weather Task: Polls Open-Meteo API for precipitation and temperature data.
Checks heavy rain, moderate rain, and extreme heat thresholds.
"""
import requests
from ..celery_app import app
from ..config import OPEN_METEO_BASE_URL
from ..monitors.zone_manager import get_active_zones
from ..monitors.threshold_checker import check_threshold


@app.task(name="src.tasks.weather_task.poll_weather", bind=True, max_retries=3)
def poll_weather(self):
    """Poll Open-Meteo for all active zones."""
    zones = get_active_zones()
    if not zones:
        print("[WEATHER] No active zones to monitor")
        return {"zones_checked": 0, "events_created": 0}

    events_created = 0

    for zone in zones:
        try:
            # Fetch current weather from Open-Meteo (free, no API key needed)
            response = requests.get(OPEN_METEO_BASE_URL, params={
                "latitude": zone["lat"],
                "longitude": zone["lng"],
                "current": "precipitation,apparent_temperature,rain",
                "timezone": "Asia/Kolkata"
            }, timeout=10)
            response.raise_for_status()
            data = response.json()

            current = data.get("current", {})
            precipitation = current.get("precipitation", 0) or current.get("rain", 0)
            apparent_temp = current.get("apparent_temperature", 0)

            print(f"[WEATHER] {zone['grid_cell']}: rain={precipitation}mm/hr, temp={apparent_temp}°C")

            # Check heavy rain (>= 15 mm/hr)
            if precipitation >= 15:
                if check_threshold(zone["id"], "heavy_rain", precipitation):
                    events_created += 1

            # Check moderate rain (7-15 mm/hr)
            elif 7 <= precipitation < 15:
                if check_threshold(zone["id"], "moderate_rain", precipitation):
                    events_created += 1

            # Check extreme heat (>= 44°C feels-like)
            if apparent_temp >= 44:
                if check_threshold(zone["id"], "extreme_heat", apparent_temp):
                    events_created += 1

        except requests.RequestException as e:
            print(f"[WEATHER] Error polling zone {zone['grid_cell']}: {e}")
            continue

    return {"zones_checked": len(zones), "events_created": events_created}
