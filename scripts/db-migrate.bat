@echo off
REM ============================================================
REM GigShield - Database Migration (Windows)
REM ============================================================

set ROOT_DIR=%~dp0..
set SCHEMA_FILE=%ROOT_DIR%\docs\db-schema.sql

echo ==========================================
echo   GigShield - Database Migration
echo ==========================================

REM Load DATABASE_URL from .env if exists
if exist "%ROOT_DIR%\backend\api-gateway\.env" (
    for /f "tokens=1,2 delims==" %%a in (%ROOT_DIR%\backend\api-gateway\.env) do (
        if "%%a"=="DATABASE_URL" set DATABASE_URL=%%b
    )
)

if "%DATABASE_URL%"=="" (
    echo DATABASE_URL not set.
    echo.
    set /p DATABASE_URL="Enter DATABASE_URL (or press Enter for localhost): "
    if "%DATABASE_URL%"=="" set DATABASE_URL=postgresql://localhost:5432/gigshield
)

echo.
echo Running schema: %SCHEMA_FILE%
echo.

where psql >nul 2>&1
if %ERRORLEVEL%==0 (
    psql "%DATABASE_URL%" -f "%SCHEMA_FILE%"
    echo.
    echo ✓ Migration complete!
) else (
    echo psql not found.
    echo.
    echo Alternatives:
    echo   1. Install PostgreSQL and add psql to PATH
    echo   2. Use Supabase SQL Editor: paste contents of docs\db-schema.sql
    echo   3. Use pgAdmin to import the SQL file
)

echo.
pause
