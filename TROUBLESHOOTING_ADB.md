# Troubleshooting: "adb.exe: device offline"

## ❌ Error yang Muncul
```
adb.exe: device offline
error: device offline
```

## ✅ Solusi Cepat (Recommended)

### Option 1: Jalankan Fix Script
```cmd
fix-adb-connection.bat
```

Script ini akan:
1. Kill semua proses ADB
2. Restart ADB server
3. Auto-detect port BlueStacks
4. Reconnect dengan benar

---

### Option 2: Manual Fix (Step by Step)

#### 1. Kill ADB dan Restart
```cmd
taskkill /F /IM adb.exe
adb kill-server
adb start-server
```

#### 2. Cek Port BlueStacks
Di BlueStacks:
1. Klik **Settings** (⚙️ icon)
2. Pilih **Advanced**
3. Cari **"Android Debug Bridge"**
4. Lihat port number (biasanya **5555** atau **5565**)
5. Pastikan **Enabled** (checklist)

#### 3. Connect dengan Port yang Benar
```cmd
# Jika port 5555
adb connect localhost:5555

# Jika port 5565
adb connect localhost:5565

# Verify
adb devices
```

Output yang benar:
```
List of devices attached
localhost:5555  device
```

❌ Jika muncul "offline":
```
List of devices attached
localhost:5555  offline
```

#### 4. Disconnect dan Reconnect
```cmd
adb disconnect localhost:5555
timeout /t 2
adb connect localhost:5555
timeout /t 3
adb devices
```

---

## 🔍 Root Cause Analysis

### Penyebab "device offline":

1. **BlueStacks belum sepenuhnya booting**
   - ✅ Tunggu sampai BlueStacks fully loaded
   - ✅ Lihat home screen sudah muncul

2. **ADB server conflict**
   - ✅ Ada instance ADB lain yang running
   - ✅ Emulator lain (Nox, Genymotion) sedang berjalan

3. **Port salah**
   - ✅ BlueStacks 4: biasanya port 5555
   - ✅ BlueStacks 5: biasanya port 5565
   - ✅ Multiple instances: port berbeda-beda

4. **ADB not enabled di BlueStacks**
   - ✅ Settings > Advanced > Enable ADB

5. **Firewall blocking**
   - ✅ Windows Firewall block ADB connection
   - ✅ Allow ADB di firewall

---

## 🛠️ Complete Troubleshooting Steps

### Step 1: Verify BlueStacks is Running
```cmd
# Check if BlueStacks process exists
tasklist | findstr BlueStacks
```

Harus muncul beberapa proses BlueStacks.

### Step 2: Clean ADB State
```cmd
# Kill all ADB
taskkill /F /IM adb.exe

# Remove ADB server files (optional)
# del %USERPROFILE%\.android\adbkey*

# Start fresh
adb kill-server
adb start-server
```

### Step 3: Find Correct Port
```cmd
# Try common ports
adb connect localhost:5555
adb devices

# If offline, try next port
adb connect localhost:5565
adb devices

# If still offline, try
adb connect localhost:5575
adb devices
```

### Step 4: Check BlueStacks Multi-Instance
Jika pakai **Multi-Instance Manager**:
```cmd
# Each instance has different port
# Instance 1: 5555
# Instance 2: 5565
# Instance 3: 5575
```

Klik instance yang aktif, check portnya.

### Step 5: Restart BlueStacks Completely
```cmd
# Close BlueStacks
taskkill /F /IM BlueStacks.exe
taskkill /F /IM HD-Player.exe
timeout /t 3

# Start BlueStacks again
# Wait for it to fully load

# Then reconnect
adb kill-server
adb start-server
adb connect localhost:5555
```

---

## 🚀 Using the Updated Script

Script baru **test-bluestacks-v2.bat** sudah include auto-fix:

```cmd
test-bluestacks-v2.bat
```

**Features:**
- ✅ Auto kill old ADB processes
- ✅ Auto restart ADB server
- ✅ Try multiple ports (5555 & 5565)
- ✅ Better error messages
- ✅ Verify installation before testing
- ✅ More detailed logging

---

## 📋 Pre-Flight Checklist

Sebelum run test script, pastikan:

- [ ] BlueStacks sudah **fully loaded** (home screen visible)
- [ ] ADB **enabled** di BlueStacks Settings > Advanced
- [ ] **Tidak ada** emulator lain yang running (Nox, Genymotion, etc)
- [ ] **Tidak ada** Android Studio emulator yang running
- [ ] APK file **sudah di-download** dan rename ke `sinoman-mobile-app.apk`
- [ ] Windows Firewall **allow** ADB connection

---

## 🔧 Advanced Debugging

### Check ADB Server Status
```cmd
adb nodaemon server
```

Tekan Ctrl+C untuk stop. Jika ada error akan terlihat.

### Check Which Process Using Port
```cmd
netstat -ano | findstr :5555
```

Jika port sudah dipakai proses lain, kill process tersebut.

### Enable ADB Debug Logging
```cmd
set ADB_TRACE=all
adb devices
```

Akan show verbose logging dari ADB.

### Check BlueStacks ADB
```cmd
# Check if BlueStacks has its own ADB
dir "C:\Program Files\BlueStacks*\HD-Adb.exe"

# If exists, use BlueStacks ADB
"C:\Program Files\BlueStacks_nxt\HD-Adb.exe" devices
```

---

## ✅ Success Indicators

Jika berhasil, output `adb devices` harus seperti ini:

```
List of devices attached
localhost:5555         device product:rk3188 model:rk30sdk device:rk30sdk
```

**Key indicators:**
- ✅ Status: `device` (NOT "offline", NOT "unauthorized")
- ✅ Product name muncul
- ✅ Model name muncul

---

## 🆘 Still Having Issues?

Jika masih error setelah semua step di atas:

### 1. Update Platform Tools
```cmd
# Download latest from:
# https://developer.android.com/studio/releases/platform-tools

# Extract and replace adb.exe
```

### 2. Reinstall BlueStacks
- Uninstall BlueStacks completely
- Delete folder: `C:\ProgramData\BlueStacks*`
- Install latest version
- Enable ADB immediately after install

### 3. Use Alternative Method
Install APK via drag-and-drop:
1. Download APK from EAS
2. Drag APK file ke BlueStacks window
3. Wait for auto-installation
4. Launch app manually

Manual logging:
```cmd
# Connect first
adb connect localhost:5555

# Then start logging
adb logcat > manual-logs.txt

# In another terminal, launch app manually in BlueStacks
```

---

## 📞 Quick Commands Reference

```cmd
# Restart everything
adb kill-server && adb start-server && adb connect localhost:5555

# Full reset
taskkill /F /IM adb.exe && timeout /t 2 && adb kill-server && adb start-server && adb connect localhost:5555 && adb devices

# Check connection
adb devices -l

# Test command
adb shell pm list packages | findstr sinoman

# Force reconnect
adb disconnect localhost:5555 && adb connect localhost:5555
```

---

## 📝 Next Steps After Fix

Once ADB connection is working:

1. **Run test script:**
   ```cmd
   test-bluestacks-v2.bat
   ```

2. **Verify app launches** in BlueStacks window

3. **Check logs** in `test-logs/` folder

4. **Report any app bugs** found during testing

---

**Last Updated:** 2025-10-05
