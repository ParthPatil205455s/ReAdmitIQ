@echo off
echo ===================================================
echo   Starting ReAdmitIQ Platform (Backend & Frontend)
echo ===================================================

echo.
echo Launching Backend Server on http://localhost:8000 ...
start "ReAdmitIQ Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo.
echo Launching Frontend Application on http://localhost:5173/ReAdmitIQ/ ...
start "ReAdmitIQ Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both services are starting in separate windows!
echo Backend API Docs: http://localhost:8000/docs
echo Frontend App:      http://localhost:5173/ReAdmitIQ/
echo.
