# Phase 1 Verification Checklist

Use this checklist to verify that the foundation setup is complete and working correctly.

---

## 📋 Pre-Installation Checks

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed (`npm --version`)
- [ ] Git installed (optional, `git --version`)
- [ ] Code editor ready (VS Code recommended)
- [ ] Expo Go app installed on test device (optional)

---

## 🔧 Installation Steps

### 1. Install Dependencies
```bash
cd C:\Dev\Projects\sinoman-mobile-app
npm install
```

**Checklist:**
- [ ] `npm install` completes without errors
- [ ] `node_modules/` directory created
- [ ] `package-lock.json` generated
- [ ] No peer dependency warnings (or resolved)

**Expected Duration**: 3-5 minutes

---

### 2. Environment Configuration
```bash
cp .env.example .env
```

**Edit `.env` with Supabase credentials:**
```
EXPO_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

**Checklist:**
- [ ] `.env` file created
- [ ] Supabase URL added
- [ ] Supabase anon key added
- [ ] `.env` is in `.gitignore` (already configured)

**How to Get Supabase Credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" and "anon public" key

---

### 3. Create Placeholder Assets

**Checklist:**
- [ ] Create `assets/icon.png` (1024x1024 pixels)
- [ ] Create `assets/splash.png` (any size, landscape works best)
- [ ] Create `assets/adaptive-icon.png` (1024x1024 pixels)

**Quick Solution**: Use the same image for all three files temporarily.

**Where to get placeholder:**
- Use any PNG image
- Or generate at [placeholder.com](https://placeholder.com/)
- Or use Sinoman logo (if available)

---

## ✅ Verification Tests

### Test 1: TypeScript Compilation
```bash
npm run type-check
```

**Expected Result:**
```
✓ TypeScript compilation successful
✓ No type errors found
```

**Checklist:**
- [ ] Command completes successfully
- [ ] No error messages
- [ ] Exit code 0

**If Errors**: Check that all `.ts` and `.tsx` files are valid TypeScript.

---

### Test 2: ESLint Validation
```bash
npm run lint
```

**Expected Result:**
```
✓ No ESLint errors
⚠ Some warnings OK (unused variables in placeholders)
```

**Checklist:**
- [ ] No critical errors
- [ ] Warnings acceptable (placeholders have unused props)
- [ ] Exit code 0

**If Errors**: Run `npm run lint:fix` to auto-fix formatting issues.

---

### Test 3: Code Formatting
```bash
npm run format
```

**Expected Result:**
```
✓ All files formatted with Prettier
✓ No files changed (already formatted)
```

**Checklist:**
- [ ] Command completes successfully
- [ ] Files formatted according to `.prettierrc`

---

### Test 4: Start Development Server
```bash
npm start
```

**Expected Result:**
```
✓ Metro bundler starts
✓ QR code displayed
✓ No build errors
✓ "Waiting on exp://..." message
```

**Checklist:**
- [ ] Server starts on port 8081 (or alternative)
- [ ] QR code visible in terminal
- [ ] Web interface opens in browser (optional)
- [ ] No red error messages

**Common Issues:**
- Port already in use: Kill other Metro instances or use `--port 8082`
- Cache issues: Run `npx expo start -c` to clear cache

---

### Test 5: Load on Device/Emulator

#### Option A: Expo Go on Physical Device

**Steps:**
1. Open Expo Go app
2. Scan QR code from terminal
3. Wait for bundle to download

**Checklist:**
- [ ] App loads without errors
- [ ] Login screen displays
- [ ] "Coming Soon" badge visible
- [ ] No red error screen

**Expected Screen:**
```
┌──────────────────────┐
│                      │
│       Login          │
│                      │
│  Phone number        │
│  authentication      │
│                      │
│   [Coming Soon]      │
│                      │
└──────────────────────┘
```

#### Option B: Android Emulator

```bash
npm run android
```

**Prerequisites:**
- [ ] Android Studio installed
- [ ] Android emulator configured
- [ ] ANDROID_HOME environment variable set

**Checklist:**
- [ ] Emulator launches
- [ ] App installs automatically
- [ ] Login screen displays

#### Option C: iOS Simulator (Mac only)

```bash
npm run ios
```

**Prerequisites:**
- [ ] Xcode installed
- [ ] iOS simulator configured
- [ ] Command Line Tools installed

**Checklist:**
- [ ] Simulator launches
- [ ] App installs automatically
- [ ] Login screen displays

---

### Test 6: Navigation Verification

**Temporarily test Main Navigator:**

1. Edit `src/navigation/RootNavigator.tsx`
2. Change line:
   ```typescript
   const isAuthenticated = false; // Change to true
   ```
3. Save and wait for hot reload

**Checklist:**
- [ ] App reloads automatically
- [ ] Bottom navigation bar appears
- [ ] 5 tabs visible: Home, Savings, Scan, Shop, Profile
- [ ] Tapping tabs switches screens
- [ ] Each screen shows "Coming Soon"

**Tab Icons:**
- [ ] Home: house icon
- [ ] Savings: wallet icon
- [ ] Scan: QR code icon (center, larger)
- [ ] Shop: shopping cart icon
- [ ] Profile: account icon

**After Testing:**
- [ ] Change `isAuthenticated` back to `false`
- [ ] Verify Login screen displays again

---

### Test 7: Theme & Styling

**Visual Checks:**

**Colors:**
- [ ] Primary actions: Green (#059669)
- [ ] "Coming Soon" badge: Light green background
- [ ] Tab active color: Green
- [ ] Tab inactive color: Gray

**Typography:**
- [ ] Screen title: Large, bold
- [ ] Description: Medium size
- [ ] Badge text: Small

**Layout:**
- [ ] Content centered on screen
- [ ] Proper padding around elements
- [ ] Safe area respected (no content under notch)

---

### Test 8: Supabase Connection

**Add temporary test in `App.tsx`:**

```typescript
import { supabase } from '@services/supabase';

