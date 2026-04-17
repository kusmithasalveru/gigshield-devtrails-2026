@echo off
REM ============================================================
REM GigShield - Full Project Setup Script (Windows)
REM ============================================================

echo ==========================================
echo   GigShield - Project Setup (Windows)
echo ==========================================

set ROOT_DIR=%~dp0..

REM --- 1. Frontend ---
echo.
echo [1/4] Setting up Frontend...
cd /d "%ROOT_DIR%\frontend"
call npm install
echo ✓ Frontend dependencies installed

REM --- 2. Backend API Gateway ---
echo.
echo [2/4] Setting up Backend API Gateway...
cd /d "%ROOT_DIR%\backend\api-gateway"
if not exist .env (
    copy .env.example .env
    echo   Created .env from .env.example
)
call npm install
echo ✓ API Gateway dependencies installed

REM --- 3. Trigger Engine ---
echo.
echo [3/4] Setting up Trigger Engine...
cd /d "%ROOT_DIR%\backend\trigger-engine"
pip install -r requirements.txt
echo ✓ Trigger Engine dependencies installed

REM --- 4. Fraud Engine ---
echo.
echo [4/4] Setting up Fraud Engine...
cd /d "%ROOT_DIR%\backend\fraud-engine"
pip install -r requirements.txt
echo ✓ Fraud Engine dependencies installed

REM --- 5. ML Dependencies ---
echo.
echo [Bonus] Installing ML dependencies...
pip install numpy pandas scikit-learn xgboost matplotlib seaborn joblib jupyter

REM --- 6. Create models dir ---
mkdir "%ROOT_DIR%\ml-model\models" 2>nul

echo.
echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo   1. Update backend\api-gateway\.env with your credentials
echo   2. Run: scripts\start-all.bat
echo.
pause
