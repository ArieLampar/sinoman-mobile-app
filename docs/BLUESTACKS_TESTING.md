# Testing di BlueStacks Emulator

## Prerequisites

1. **BlueStacks 5** atau versi lebih baru terinstall
2. **APK Preview Build** dari Sinoman Mobile App
3. **Android 7.0 (Nougat)** atau lebih tinggi di BlueStacks

## Cara Install APK di BlueStacks

### Method 1: Drag & Drop (Paling Mudah)
1. Buka BlueStacks emulator
2. Drag file APK dari folder ke window BlueStacks
3. Tunggu proses instalasi selesai
4. Aplikasi akan muncul di home screen BlueStacks

### Method 2: Install APK Manager
1. Buka BlueStacks
2. Klik "Install APK" di sidebar kiri
3. Pilih file APK (biasanya di folder `build` atau download dari EAS)
4. Tunggu instalasi selesai

### Method 3: ADB Command Line
```bash
# Pastikan BlueStacks berjalan
# Default ADB port untuk BlueStacks: 5555

# Connect ke BlueStacks
adb connect localhost:5555

# Install APK
adb install path/to/sinoman-mobile-app.apk

# Atau jika sudah terinstall, gunakan -r untuk reinstall
adb install -r path/to/sinoman-mobile-app.apk
```

## Lokasi APK Build

### Local Build (EAS)
```
c:\Dev\Projects\sinoman-mobile-app\build-*.apk
```

### Cloud Build (EAS)
Download dari link yang diberikan setelah build selesai di EAS

## Testing Checklist

### 1. Installation & Launch
- [ ] APK terinstall tanpa error
- [ ] App icon muncul di home screen
- [ ] App launch successfully
- [ ] Splash screen tampil dengan benar

### 2. Authentication
- [ ] Login screen tampil
- [ ] Input nomor telepon berfungsi
- [ ] OTP dikirim ke WhatsApp
- [ ] Input OTP berfungsi
- [ ] Login berhasil

### 3. Dashboard
- [ ] Dashboard loading dengan benar
- [ ] Balance card tampil
- [ ] Quick actions berfungsi
- [ ] Banner carousel berjalan
- [ ] Recent transactions tampil

### 4. Navigation
- [ ] Bottom tab navigation berfungsi
- [ ] Navigate ke Savings tab
- [ ] Navigate ke QR Scanner tab
- [ ] Navigate ke Notifications tab
- [ ] Navigate ke Profile tab

### 5. Features
- [ ] Savings screen menampilkan data
- [ ] Chart rendering dengan benar
- [ ] Transaction history loading
- [ ] QR Scanner menampilkan fallback message (camera tidak tersedia di emulator)
- [ ] Notifications list loading
- [ ] Profile data tampil

### 6. Performance
- [ ] App responsive saat navigasi
- [ ] Tidak ada lag signifikan
- [ ] Memory usage normal
- [ ] Tidak ada crash saat menggunakan fitur

### 7. Offline Mode
- [ ] Disconnect network
- [ ] App menampilkan offline indicator
- [ ] Basic features tetap berfungsi
- [ ] Data cached tampil

## Known Issues di Emulator

### Camera/QR Scanner
- ❌ **Tidak berfungsi** di emulator
- ✅ App menampilkan fallback message yang user-friendly
- 📝 Test di physical device untuk fitur camera

### Biometric Authentication
- ❌ **Tidak berfungsi** di BlueStacks (tergantung setup)
- ✅ App fallback ke PIN/password authentication
- 📝 Test di physical device dengan fingerprint/face unlock

### Native Modules (Dev Mode)
Beberapa native modules tidak tersedia di development mode:
- JailMonkey (device security check)
- MMKV (storage)
- Firebase (jika tidak dikonfigurasi)

Ini normal dan akan berfungsi di production build.

## Troubleshooting

### APK Tidak Bisa Diinstall
1. **Cek signature**: Uninstall versi lama dulu
2. **Cek Android version**: Pastikan minimal Android 7.0
3. **Cek storage**: Pastikan BlueStacks punya cukup space

### App Crash Saat Launch
1. **Check logs** via ADB:
   ```bash
   adb logcat | grep -i "sinoman"
   ```
2. **Clear cache** BlueStacks
3. **Reinstall** APK

### Performance Lambat
1. **Increase RAM** allocation di BlueStacks settings
2. **Enable Hardware Virtualization** di BIOS
3. **Close** aplikasi lain yang berat

### Network Issues
1. **Check** BlueStacks network settings
2. **Restart** BlueStacks
3. **Allow** app permissions untuk network

## BlueStacks Configuration

### Recommended Settings
```
Display:
- Resolution: 1920x1080 (Full HD)
- DPI: 240
- FPS: 60

Performance:
- CPU cores: 4
- RAM: 4 GB
- Performance mode: High

Advanced:
- ADB: Enabled (for debugging)
- Root: Disabled (unless needed)
```

### Enable ADB Debugging
1. BlueStacks Settings → Advanced
2. Check "Android Debug Bridge"
3. Note down the port (default: 5555)

## Comparing with Physical Device

| Feature | BlueStacks | Physical Device |
|---------|-----------|----------------|
| Basic UI/Navigation | ✅ Same | ✅ Same |
| Authentication | ✅ Same | ✅ Same |
| Data Loading | ✅ Same | ✅ Same |
| Camera/QR | ❌ Not available | ✅ Full support |
| Biometric | ⚠️ Limited | ✅ Full support |
| Performance | ⚠️ Slower | ✅ Native speed |
| Push Notifications | ✅ Works | ✅ Works |

## Next Steps After Testing

1. ✅ **Verify** all critical features work
2. ✅ **Document** any bugs found
3. ✅ **Test** on physical device for camera features
4. ✅ **Prepare** for production build
5. ✅ **Submit** to Play Store (when ready)

## Contact & Support

Jika menemukan issues saat testing:
1. Screenshot error message
2. Check `adb logcat` untuk detail error
3. Document steps to reproduce
4. Report ke development team