// In prepare() function, add:
console.log('Testing Supabase connection...');
const { error } = await supabase.from('profiles').select('count').limit(1);
if (error) {
  console.error('Supabase error:', error.message);
} else {
  console.log('✅ Supabase connected successfully');
}
```

**Checklist:**
- [ ] No "Missing Supabase environment variables" error
- [ ] Console shows connection attempt
- [ ] Connection succeeds or shows expected auth error (if table requires auth)

**After Testing:**
- [ ] Remove test code from `App.tsx`

---

### Test 9: Hot Reload

**Test hot reload functionality:**

1. With app running, edit `src/screens/PlaceholderScreen.tsx`
2. Change title style color
3. Save file

**Checklist:**
- [ ] App reloads automatically (< 2 seconds)
- [ ] Changes visible immediately
- [ ] No full app restart required
- [ ] No errors in console

---

### Test 10: Error Boundaries

**Test error handling:**

1. Temporarily add error to component:
   ```typescript
   throw new Error('Test error');
   ```
2. Save and observe

**Checklist:**
- [ ] Red error screen appears (development)
- [ ] Error message visible
- [ ] Stack trace shown
- [ ] Can dismiss error overlay

**After Testing:**
- [ ] Remove test error

---

## 🎯 Final Verification

### All Systems Go Checklist

- [ ] ✅ Dependencies installed (27+ packages)
- [ ] ✅ TypeScript compilation passes
- [ ] ✅ ESLint validation passes
- [ ] ✅ Development server starts
- [ ] ✅ App loads on device/emulator
- [ ] ✅ Login screen renders correctly
- [ ] ✅ Navigation structure working
- [ ] ✅ Bottom tabs functional (when isAuthenticated = true)
- [ ] ✅ Theme colors applied correctly
- [ ] ✅ Supabase client initializes
- [ ] ✅ Hot reload working
- [ ] ✅ No critical console errors

---

## 🐛 Troubleshooting Guide

### Issue: Dependencies fail to install

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try with legacy peer deps
npm install --legacy-peer-deps
```

---

### Issue: Metro bundler fails to start

**Solutions:**
```bash
# Clear Metro cache
npx expo start -c

# Kill existing Metro process
# Windows:
taskkill /F /IM node.exe

# Mac/Linux:
killall node

# Restart
npm start
```

---

### Issue: "Cannot find module '@navigation'"

**Solutions:**
```bash
# Clear all caches
npx expo start -c

# Verify babel.config.js has module-resolver
# Restart Metro bundler
```

---

### Issue: TypeScript errors in VS Code

**Solutions:**
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "TypeScript: Restart TS Server"
3. Select and execute

Or:
```bash
# Reinstall @types packages
npm install --save-dev @types/react @types/react-native
```

---

### Issue: Supabase connection error

**Verify:**
- [ ] `.env` file exists in project root
- [ ] Variables start with `EXPO_PUBLIC_`
- [ ] No extra spaces in `.env` file
- [ ] Supabase credentials are correct
- [ ] Restart Metro bundler after adding `.env`

**Test connection:**
```bash
# Add to App.tsx temporarily
console.log(Constants.expoConfig?.extra?.supabaseUrl);
```

---

### Issue: App crashes on launch

**Check:**
- [ ] All asset files exist (icon.png, splash.png)
- [ ] No syntax errors in any files
- [ ] Metro bundler is running
- [ ] Device/emulator has enough memory

**View error details:**
- Shake device to open developer menu
- Select "Toggle Element Inspector"
- Check console logs

---

## 📊 Performance Baseline

After successful setup, note these metrics:

**Build Time:**
- [ ] Cold start: _____ seconds
- [ ] Hot reload: _____ seconds
- [ ] Type check: _____ seconds

**Bundle Size:**
- [ ] JavaScript bundle: _____ MB
- [ ] Assets: _____ MB
- [ ] Total: _____ MB

**Target:** Total < 30MB

---

## ✅ Sign-Off

### Phase 1 Complete

Once all checks pass:

**Completed by:** _____________________
**Date:** _____________________
**Notes:** _____________________

---

## 🚀 Ready for Phase 2

If all checks pass, you're ready to proceed to:

**Phase 2: Authentication System (Day 3-4)**

Next steps:
1. Create auth store with Zustand
2. Implement Login screen with phone input
3. Implement OTP verification screen
4. Integrate Supabase Auth
5. Add biometric authentication
6. Implement session management

---

**Good luck with Phase 2!** 🎉