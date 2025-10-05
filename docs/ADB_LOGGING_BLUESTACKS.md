# ADB Logging untuk Testing di BlueStacks

## Prerequisites

1. **Android SDK Platform Tools** terinstall
2. **BlueStacks** berjalan
3. **ADB** di PATH environment variable

## Setup ADB Connection

### 1. Enable ADB di BlueStacks
```
Settings → Advanced → Android Debug Bridge (ADB) → Enable
```

### 2. Connect ADB ke BlueStacks
```bash
# Default port BlueStacks: 5555
adb connect localhost:5555

# Atau cek port yang digunakan di BlueStacks settings
adb connect localhost:PORT_NUMBER

# Verify connection
adb devices
```

Output yang diharapkan:
```
List of devices attached
localhost:5555  device
```

## Install APK dengan Logging

### Install APK
```bash
# Download APK dari EAS
# Link: https://expo.dev/accounts/arielampar/projects/sinoman-mobile-app/builds/2d245cc8-b9d4-4720-b97a-1ff4d66f242c

# Install APK dengan logging
adb install -r sinoman-mobile-app.apk

# Atau install dengan verbose logging
adb install -r -d sinoman-mobile-app.apk 2>&1 | tee install.log
```

### Flags untuk Install:
- `-r`: Reinstall existing app (keep data)
- `-d`: Allow version code downgrade
- `-g`: Grant all runtime permissions
- `-t`: Allow test packages

### Install dengan Semua Permissions
```bash
adb install -r -g sinoman-mobile-app.apk
```

## Real-time Logging Saat Run App

### 1. Basic Logcat (All Logs)
```bash
# Start logging
adb logcat

# Clear existing logs first
adb logcat -c && adb logcat
```

### 2. Filter Logs untuk Sinoman App
```bash
# Filter by package name
adb logcat | grep -i "sinoman"

# Filter by tag
adb logcat -s ReactNativeJS:V

# Multiple filters
adb logcat -s ReactNativeJS:V ReactNative:V
```

### 3. Save Logs to File
```bash
# Save all logs
adb logcat > sinoman-app-logs.txt

# Save with timestamp
adb logcat -v time > sinoman-app-$(date +%Y%m%d-%H%M%S).log

# Save filtered logs
adb logcat | grep -i "sinoman" > sinoman-filtered.log
```

### 4. Advanced Logging dengan Format
```bash
# Detailed format dengan timestamp
adb logcat -v threadtime

# Brief format
adb logcat -v brief

# Long format (all details)
adb logcat -v long
```

## Logging Saat Launch App

### Complete Launch Logging Script
```bash
#!/bin/bash
# File: log-sinoman-launch.sh

APP_PACKAGE="id.sinomanapp.mobile"
LOG_FILE="sinoman-launch-$(date +%Y%m%d-%H%M%S).log"

echo "=== Starting Sinoman App Logging ===" | tee $LOG_FILE
echo "Timestamp: $(date)" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# Clear existing logs
echo "Clearing old logs..." | tee -a $LOG_FILE
adb logcat -c

# Start logging in background
echo "Starting logcat..." | tee -a $LOG_FILE
adb logcat -v threadtime > $LOG_FILE 2>&1 &
LOGCAT_PID=$!

# Launch the app
echo "Launching app..." | tee -a $LOG_FILE
adb shell am start -n $APP_PACKAGE/.MainActivity

# Wait for user input to stop
echo "App launched. Logging in progress..."
echo "Press Ctrl+C to stop logging"

# Wait for interrupt
trap "kill $LOGCAT_PID; echo 'Logging stopped. Check $LOG_FILE'; exit" INT
wait
```

### Run the Script
```bash
chmod +x log-sinoman-launch.sh
./log-sinoman-launch.sh
```

## Monitoring Specific Events

### 1. Monitor Crashes
```bash
# Monitor crash logs
adb logcat -s AndroidRuntime:E

# Save crash logs
adb logcat -s AndroidRuntime:E > crashes.log
```

