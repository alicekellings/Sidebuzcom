@echo off
title SideBuz.com Local Dev Server
color 0A

echo.
echo ========================================
echo    SideBuz.com - Local Development
echo ========================================
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo [!] node_modules not found. Installing dependencies...
    echo.
    call npm install
    if errorlevel 1 (
        echo [X] npm install failed!
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed successfully!
    echo.
)

:: Check if .env exists
if not exist ".env" (
    echo [!] Warning: .env file not found!
    echo [!] AI features may not work without GROQ_API_KEY
    echo.
)

echo [*] Starting development server...
echo [*] Press Ctrl+C to stop
echo.
echo ----------------------------------------
echo    Local:   http://localhost:4321
echo    Network: Check terminal for IP
echo ----------------------------------------
echo.

:: Start the dev server
call npm run dev

pause
