@echo off
echo Starting Campus Fix Development Environment...
echo.
echo Starting Backend Server...
start "Campus Fix Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Server...
start "Campus Fix Frontend" cmd /k "npm run dev"
echo.
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause

