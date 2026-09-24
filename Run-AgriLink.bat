@echo off
setlocal
title AgriLink - Kisan Market & Price Discovery App

echo ======================================================================
echo    AgriLink: Market Linkages & Price Discovery Platform
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Verifying environment...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH. Please install Node.js.
    pause
    exit /b 1
)

echo.
echo ======================================================================
echo    HOW TO OPEN ON YOUR PHONE:
echo    - Same Wi-Fi Network:  http://192.168.0.12:5000
echo    - Share Worldwide:     https://agrilink-market.loca.lt
echo ======================================================================
echo.

echo [2/3] Launching web browser at http://localhost:5000 ...
timeout /t 2 /nobreak >nul
start "" http://localhost:5000

echo [3/3] Starting AgriLink Server...
echo Server running on http://localhost:5000
echo Close this window to stop the server.
echo ======================================================================
echo.

node server/server.js

pause
