# Sinoman Mobile App - Setup Guide

## Phase 1: Foundation Setup (Day 1-2)

This guide will walk you through setting up the Sinoman Mobile App development environment.

---

## ✅ What Has Been Created

All foundational files have been generated:

### Configuration Files
- ✅ `package.json` - Dependencies and scripts
- ✅ `tsconfig.json` - TypeScript configuration with strict mode
- ✅ `babel.config.js` - Babel configuration with path aliases
- ✅ `.eslintrc.js` - ESLint rules
- ✅ `.prettierrc` - Code formatting rules
- ✅ `.gitignore` - Git ignore patterns
- ✅ `app.json` - Expo static configuration
- ✅ `app.config.ts` - Expo dynamic configuration
- ✅ `.env.example` - Environment variables template

### Source Code Structure
- ✅ `src/services/supabase/` - Supabase client setup
- ✅ `src/utils/` - Constants and logger
- ✅ `src/types/` - TypeScript type definitions
- ✅ `src/theme/` - Theme configuration with brand colors
- ✅ `src/screens/` - Placeholder screens (Auth, Dashboard, Savings, QR, Marketplace, Profile)
- ✅ `src/navigation/` - Navigation structure (Root, Auth, Main navigators)
- ✅ `src/components/` - Component directories (common, layout, forms)
- ✅ `src/store/` - State management directory
- ✅ `App.tsx` - Root application component
- ✅ `index.js` - Expo entry point

### Documentation
- ✅ `README.md` - Project documentation
- ✅ `.vscode/settings.json` - VS Code workspace settings

---

## 🚀 Next Steps: Installation & Setup

### Step 1: Install Dependencies

```bash
cd C:\Dev\Projects\sinoman-mobile-app
npm install
```

This will install all required packages:
- Expo SDK 49
- React Native 0.72.6
- React Navigation 6
- Zustand 4.4
- React Native Paper 5.0
- Supabase Client
- All development tools (ESLint, Prettier, TypeScript)

**Expected Duration**: 3-5 minutes depending on internet speed

---

### Step 2: Setup Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` file and add your Supabase credentials:

```bash
# Get these from your Supabase project dashboard
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_API_URL=https://api.sinoman.co.id
EXPO_PUBLIC_ENV=development
```

**Important**: Use the **same Supabase project** as the PWA for data consistency.

---

### Step 3: Create Placeholder Assets

The app expects these asset files (will be replaced by actual assets later):

```bash
# Create placeholder icon (1024x1024)
# You can use any PNG image temporarily
# Place at: assets/icon.png

# Create placeholder splash screen
# Place at: assets/splash.png

# Create adaptive icon for Android
# Place at: assets/adaptive-icon.png
```

**Quick Fix**: Copy any square PNG image and rename it to `icon.png`, `splash.png`, and `adaptive-icon.png` for now.

---

### Step 4: Verify Setup

Run TypeScript type checking:
```bash
npm run type-check
```

Run ESLint:
```bash
npm run lint
```

**Expected Result**: Both should complete without critical errors.

---

### Step 5: Start Development Server

```bash
npm start
```

This will:
1. Start Metro bundler
2. Generate QR code
3. Open Expo Dev Tools in browser

**Options**:
- Press `a` - Open on Android emulator
- Press `i` - Open on iOS simulator
- Press `w` - Open in web browser
- Scan QR code with Expo Go app on physical device

---

### Step 6: Test on Device

#### Option A: Expo Go (Recommended for Development)

1. **Install Expo Go**:
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Scan QR Code**:
   - Android: Use Expo Go app to scan QR code
   - iOS: Use Camera app to scan QR code → Opens in Expo Go

3. **Expected Result**: App loads with Login placeholder screen

#### Option B: Android Emulator

```bash
npm run android
```

Prerequisites:
- Android Studio installed
- Android emulator configured
- ANDROID_HOME environment variable set

