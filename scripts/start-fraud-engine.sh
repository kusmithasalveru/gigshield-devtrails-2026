#!/bin/bash
# Start GigShield Fraud Engine (FastAPI)
# Port: 8000

cd "$(dirname "$0")/../backend/fraud-engine"

echo "Starting GigShield Fraud Engine on http://localhost:8000"
echo "API docs available at http://localhost:8000/docs"
echo ""

python -m uvicorn src.main:app --reload --port 8000 2>/dev/null || \
python3 -m uvicorn src.main:app --reload --port 8000
