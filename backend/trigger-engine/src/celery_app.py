from celery import Celery
from celery.schedules import crontab
from .config import REDIS_URL

app = Celery("gigshield_triggers", broker=REDIS_URL, backend=REDIS_URL)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)

# Beat schedule: poll APIs every 15 minutes between 6 AM and 11 PM IST
app.conf.beat_schedule = {
    "poll-weather-every-15min": {
        "task": "src.tasks.weather_task.poll_weather",
        "schedule": crontab(minute="*/15", hour="0-17"),  # UTC hours for 6 AM - 11 PM IST
    },
    "poll-pollution-every-15min": {
        "task": "src.tasks.pollution_task.poll_pollution",
        "schedule": crontab(minute="*/15", hour="0-17"),
    },
    "poll-news-every-30min": {
        "task": "src.tasks.news_task.poll_news",
        "schedule": crontab(minute="*/30", hour="0-17"),
    },
}

app.autodiscover_tasks(["src.tasks"])
