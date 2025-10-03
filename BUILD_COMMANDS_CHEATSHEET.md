# 🚀 BUILD COMMANDS CHEAT SHEET

## QUICK START (Copy-Paste Ready)

### 1️⃣ Set EAS Secrets (ONE TIME ONLY)

```bash
# Required secrets
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://fjequffxcontjvupgedh.supabase.co" --type string

eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZXF1ZmZ4Y29udGp2dXBnZWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjU1MjAsImV4cCI6MjA3NDY0MTUyMH0.RWDxO6Q5_o5lxaj83hi3OOBYbnI5vKSTEIQMb22fgaU" --type string

eas secret:create --name EXPO_PUBLIC_API_URL --value "https://api.sinomanapp.id" --type string

eas secret:create --name EXPO_PUBLIC_ENV --value "production" --type string

eas secret:create --name EAS_PROJECT_ID --value "06863a61-aa5a-4f34-b0e8-7be02c7514eb" --type string
```

### 2️⃣ Verify Secrets

```bash
eas secret:list
```

Expected output:
```
✔ EXPO_PUBLIC_SUPABASE_URL
✔ EXPO_PUBLIC_SUPABASE_ANON_KEY
✔ EXPO_PUBLIC_API_URL
✔ EXPO_PUBLIC_ENV
✔ EAS_PROJECT_ID
```

### 3️⃣ Pre-Build Checks

```bash
# Clean install
npm install

# Run expo doctor
npx expo-doctor

# Verify config
npx expo config --type public | grep -A 10 "extra:"
```

### 4️⃣ Build Preview APK (for testing)

```bash
eas build --profile preview --platform android
```

**Time**: ~15-20 minutes
**Output**: APK file (~50-80 MB)
**Use**: Install on device for testing

### 5️⃣ Build Production AAB (for Play Store)

```bash
eas build --profile production --platform android
```

**Time**: ~15-20 minutes
**Output**: AAB file (~30-50 MB)
**Use**: Submit to Google Play Store

---

## TROUBLESHOOTING COMMANDS

### If Build Fails:

```bash
# View build logs
eas build:list
eas build:view <BUILD_ID>

# Clear cache and rebuild
eas build --profile preview --platform android --clear-cache

# Check EAS project status
eas project:info
```

### If App Crashes:

```bash
# Get device logs (Android)
adb devices
adb logcat | grep -E "ReactNative|Expo|FATAL"

# Check if env vars are injected
npx expo config --type public | grep "supabaseUrl"
```

### Clean Rebuild:

```bash
# Full clean
rm -rf node_modules package-lock.json
npm install

# Clear Metro bundler cache
npx expo start --clear

# Rebuild from scratch
eas build --profile preview --platform android --clear-cache
```

---

## VERSION MANAGEMENT

### Before Production Build:

```bash
# Update version in app.json
{
  "expo": {
    "version": "1.0.1",  // increment
    "android": {
      "versionCode": 3   // increment
    }
  }
}
```

Or use auto-increment (already enabled):
```json
// eas.json
"production": {
  "autoIncrement": true  // ✅ already set
}
```

---

## MONITORING BUILD STATUS

### Check Build Progress:

```bash
# List all builds
eas build:list

# Watch specific build
eas build:view <BUILD_ID>

# Cancel build
eas build:cancel <BUILD_ID>
```

### Download Build Artifact:

```bash
# From web
# Go to: https://expo.dev/accounts/<your-account>/projects/sinoman-mobile-app/builds

# Or via CLI
eas build:list
# Copy download URL from output
```

---

## SUBMIT TO PLAY STORE

### After Production Build Succeeds:

```bash
# Submit to Play Store
eas submit --profile production --platform android
```

**Prerequisites**:
- [ ] Google Play Console account
- [ ] App created in Play Console
- [ ] Service account key (`google-play-service-account.json`)

---

## QUICK REFERENCE

| Command | Purpose | Time | Output |
|---------|---------|------|--------|
| `eas build --profile preview --platform android` | Test APK | ~20min | APK |
| `eas build --profile production --platform android` | Play Store AAB | ~20min | AAB |
| `eas submit --profile production --platform android` | Upload to Play Store | ~5min | - |
| `npx expo-doctor` | Health check | ~30s | Report |
| `eas secret:list` | List secrets | ~5s | List |
| `eas build:list` | List builds | ~5s | List |

---

## ENVIRONMENT VARIABLES REFERENCE

| Variable | Value | Required |
|----------|-------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | https://fjequffxcontjvupgedh.supabase.co | ✅ Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGciOiJIUzI1... | ✅ Yes |
| `EXPO_PUBLIC_API_URL` | https://api.sinomanapp.id | ✅ Yes |
| `EXPO_PUBLIC_ENV` | production / staging | ✅ Yes |
| `EAS_PROJECT_ID` | 06863a61-aa5a-4f34-b0e8-7be02c7514eb | ✅ Yes |
| `EXPO_PUBLIC_SENTRY_DSN` | https://...@sentry.io/... | ⚠️ Optional |

---

## BUILD PROFILES

### Development (local testing)
```bash
eas build --profile development --platform android
```
- Development client enabled
- Debug mode
- APK output
- Fast iteration

### Preview (staging/testing)
```bash
eas build --profile preview --platform android
```
- Production-like build
- APK output
- Test before Play Store
- **Recommended for first build**

### Production (Play Store)
```bash
eas build --profile production --platform android
```
- Optimized bundle
- AAB output
- Auto-increment version
- Release ready

---

## SUCCESS CRITERIA

After build completes, APK should:
- ✅ Install without errors
- ✅ Open without crash
- ✅ Show splash screen
- ✅ Login works (Supabase connected)
- ✅ Home screen loads data
- ✅ All permissions work (camera, biometric)

If ALL above pass → **Ready for Play Store!** 🎉

---

**Last Updated**: October 3, 2025
**Expo SDK**: 51.0.0
**Build System**: EAS Build
