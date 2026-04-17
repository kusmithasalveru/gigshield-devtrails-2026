#!/bin/bash
# ============================================================
# GigShield - Start All Services
# Launches frontend, API gateway, trigger engine, and fraud engine
# ============================================================

set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Store PIDs for cleanup
PIDS=()

cleanup() {
    echo -e "\n${YELLOW}Shutting down all services...${NC}"
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            echo "  Stopped process $pid"
        fi
    done
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "=========================================="
echo "  GigShield - Starting All Services"
echo "=========================================="

# --- 1. Frontend (port 5173) ---
echo -e "\n${BLUE}[1/4] Starting Frontend (port 5173)...${NC}"
cd "$ROOT_DIR/frontend"
npm run dev &
PIDS+=($!)
echo -e "${GREEN}✓ Frontend started (PID: ${PIDS[-1]})${NC}"

# --- 2. API Gateway (port 3000) ---
echo -e "\n${BLUE}[2/4] Starting API Gateway (port 3000)...${NC}"
cd "$ROOT_DIR/backend/api-gateway"
npm run dev &
PIDS+=($!)
echo -e "${GREEN}✓ API Gateway started (PID: ${PIDS[-1]})${NC}"

# --- 3. Fraud Engine (port 8000) ---
echo -e "\n${BLUE}[3/4] Starting Fraud Engine (port 8000)...${NC}"
cd "$ROOT_DIR/backend/fraud-engine"
python -m uvicorn src.main:app --reload --port 8000 2>/dev/null || \
python3 -m uvicorn src.main:app --reload --port 8000 &
PIDS+=($!)
echo -e "${GREEN}✓ Fraud Engine started (PID: ${PIDS[-1]})${NC}"

# --- 4. Trigger Engine (Celery worker + beat) ---
echo -e "\n${BLUE}[4/4] Starting Trigger Engine (Celery)...${NC}"
cd "$ROOT_DIR/backend/trigger-engine"
python -m celery -A src.celery_app worker --beat --loglevel=info 2>/dev/null || \
python3 -m celery -A src.celery_app worker --beat --loglevel=info &
PIDS+=($!)
echo -e "${GREEN}✓ Trigger Engine started (PID: ${PIDS[-1]})${NC}"

echo -e "\n${GREEN}=========================================="
echo "  All Services Running!"
echo "==========================================${NC}"
echo ""
echo "  Frontend:       http://localhost:5173"
echo "  API Gateway:    http://localhost:3000"
echo "  Fraud Engine:   http://localhost:8000"
echo "  Trigger Engine: Celery worker (background)"
echo ""
echo "  Health check:   http://localhost:3000/health"
echo "  API docs:       http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}  Press Ctrl+C to stop all services${NC}"

# Wait for all background processes
wait
