# app.config.ts Fix - EAS Project ID Configuration

## Issue

When running `eas build`, it failed with:
```
Warning: Your project uses dynamic app configuration, and the EAS project ID can't automatically be added to it.
Cannot automatically write to dynamic config at: app.config.ts
```

## Root Cause

The project had an `app.config.ts` file (TypeScript dynamic configuration) that was reading the EAS project ID from an environment variable:

```typescript
eas: {
  projectId: process.env.EAS_PROJECT_ID,  // ← Was undefined!
}
```

Since `EAS_PROJECT_ID` wasn't set in the `.env` file, the projectId was `undefined`, causing EAS to fail.

## Solution

### 1. Updated app.config.ts ✅

Added a fallback value to the projectId:

```typescript
eas: {
  projectId: process.env.EAS_PROJECT_ID || '06863a61-aa5a-4f34-b0e8-7be02c7514eb',
}
```

**Why this works:**
- Reads from environment variable if available
- Falls back to hardcoded value if env var is missing
- EAS can now read the projectId successfully

### 2. Updated .env ✅

Added the EAS_PROJECT_ID to the `.env` file:

```bash
# Expo EAS Configuration
EAS_PROJECT_ID=06863a61-aa5a-4f34-b0e8-7be02c7514eb
```

### 3. Updated .env.example ✅

Updated the example file with the actual value:

```bash
# Expo EAS Configuration
# Get this ID by running: eas init
# IMPORTANT: Also hardcoded as fallback in app.config.ts
EAS_PROJECT_ID=06863a61-aa5a-4f34-b0e8-7be02c7514eb
```

## Verification

### Before Fix
```bash
$ npx expo config --type public | grep projectId
      projectId: undefined
```

### After Fix ✅
```bash
$ npx expo config --type public | grep projectId
      projectId: '06863a61-aa5a-4f34-b0e8-7be02c7514eb'
```

## Current Configuration

### File Structure
```
sinoman-mobile-app/
├── app.config.ts          # Dynamic config with projectId ✅
├── app.json               # Base config (also has projectId in extra.eas)
├── .env                   # Has EAS_PROJECT_ID ✅
├── .env.example           # Updated with actual value ✅
└── eas.json               # Build profiles
```

### app.config.ts (Current)
```typescript
import { ExpoConfig } from '@expo/config-types';

export default (): ExpoConfig => {
  const config = require('./app.json').expo;

  return {
    ...config,
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      environment: process.env.EXPO_PUBLIC_ENV || 'development',
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      sentryEnvironment: process.env.EXPO_PUBLIC_ENV || 'development',
      sentryRelease: process.env.EXPO_PUBLIC_SENTRY_RELEASE || '1.0.0',
      eas: {
        projectId: process.env.EAS_PROJECT_ID || '06863a61-aa5a-4f34-b0e8-7be02c7514eb', // ← Fixed!
      },
    },
  };
};
```

## Why We Use app.config.ts

The project uses `app.config.ts` for:
1. **Dynamic environment variables** - Load Supabase URL, API keys, etc. from .env
2. **Environment-specific configs** - Different settings for dev/staging/production
3. **Type safety** - TypeScript ensures configuration is correct

## Build Command

You can now run:

```bash
eas build --profile production --platform all
```

EAS will:
1. ✅ Read app.config.ts
2. ✅ Find projectId: `06863a61-aa5a-4f34-b0e8-7be02c7514eb`
3. ✅ Link the project automatically
4. ✅ Start building for Android and iOS

## Expected Behavior

When you run `eas build`:

1. **Configuration Detection** ✅
   ```
   EAS project not configured.
   √ Existing EAS project found for @arielampar/sinoman-mobile-app
     (id = 06863a61-aa5a-4f34-b0e8-7be02c7514eb).
     Configure this project? ... yes
   ```

2. **Project Linking** ✅
   ```
   √ Linked local project to EAS project 06863a61-aa5a-4f34-b0e8-7be02c7514eb
   ```

3. **Build Start** ✅
   ```
   √ Synced project configuration
   √ Credentials configured
   √ Build queued
   ```

## Files Modified

1. ✅ `app.config.ts` - Added fallback projectId
2. ✅ `.env` - Added EAS_PROJECT_ID
3. ✅ `.env.example` - Updated with actual value

## Troubleshooting

### If projectId still shows as undefined:

**Check .env file:**
```bash
grep EAS_PROJECT_ID .env
```

Expected output:
```
EAS_PROJECT_ID=06863a61-aa5a-4f34-b0e8-7be02c7514eb
```

**Check expo config:**
```bash
npx expo config --type public | grep projectId
```

Expected output:
```
projectId: '06863a61-aa5a-4f34-b0e8-7be02c7514eb'
```

### If build still fails:

The fallback in app.config.ts ensures it will work even without .env. If it still fails, check:

1. Verify you're logged in to EAS: `eas whoami`
2. Check internet connection
3. Verify project exists: https://expo.dev/accounts/arielampar/projects/sinoman-mobile-app

## Summary

✅ **app.config.ts**: Updated with fallback projectId
✅ **.env**: Added EAS_PROJECT_ID
✅ **.env.example**: Updated with actual value
✅ **Verification**: expo config shows correct projectId
✅ **Ready for build**: Yes

---

**Status**: ✅ Fixed
**Project ID**: `06863a61-aa5a-4f34-b0e8-7be02c7514eb`
**Configuration**: Dynamic (app.config.ts) with fallback value
**Next Step**: Run `eas build --profile production --platform all`
