# Perbaikan Masalah Crash APK

## Masalah yang Ditemukan

Aplikasi crash saat dibuka karena 3 masalah utama:

### 1. Environment Variables Tidak Tersedia ❌
- File `.env` menggunakan prefix `NEXT_PUBLIC_*` (untuk Next.js)
- `app.config.ts` mengharapkan prefix `EXPO_PUBLIC_*`
- Saat build, semua environment variables menjadi `undefined`
- **Dampak**: Supabase URL dan keys tidak tersedia → aplikasi crash

### 2. Versi Package Tidak Kompatibel ❌
- Banyak package menggunakan versi untuk Expo SDK 49
- Beberapa package versi sangat tidak cocok:
  - `@expo/config-plugins@54.0.2` → seharusnya `~7.2.2`
  - `react-native@0.72.6` → seharusnya `0.72.10`
  - Dan 20+ package lainnya
- **Dampak**: Runtime error dan crash

### 3. Android API Level Terlalu Rendah ❌
- Expo SDK 49 target Android API level 33
- Google Play Store sejak Agustus 2024 wajib API level 34+
- **Dampak**: Tidak bisa submit ke Play Store + possible crash di Android 14+

## Solusi yang Diterapkan ✅

### 1. Update Environment Variables
**File**: `.env`

Ditambahkan variabel dengan prefix yang benar:
```env
# Expo Public Environment Variables (for mobile app)
EXPO_PUBLIC_SUPABASE_URL=https://fjequffxcontjvupgedh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-key>
EXPO_PUBLIC_API_URL=https://api.sinomanapp.id
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_SENTRY_RELEASE=1.0.0
```

### 2. Upgrade ke Expo SDK 51
**File**: `package.json`

```json
{
  "expo": "~51.0.0"
}
```

**Benefit**:
- Support Android API level 34 secara default
- React Native 0.74.5 (lebih stabil)
- Kompatibilitas lebih baik dengan dependencies terbaru

### 3. Update Semua Dependencies
Semua package di-update ke versi yang kompatibel dengan Expo SDK 51:

**React Native & Core:**
- `react-native`: 0.72.10 → **0.74.5**
- `react`: 18.2.0 (tetap)

**Expo Packages:**
- `expo-camera`: 13.4.4 → **15.0.16**
- `expo-notifications`: 0.20.1 → **0.28.19**
- `expo-updates`: 0.18.19 → **0.25.28**
- `expo-image`: 1.3.5 → **1.13.0**
- Dan 15+ package expo lainnya

**React Native Community:**
- `@react-native-async-storage/async-storage`: 1.18.2 → **1.23.1**
- `@react-native-community/netinfo`: 9.3.10 → **11.3.1**
- `react-native-svg`: 13.9.0 → **15.2.0**
- `react-native-screens`: 3.22.1 → **3.31.1**
- `react-native-safe-area-context`: 4.6.3 → **4.10.5**
- `react-native-reanimated`: 3.3.0 → **3.10.1**
- `react-native-gesture-handler`: 2.12.1 → **2.16.1**

**Sentry:**
- `@sentry/react-native`: 5.10.0 → **5.24.3**

**Dev Dependencies:**
- `jest-expo`: 49.0.0 → **51.0.4**
- `typescript`: 5.9.3 → **5.3.3**

### 4. Update App Config
**File**: `app.config.ts`

Ditambahkan plugins yang required:
```typescript
plugins: [
  'expo-font',
  'expo-secure-store',
  ...(config.plugins || []),
],
```

### 5. Hapus Package yang Deprecated
Removed: `expo-permissions` (deprecated sejak SDK 41)

Ganti dengan permission methods langsung di masing-masing module:
```typescript
// SEBELUM (deprecated)
import * as Permissions from 'expo-permissions';
await Permissions.askAsync(Permissions.CAMERA);

// SESUDAH (recommended)
import { Camera } from 'expo-camera';
await Camera.requestCameraPermissionsAsync();
```

## Status Validasi ✅

```bash
npx expo-doctor
```

**Result**: ✅ **15/16 checks passed**

1 warning tersisa (tidak kritis):
- ⚠️ Warning tentang `app.json` vs `app.config.ts` - tidak mempengaruhi build

## Langkah Build Ulang

### 1. Bersihkan Cache
```bash
# Clear Metro bundler cache
npx expo start --clear

# Atau clear semua
rm -rf node_modules
npm install
```

### 2. Build Production APK
```bash
# Preview build (APK)
eas build --profile preview --platform android

# Production build (AAB untuk Play Store)
eas build --profile production --platform android
```

### 3. Testing Checklist
- [ ] App bisa dibuka tanpa crash
- [ ] Login berhasil (berarti Supabase config OK)
- [ ] Semua fitur utama berfungsi
- [ ] Camera/QR scanner berfungsi (expo-camera upgraded)
- [ ] Notifications berfungsi (expo-notifications upgraded)
- [ ] Biometric/Face ID berfungsi

## Environment Variables yang Dibutuhkan

Pastikan semua variabel berikut sudah diset di EAS Secrets:

```bash
# Required
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_API_URL
EXPO_PUBLIC_ENV

# Optional (recommended)
EXPO_PUBLIC_SENTRY_DSN
EXPO_PUBLIC_SENTRY_RELEASE
EAS_PROJECT_ID
```

Set di EAS:
```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://fjequffxcontjvupgedh.supabase.co"
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
eas secret:create --name EXPO_PUBLIC_API_URL --value "https://api.sinomanapp.id"
eas secret:create --name EXPO_PUBLIC_ENV --value "production"
```

## Debug Tips

Jika masih crash setelah build ulang:

### 1. Check Logcat (Android)
```bash
adb logcat | grep -i "ReactNative"
```

### 2. Check Sentry (jika sudah setup)
- Login ke Sentry dashboard
- Check error di project sinoman-mobile-app
- Lihat stack trace untuk error spesifik

### 3. Test Local Build
```bash
# Build APK di local (butuh Android Studio)
eas build --profile preview --platform android --local
```

### 4. Verify Environment Variables
Tambahkan debug log di `App.tsx`:
```typescript
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
```

Jika masih `undefined` → environment variables belum ter-inject saat build.

## Breaking Changes yang Perlu Diperhatikan

### Expo SDK 49 → 51

1. **expo-camera API changes**
   - Method signatures mungkin berbeda
   - Check docs: https://docs.expo.dev/versions/v51.0.0/sdk/camera/

2. **expo-notifications API changes**
   - Handling permission berbeda
   - Check docs: https://docs.expo.dev/versions/v51.0.0/sdk/notifications/

3. **React Native 0.74.5 changes**
   - New architecture ready (optional)
   - Better performance tapi perlu testing

### Migration Path

Jika ada error saat testing, cek:
1. Import statements yang deprecated
2. API calls yang berubah
3. Permission handling yang lama

## Next Steps

1. ✅ Build ulang di EAS dengan profile production
2. ✅ Download dan test APK di real device
3. ✅ Pastikan semua fitur berfungsi
4. ✅ Submit ke Google Play Store (jika sudah OK)

## Contacts untuk Support

- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **Supabase Docs**: https://supabase.com/docs
