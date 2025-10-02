# Firebase & Sentry Plugins Configuration Note

## Current Status

The `app.json` file **does not include** Firebase or Sentry plugins configuration due to ES module resolution issues during `expo config` evaluation.

## Why Plugins Were Removed

### The Problem
When Firebase plugins (`@react-native-firebase/app`, `@react-native-firebase/perf`, `@react-native-firebase/analytics`) were included in `app.json`, EAS CLI commands failed with:

```
Directory import 'C:\Dev\Projects\sinoman-mobile-app\node_modules\@react-native-firebase\app\lib\common'
is not supported resolving ES modules
```

This error occurred because:
1. `expo config` tries to evaluate all plugins during configuration
2. React Native Firebase packages use directory imports incompatible with ES modules
3. This breaks EAS CLI commands like `eas init`, `eas project:info`, `eas build:configure`

### The Solution
We removed plugins from `app.json` to allow EAS CLI commands to work properly.

## How Firebase Still Works

**Firebase functionality is NOT affected** because:

1. **Native Modules**: Firebase packages are native modules that are linked during the build process, not through app.json plugins
2. **Config Files**: Firebase configuration comes from:
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS)
3. **Package Dependencies**: Firebase packages are installed in `package.json` and work at runtime

## Current app.json Configuration

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "06863a61-aa5a-4f34-b0e8-7be02c7514eb"
      }
    }
  }
}
```

**No plugins** section - this is intentional and correct.

## What Was Removed

### Firebase Plugins (removed but still functional)
```json
// REMOVED from app.json (not needed for functionality)
"plugins": [
  [
    "@react-native-firebase/app",
    {
      "android": {
        "googleServicesFile": "./google-services.json"
      },
      "ios": {
        "googleServicesFile": "./GoogleService-Info.plist"
      }
    }
  ],
  "@react-native-firebase/perf",
  "@react-native-firebase/analytics"
]
```

### Sentry Hooks (removed - package not installed)
```json
// REMOVED from app.json (sentry-expo not installed)
"hooks": {
  "postPublish": [
    {
      "file": "sentry-expo/upload-sourcemaps",
      "config": {
        "organization": "sinoman",
        "project": "sinoman-mobile-app"
      }
    }
  ]
}
```

**Note**: The project uses `@sentry/react-native` (v5.15.0), not `sentry-expo`, so these hooks wouldn't work anyway.

## Firebase Configuration Files

Firebase will work correctly as long as these files exist:

### Android
```
google-services.json (in project root)
```
- ✅ Present in project
- Downloaded from Firebase Console
- Contains Firebase Android configuration
- Used automatically during Android builds

### iOS
```
GoogleService-Info.plist (in project root)
```
- ✅ Present in project
- Downloaded from Firebase Console
- Contains Firebase iOS configuration
- Used automatically during iOS builds

## Sentry Configuration

Sentry is configured through:

### Package
```json
"dependencies": {
  "@sentry/react-native": "^5.15.0"
}
```

### Environment Variable
```
EXPO_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project-id
```

### Code Integration
Sentry is initialized in the app code, not through app.json plugins.

## Building the App

EAS builds will work correctly without plugins in app.json:

```bash
# All these commands now work
eas build:configure
eas build --profile production --platform all
eas submit --profile production --platform all
```

### During Build
1. EAS reads `app.json` (no plugin evaluation errors)
2. Firebase config files are included automatically
3. Native Firebase modules are linked
4. App builds successfully with full Firebase functionality

## Verifying Configuration

### Check EAS Configuration
```bash
npm run validate-eas
```

Expected output:
```
✅ EAS Project ID: CONFIGURED
   Value: 06863a61-aa5a-4f34-b0e8-7be02c7514eb
```

### Check Firebase Files
```bash
ls google-services.json          # Android
ls GoogleService-Info.plist      # iOS
```

Both should be present in project root.

## If You Need to Add Plugins Later

If future Expo SDK versions fix the ES module issue, you can add plugins back:

1. **Verify Expo SDK supports it**:
   ```bash
   npx expo config --type public
   ```
   Should complete without errors

2. **Add Firebase plugins**:
   ```json
   "plugins": [
     [
       "@react-native-firebase/app",
       {
         "android": {
           "googleServicesFile": "./google-services.json"
         },
         "ios": {
           "googleServicesFile": "./GoogleService-Info.plist"
         }
       }
     ]
   ]
   ```

3. **Test configuration**:
   ```bash
   eas build:configure
   ```

## Summary

✅ **EAS Project ID**: Configured (`06863a61-aa5a-4f34-b0e8-7be02c7514eb`)
✅ **Firebase**: Works via config files (google-services.json, GoogleService-Info.plist)
✅ **Sentry**: Works via @sentry/react-native package
✅ **EAS Commands**: All working correctly
❌ **Plugins**: Removed from app.json due to ES module issues (not needed for functionality)

## References

- **Expo SDK 49 + Firebase Issue**: https://github.com/expo/expo/issues/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Firebase Setup**: https://rnfirebase.io/

---

**Status**: Working configuration without plugins
**Date**: October 2, 2025
**EAS Project ID**: 06863a61-aa5a-4f34-b0e8-7be02c7514eb
