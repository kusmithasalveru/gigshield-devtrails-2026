import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost:5432/gigshield")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"
OPENAQ_BASE_URL = "https://api.openaq.org/v2"
NEWSDATA_API_KEY = os.getenv("NEWSDATA_API_KEY", "")
NEWSDATA_BASE_URL = "https://newsdata.io/api/1/news"

POLLING_INTERVAL_MINUTES = int(os.getenv("POLLING_INTERVAL_MINUTES", "15"))

# Trigger thresholds
THRESHOLDS = {
    "heavy_rain": {"value": 15.0, "unit": "mm/hr", "duration_min": 30, "severity": "HIGH"},
    "moderate_rain": {"value": 7.0, "max_value": 15.0, "unit": "mm/hr", "duration_min": 45, "severity": "MEDIUM"},
    "severe_pollution": {"value": 300, "unit": "AQI", "duration_min": 120, "severity": "HIGH"},
    "extreme_heat": {"value": 44.0, "unit": "°C", "duration_min": 180, "severity": "MEDIUM"},
}
