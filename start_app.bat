@echo off
title Hamburger Review App Server
echo ==========================================
echo   Starting Hamburger Review App...
echo ==========================================
echo.
echo Access the app at: http://localhost:8000
echo (The browser will open automatically)
echo.
echo To stop the server, close this window or press Ctrl+C.
echo.

cd backend

:: Open browser
start "" "http://localhost:8000"

:: Start the server
pipenv run uvicorn main:app --host 0.0.0.0 --port 8000

pause
