@echo off
REM Script untuk Fix ADB Connection ke BlueStacks
REM Solusi untuk "device offline" error

echo ============================================
echo Fix ADB Connection to BlueStacks
echo ============================================
echo.

echo [1/6] Killing all ADB processes...
taskkill /F /IM adb.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo OK - ADB processes killed
echo.

echo [2/6] Restarting ADB server...
adb kill-server
timeout /t 2 /nobreak >nul
adb start-server
timeout /t 3 /nobreak >nul
echo OK - ADB server restarted
echo.

echo [3/6] Checking BlueStacks ADB port...
echo Please check BlueStacks Settings:
echo   1. Open BlueStacks
echo   2. Click Settings (gear icon)
echo   3. Go to Advanced
echo   4. Find "Android Debug Bridge" section
echo   5. Note the port number (usually 5555 or 5565)
echo.
set /p PORT="Enter BlueStacks ADB port (default 5555): " || set PORT=5555
echo Using port: %PORT%
echo.

echo [4/6] Disconnecting existing connections...
adb disconnect localhost:%PORT% >nul 2>&1
adb disconnect 127.0.0.1:%PORT% >nul 2>&1
timeout /t 2 /nobreak >nul
echo OK - Disconnected
echo.

echo [5/6] Connecting to BlueStacks...
adb connect localhost:%PORT%
timeout /t 3 /nobreak >nul
echo.

echo [6/6] Verifying connection...
adb devices -l
echo.

REM Check if device is online
adb devices | findstr "device$" >nul
if errorlevel 1 (
    echo ============================================
    echo ERROR: Device still offline or not found!
    echo ============================================
    echo.
    echo Troubleshooting Steps:
    echo.
    echo 1. Make sure BlueStacks is RUNNING
    echo 2. Enable ADB in BlueStacks:
    echo    - Settings ^> Advanced
    echo    - Enable "Android Debug Bridge"
    echo    - Note the port number
    echo.
    echo 3. Try different ports:
    echo    - 5555 (default)
    echo    - 5565 (BlueStacks 5)
    echo    - 5575 (if you have multiple instances)
    echo.
    echo 4. Restart BlueStacks completely
    echo.
    echo 5. Check if another emulator is running
    echo    (Nox, Genymotion, etc - they conflict with ADB)
    echo.
    pause
    exit /b 1
) else (
    echo ============================================
    echo SUCCESS: Device is online!
    echo ============================================
    echo.
    echo You can now run: test-bluestacks.bat
    echo.
    pause
)
