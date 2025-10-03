# 🚀 Panduan Rebuild Aplikasi

## ✅ Perbaikan yang Sudah Diterapkan

### 1. Environment Variables
- ✅ Ditambahkan `EXPO_PUBLIC_*` prefix untuk mobile app
- ✅ Konfigurasi Supabase URL dan keys tersedia saat build
- ✅ API URL dan environment tersedia

### 2. Package Dependencies
- ✅ Upgrade Expo SDK 49 → **51**
- ✅ Upgrade React Native 0.72.10 → **0.74.5**
- ✅ Update 30+ packages ke versi kompatibel
- ✅ Hapus `expo-permissions` (deprecated)
- ✅ Android API Level 34 ready (requirement Google Play Store)

### 3. App Configuration
- ✅ Tambah required plugins: `expo-font`, `expo-secure-store`
- ✅ Environment variables mapping ke `app.config.ts`

## 📋 Langkah Rebuild

### Opsi 1: Build di EAS (Recommended)

#### A. Set Environment Variables di EAS

Jalankan command berikut satu per satu:

```bash
# Required - Supabase Config
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://fjequffxcontjvupgedh.supabase.co" --type string

eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZXF1ZmZ4Y29udGp2dXBnZWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjU1MjAsImV4cCI6MjA3NDY0MTUyMH0.RWDxO6Q5_o5lxaj83hi3OOBYbnI5vKSTEIQMb22fgaU" --type string

# Required - API & Environment
eas secret:create --name EXPO_PUBLIC_API_URL --value "https://api.sinomanapp.id" --type string

eas secret:create --name EXPO_PUBLIC_ENV --value "production" --type string

# Optional - Monitoring
eas secret:create --name EXPO_PUBLIC_SENTRY_DSN --value "your_sentry_dsn_if_available" --type string

eas secret:create --name EXPO_PUBLIC_SENTRY_RELEASE --value "1.0.0" --type string

# EAS Project ID (sudah ada di .env)
eas secret:create --name EAS_PROJECT_ID --value "06863a61-aa5a-4f34-b0e8-7be02c7514eb" --type string
```

#### B. Verify Secrets

```bash
eas secret:list
```

Pastikan semua secrets terlihat di list.

#### C. Build Preview APK (untuk testing)

```bash
# Build preview APK
eas build --profile preview --platform android
```

**Build time**: ~15-20 menit

#### D. Build Production AAB (untuk Play Store)

Setelah testing preview APK berhasil:

```bash
# Build production bundle
eas build --profile production --platform android
```

**Build time**: ~15-20 menit

### Opsi 2: Build Local (Butuh Android Studio)

```bash
# 1. Clear cache
npx expo start --clear

# 2. Install dependencies
npm install

# 3. Prebuild native folders
npx expo prebuild --clean

# 4. Build APK local
eas build --profile preview --platform android --local
```

## 🧪 Testing Checklist

Setelah APK berhasil di-download dan di-install:

### Critical Tests
- [ ] **App bisa dibuka** tanpa crash ✨ (paling penting!)
- [ ] **Login berhasil** → Berarti Supabase config OK
- [ ] **Data user muncul** → Berarti API connection OK

### Feature Tests
- [ ] Home screen load data
- [ ] Navigation antar screens
- [ ] QR Scanner (Camera permission)
- [ ] Biometric/Face ID login
- [ ] Push notifications (jika sudah ada Firebase setup)
- [ ] Image picker/upload
- [ ] Offline mode (jika ada)

### Performance Tests
- [ ] App responsive (tidak lag)
- [ ] Transisi smooth
- [ ] Loading states sesuai
- [ ] Error handling proper

## 🔍 Debugging Jika Masih Crash

### 1. Check Logcat (Android Debug)

```bash
# Connect device via USB with USB Debugging enabled
adb devices

# Monitor logs
adb logcat | grep -E "ReactNative|Expo|crash"
```

Cari error message seperti:
- `undefined is not an object` → Kemungkinan env variable kosong
- `Module not found` → Package tidak ter-install
- `Java exception` → Native module error

### 2. Check Build Logs di EAS

```bash
# Get build ID dari output eas build
eas build:view <BUILD_ID>

# Atau cek di web
https://expo.dev/accounts/your-account/projects/sinoman-mobile-app/builds
```

### 3. Test Environment Variables

Tambahkan debug log temporary di `App.tsx`:

```typescript
import Constants from 'expo-constants';

console.log('=== ENV CHECK ===');
console.log('Supabase URL:', Constants.expoConfig?.extra?.supabaseUrl);
console.log('API URL:', Constants.expoConfig?.extra?.apiUrl);
console.log('Environment:', Constants.expoConfig?.extra?.environment);
console.log('================');
```

Run dengan:
```bash
npx expo start
adb logcat | grep "ENV CHECK"
```

Jika semua `undefined` → Environment variables tidak ter-inject saat build.

### 4. Validate App Config

```bash
# Check compiled app config
npx expo config --type public

# Should show all environment variables
```

## 📊 Expected Build Sizes

- **Preview APK**: ~50-80 MB
- **Production AAB**: ~30-50 MB (lebih kecil karena bundle)

Jika ukuran terlalu besar (>150MB), ada masalah dengan asset bundling.

## 🎯 Success Criteria

Build berhasil jika:
1. ✅ APK size < 100 MB
2. ✅ App buka tanpa crash
3. ✅ Login berhasil
4. ✅ Semua fitur core berfungsi
5. ✅ No console errors di logcat

## 🚨 Common Issues & Solutions

### Issue 1: "undefined is not an object (evaluating 'supabase.auth')"
**Solusi**: Environment variables tidak tersedia
```bash
# Re-check EAS secrets
eas secret:list

# Rebuild dengan flag
eas build --profile production --platform android --clear-cache
```

### Issue 2: Build failed dengan "Metro bundler error"
**Solusi**: Clear cache
```bash
npx expo start --clear
rm -rf node_modules
npm install
eas build --profile production --platform android --clear-cache
```

### Issue 3: "Native module cannot be found"
**Solusi**: Package tidak compatible
```bash
npx expo install --check
npx expo install --fix
```

### Issue 4: App crash saat buka Camera/QR Scanner
**Solusi**: Permission tidak di-handle
- Cek `app.json` → `android.permissions` include `CAMERA`
- Cek code request permission sebelum akses camera

## 📞 Next Steps

Setelah build berhasil dan testing OK:

1. **Update Version Code**
   ```json
   // app.json
   {
     "expo": {
       "version": "1.0.1",
       "android": {
         "versionCode": 3  // increment dari 2 → 3
       }
     }
   }
   ```

2. **Build Production untuk Play Store**
   ```bash
   eas build --profile production --platform android
   ```

3. **Submit ke Play Store** (jika sudah ada akun developer)
   ```bash
   eas submit --profile production --platform android
   ```

4. **Monitor Errors di Sentry**
   - Login ke Sentry dashboard
   - Monitor crash reports dari production users

## 📚 Resources

- **Expo Docs**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Environment Variables**: https://docs.expo.dev/build-reference/variables/
- **Troubleshooting**: https://docs.expo.dev/build-reference/troubleshooting/

---

**Good luck with the build! 🎉**

Jika masih ada issue, share:
1. Build logs dari EAS
2. Logcat output dari device
3. Screenshot error message