#### Option C: iOS Simulator (Mac only)

```bash
npm run ios
```

Prerequisites:
- Xcode installed
- iOS simulator configured

---

## 🧪 Testing the Setup

### Test 1: Navigation Working

1. App should open to **Login screen** (placeholder)
2. This confirms:
   - ✅ Auth Navigator working
   - ✅ Placeholder screens rendering
   - ✅ React Native Paper theme applied

### Test 2: Check Navigation Tabs (Temporarily)

To test Main Navigator, temporarily change `isAuthenticated` in `src/navigation/RootNavigator.tsx`:

```typescript
// Change this line:
const isAuthenticated = false;

// To:
const isAuthenticated = true;
```

Hot reload should show bottom tabs:
- Home (Dashboard)
- Savings
- Scan (QR Scanner)
- Shop (Marketplace)
- Profile

**Expected**: All 5 tabs visible with placeholder screens

**Revert**: Change back to `false` when done testing

### Test 3: Supabase Connection

Add a test query in `App.tsx` temporarily:

```typescript
import { supabase } from '@services/supabase';

// In prepare() function:
const { data, error } = await supabase.from('profiles').select('count');
console.log('Supabase test:', data, error);
```

**Expected**: Console log shows connection (no error about missing env vars)

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**:
- Verify `.env` file exists in project root
- Check variables start with `EXPO_PUBLIC_`
- Restart development server after adding `.env`

### Issue: "Cannot find module '@navigation'"

**Solution**:
- Clear Metro cache: `npx expo start -c`
- Verify `babel.config.js` has module-resolver configured
- Check `tsconfig.json` has path aliases

### Issue: "Unable to resolve react-native-vector-icons"

**Solution**:
```bash
npm install react-native-vector-icons
npx expo install react-native-vector-icons
```

### Issue: Assets not loading

**Solution**:
- Create placeholder PNG files in `assets/` directory
- Name them: `icon.png`, `splash.png`, `adaptive-icon.png`
- Minimum size: 1024x1024 for icon, any size for splash

### Issue: TypeScript errors in IDE

**Solution**:
- VS Code: Press `Cmd/Ctrl + Shift + P` → "TypeScript: Reload Project"
- Verify `tsconfig.json` is in project root
- Install VS Code extension: "TypeScript and JavaScript Language Features"

---

## 📋 Success Criteria Checklist

Phase 1 is complete when:

- ✅ `npm install` completes successfully
- ✅ `npm run type-check` passes without errors
- ✅ `npm run lint` passes (warnings OK)
- ✅ `npm start` launches development server
- ✅ App loads on device/emulator
- ✅ Login placeholder screen renders
- ✅ Temporarily switching to `isAuthenticated = true` shows bottom tabs
- ✅ All 5 tab screens render with "Coming Soon" badges
- ✅ No critical errors in console
- ✅ Supabase client initializes without errors

---

## 🎯 Next Phase: Authentication System (Day 3-4)

Once Phase 1 is verified, proceed to:

1. **Phone Number Input Screen**
   - Indonesian phone number format (+62)
   - Validation
   - Send OTP

2. **OTP Verification Screen**
   - 6-digit OTP input
   - Auto-read SMS (Android)
   - Countdown timer
   - Resend OTP

3. **Biometric Authentication**
   - TouchID/FaceID/Fingerprint
   - Secure session storage
   - Auto-login

4. **Auth State Management**
   - Zustand auth store
   - Session persistence
   - Token refresh

5. **Supabase Integration**
   - `signInWithOtp()` implementation
   - Session handling
   - Error handling

---

## 📞 Need Help?

- **Technical Issues**: tech@sinomanapp.id
- **Supabase Access**: product@sinomanapp.id
- **WhatsApp Support**: +62 82331052577

---

**Status**: Phase 1 Foundation Setup - COMPLETE ✅

**Ready for**: Phase 2 Authentication System 🚀