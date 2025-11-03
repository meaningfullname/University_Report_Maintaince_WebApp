@echo off
echo ========================================
echo   Starting Campus Fix ML Service
echo ========================================
echo.
echo Checking Python installation...
python --version
echo.
echo Starting ML API on http://localhost:8000
echo.
python ml_api.py
pause

