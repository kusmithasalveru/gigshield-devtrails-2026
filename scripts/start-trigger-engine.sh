#!/bin/bash
# Start GigShield Trigger Engine (Celery + Redis)
# Polls weather, pollution, and news APIs every 15 minutes

cd "$(dirname "$0")/../backend/trigger-engine"

echo "Starting GigShield Trigger Engine (Celery worker + beat)"
echo "Prerequisites: Redis must be running on localhost:6379"
echo ""

python -m celery -A src.celery_app worker --beat --loglevel=info 2>/dev/null || \
python3 -m celery -A src.celery_app worker --beat --loglevel=info
