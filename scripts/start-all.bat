@echo off
REM ============================================================
REM GigShield - Start All Services (Windows)
REM Opens each service in a separate terminal window
REM ============================================================

set ROOT_DIR=%~dp0..

echo ==========================================
echo   GigShield - Starting All Services
echo ==========================================

REM --- 1. Frontend (port 5173) ---
echo [1/4] Starting Frontend...
start "GigShield Frontend" cmd /k "cd /d %ROOT_DIR%\frontend && npm run dev"

REM --- 2. API Gateway (port 3000) ---
echo [2/4] Starting API Gateway...
start "GigShield API Gateway" cmd /k "cd /d %ROOT_DIR%\backend\api-gateway && npm run dev"

REM --- 3. Fraud Engine (port 8000) ---
echo [3/4] Starting Fraud Engine...
start "GigShield Fraud Engine" cmd /k "cd /d %ROOT_DIR%\backend\fraud-engine && python -m uvicorn src.main:app --reload --port 8000"

REM --- 4. Trigger Engine (Celery) ---
echo [4/4] Starting Trigger Engine...
start "GigShield Trigger Engine" cmd /k "cd /d %ROOT_DIR%\backend\trigger-engine && python -m celery -A src.celery_app worker --beat --loglevel=info"

echo.
echo ==========================================
echo   All Services Starting!
echo ==========================================
echo.
echo   Frontend:       http://localhost:5173
echo   API Gateway:    http://localhost:3000
echo   Fraud Engine:   http://localhost:8000
echo   API Docs:       http://localhost:8000/docs
echo   Trigger Engine: Celery worker (background)
echo.
echo   Each service runs in its own terminal window.
echo   Close the terminal windows to stop services.
echo.
pause