### 2. Monitor React Native Errors
```bash
# React Native specific
adb logcat ReactNativeJS:V ReactNative:V *:S

# Save to file
adb logcat ReactNativeJS:V ReactNative:V *:S > rn-errors.log
```

### 3. Monitor Network Requests
```bash
# OkHttp network logging
adb logcat | grep -i "okhttp"

# Supabase requests
adb logcat | grep -i "supabase"
```

### 4. Monitor Specific Features
```bash
# Authentication logs
adb logcat | grep -i "auth\|login\|otp"

# Database logs
adb logcat | grep -i "database\|sqlite\|supabase"

# Navigation logs
adb logcat | grep -i "navigation\|route"
```

## Performance Monitoring

### 1. CPU & Memory Usage
```bash
# CPU usage
adb shell top -n 1 | grep sinoman

# Memory usage
adb shell dumpsys meminfo id.sinomanapp.mobile

# Continuous monitoring
watch -n 2 'adb shell dumpsys meminfo id.sinomanapp.mobile | grep TOTAL'
```

### 2. Battery Usage
```bash
adb shell dumpsys batterystats id.sinomanapp.mobile
```

### 3. Network Stats
```bash
adb shell dumpsys package id.sinomanapp.mobile | grep -i network
```

## Screenshot & Screen Recording

### Take Screenshot
```bash
# Take screenshot
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshots/

# With timestamp
adb shell screencap /sdcard/sinoman-$(date +%Y%m%d-%H%M%S).png
adb pull /sdcard/sinoman-*.png ./screenshots/
```

### Screen Recording
```bash
# Start recording (max 180 seconds)
adb shell screenrecord /sdcard/sinoman-test.mp4

# Stop with Ctrl+C, then pull
adb pull /sdcard/sinoman-test.mp4 ./recordings/

# With time limit (60 seconds)
adb shell screenrecord --time-limit 60 /sdcard/sinoman-test.mp4
```

## Complete Testing Script

### File: `test-with-logs.sh`
```bash
#!/bin/bash

APP_PACKAGE="id.sinomanapp.mobile"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_DIR="./test-logs/$TIMESTAMP"

# Create log directory
mkdir -p $LOG_DIR

echo "=== Sinoman App Testing with Logging ==="
echo "Timestamp: $TIMESTAMP"
echo "Log directory: $LOG_DIR"
echo ""

# 1. Connect to BlueStacks
echo "Connecting to BlueStacks..."
adb connect localhost:5555
adb devices

# 2. Install APK
echo "Installing APK..."
adb install -r -g sinoman-mobile-app.apk 2>&1 | tee $LOG_DIR/install.log

# 3. Clear old logs
echo "Clearing old logs..."
adb logcat -c

# 4. Start comprehensive logging
echo "Starting logging..."
adb logcat -v threadtime > $LOG_DIR/full-logcat.log 2>&1 &
LOGCAT_PID=$!

adb logcat ReactNativeJS:V ReactNative:V *:S > $LOG_DIR/react-native.log 2>&1 &
RN_PID=$!

# 5. Launch app
echo "Launching app..."
adb shell am start -n $APP_PACKAGE/.MainActivity

# 6. Monitor for 60 seconds
echo "Monitoring app for 60 seconds..."
for i in {60..1}; do
    echo -ne "Time remaining: $i seconds\r"
    sleep 1
done
echo ""

# 7. Take screenshot
echo "Taking screenshot..."
adb shell screencap /sdcard/screenshot-$TIMESTAMP.png
adb pull /sdcard/screenshot-$TIMESTAMP.png $LOG_DIR/

# 8. Get memory stats
echo "Collecting memory stats..."
adb shell dumpsys meminfo $APP_PACKAGE > $LOG_DIR/memory-stats.txt

# 9. Stop logging
echo "Stopping logcat..."
kill $LOGCAT_PID
kill $RN_PID

# 10. Summary
echo ""
echo "=== Testing Complete ==="
echo "Logs saved to: $LOG_DIR"
echo ""
echo "Files created:"
ls -lh $LOG_DIR/

echo ""
echo "To analyze logs:"
echo "  grep -i error $LOG_DIR/full-logcat.log"
echo "  grep -i crash $LOG_DIR/react-native.log"
```

