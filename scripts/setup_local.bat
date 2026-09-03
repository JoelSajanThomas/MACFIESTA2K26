@echo off
REM =============================================================================
REM MacFiesta Pro — Windows Local Setup & Verification Script
REM Sets up backend venv, installs requirements, runs migrations on SQLite,
REM runs collectstatic, and builds the frontend.
REM =============================================================================

echo ============================================================
echo   MacFiesta Pro Local Setup (Windows)
echo ============================================================

cd /d "%~dp0\..\backend"

echo [1/4] Checking Python Virtual Environment...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo [2/4] Installing Python requirements...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo [3/4] Running migrations on SQLite database (db.sqlite3)...
python manage.py migrate --noinput

echo [4/4] Running collectstatic...
python manage.py collectstatic --noinput

echo.
echo ============================================================
echo   Backend is ready!
echo   To run the backend development server:
echo       cd backend ^&^& venv\Scripts\activate ^&^& python manage.py runserver
echo.
echo   To run the frontend development server:
echo       cd frontend ^&^& npm run dev
echo ============================================================
pause
