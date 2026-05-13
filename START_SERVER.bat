@echo off
title MSU Museum PWA Launcher
cls
echo ====================================================
echo    MSU Aga Khan Museum - Mobile Test Launcher
echo ====================================================
echo.

:: Get Local IP
for /f "tokens=4 delims= " %%i in ('route print ^| findstr 0.0.0.0 ^| findstr /V "127.0.0.1"') do set LOCAL_IP=%%i

echo [1] Starting local server on port 8080...
echo [2] Creating secure HTTPS tunnel for your phone...
echo.
echo ----------------------------------------------------
echo  STEP 1: Wait for the URL to appear below.
echo  STEP 2: Type that URL exactly into your phone.
echo  STEP 3: Click "Install" on your phone to test offline.
echo ----------------------------------------------------
echo.

:: Start the server in the background and localtunnel in the foreground
start /b npx http-server -p 8080 --cors
npx localtunnel --port 8080

pause