### Run Complete Test
```bash
chmod +x test-with-logs.sh
./test-with-logs.sh
```

## Analyze Logs

### Search for Errors
```bash
# All errors
grep -i error sinoman-app-logs.txt

# Crashes
grep -i "crash\|exception\|fatal" sinoman-app-logs.txt

# Specific component errors
grep -i "auth.*error\|login.*error" sinoman-app-logs.txt
```

### Count Error Types
```bash
# Count errors by type
grep -i error sinoman-app-logs.txt | cut -d: -f5 | sort | uniq -c | sort -rn
```

### Extract Timestamps
```bash
# Errors with timestamps
grep -i error sinoman-app-logs.txt | awk '{print $1, $2, $3}'
```

## Common Issues & Solutions

### 1. ADB Connection Issues
```bash
# Kill ADB server and restart
adb kill-server
adb start-server
adb connect localhost:5555

# Check BlueStacks port
# Settings → Advanced → Check ADB port number
```

### 2. App Not Installing
```bash
# Uninstall old version first
adb uninstall id.sinomanapp.mobile

# Install fresh
adb install sinoman-mobile-app.apk

# Check installation errors
adb install sinoman-mobile-app.apk 2>&1 | grep -i error
```

### 3. No Logs Appearing
```bash
# Check if app is running
adb shell ps | grep sinoman

# Check logcat buffer size
adb logcat -g

# Increase buffer if needed (requires root)
adb logcat -G 16M
```

### 4. Logcat Too Verbose
```bash
# Filter noise
adb logcat *:E  # Only errors
adb logcat *:W  # Warnings and above
adb logcat *:I  # Info and above

# Exclude specific tags
adb logcat -v threadtime -s ReactNativeJS:V *:E
```

## Quick Reference Commands

```bash
# Connect
adb connect localhost:5555

# Install
adb install -r -g sinoman-mobile-app.apk

# Launch
adb shell am start -n id.sinomanapp.mobile/.MainActivity

# Basic logs
adb logcat | grep -i sinoman

# Save logs
adb logcat > logs.txt

# Clear logs
adb logcat -c

# Screenshot
adb shell screencap /sdcard/shot.png && adb pull /sdcard/shot.png

# Memory
adb shell dumpsys meminfo id.sinomanapp.mobile

# Uninstall
adb uninstall id.sinomanapp.mobile

# Disconnect
adb disconnect localhost:5555
```

## Automated Testing Loop

```bash
# File: continuous-test.sh
#!/bin/bash

for i in {1..10}; do
    echo "=== Test Run $i ==="

    # Launch app
    adb shell am start -n id.sinomanapp.mobile/.MainActivity

    # Wait and monitor
    sleep 30

    # Take screenshot
    adb shell screencap /sdcard/test-$i.png
    adb pull /sdcard/test-$i.png ./screenshots/

    # Kill app
    adb shell am force-stop id.sinomanapp.mobile

    # Wait before next run
    sleep 5
done
```

## Export Test Report

```bash
# Generate HTML report
cat > test-report.html <<EOF
<html>
<head><title>Sinoman App Test Report</title></head>
<body>
<h1>Test Report - $(date)</h1>
<h2>Installation Log</h2>
<pre>$(cat install.log)</pre>
<h2>Runtime Errors</h2>
<pre>$(grep -i error full-logcat.log)</pre>
<h2>Screenshots</h2>
$(for img in screenshots/*.png; do echo "<img src='$img' width='300'/>"; done)
</body>
</html>
EOF
```

Semua perintah ini akan membantu Anda melakukan testing dan debugging yang comprehensive di BlueStacks! 🚀
