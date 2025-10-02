# Build & Deployment Guide - Sinoman Mobile App

This guide covers the complete process for building and deploying the Sinoman Mobile App to Google Play Store and Apple App Store using EAS (Expo Application Services).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Asset Preparation](#asset-preparation)
4. [Environment Configuration](#environment-configuration)
5. [Building](#building)
6. [Testing Builds](#testing-builds)
7. [Store Submission](#store-submission)
8. [Post-Launch Monitoring](#post-launch-monitoring)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- [ ] **Expo Account** - Sign up at https://expo.dev
- [ ] **Google Play Console** - $25 one-time fee at https://play.google.com/console
- [ ] **Apple Developer Account** - $99/year at https://developer.apple.com
- [ ] **GitHub Account** - For version control (optional but recommended)

### Required Tools
```bash
# Node.js 18+ and npm
node --version  # Should be 18.0.0 or higher
npm --version

# Expo CLI
npm install -g expo-cli

# EAS CLI
npm install -g eas-cli

# Git (for version control)
git --version
```

### Required Files
- [ ] `icon-source.png` (1024x1024) - App icon
- [ ] `splash-source.png` (2048x2048) - Splash screen
- [ ] `google-services.json` - Firebase Android config
- [ ] `GoogleService-Info.plist` - Firebase iOS config
- [ ] Environment variables (Supabase, Sentry, etc.)

---

## Initial Setup

### 1. Install Dependencies
```bash
# Navigate to project directory
cd sinoman-mobile-app

# Install Node dependencies
npm install

# Install sharp for asset generation
npm install --save-dev sharp
```

### 2. Login to Expo
```bash
# Login to your Expo account
eas login

# Verify login
eas whoami
```

### 3. Initialize EAS
```bash
# Initialize EAS project
eas init

# This will:
# - Create an app on Expo servers
# - Link your local project to the app
# - Generate a project ID
```

**Important**: After running `eas init`, you'll receive an EAS project ID (UUID format). Update `app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id-here"
      }
    }
  }
}
```

The project ID can also be found at: https://expo.dev/accounts/[your-account]/projects/sinoman-mobile-app

### 4. Configure EAS Build
```bash
# Configure build profiles (already done via eas.json)
eas build:configure

# This will prompt you to configure Android and iOS builds
# Select:
# - Android: Build for both app bundle and APK
# - iOS: Build for App Store
```

---

## Asset Preparation

### 1. Create Source Assets

**Icon (1024x1024):**
- Create `assets/icon-source.png`
- Requirements:
  - Size: 1024x1024 pixels
  - Format: PNG with transparency
  - Content: Sinoman logo centered
  - Background: Primary Green (#059669)
  - Safe area: 80% center (avoid edges)

**Splash Screen (2048x2048):**
- Create `assets/splash-source.png`
- Requirements:
  - Size: 2048x2048 pixels
  - Format: PNG with transparency
  - Content: Sinoman logo centered
  - Background: Transparent (color set in app.json)
  - Safe area: 60% center

**Adaptive Icon Monochrome (1024x1024):**
- Create `assets/adaptive-icon-monochrome.png`
- Requirements:
  - Size: 1024x1024 pixels
  - Format: PNG
  - Content: White (#FFFFFF) silhouette only
  - Background: Transparent
  - Purpose: Android 13+ themed icons

### 2. Generate All Assets
```bash
# Run asset generation script
node scripts/generate-production-assets.js

# This will generate:
# - iOS icons (all sizes)
# - Android icons (all densities)
# - Adaptive icons
# - Splash screens
# - Notification icons
```

### 3. Verify Generated Assets
```bash
# Check that all assets were created
ls -la assets/
ls -la assets/ios/
ls -la assets/android/

# Verify all required assets exist and are ready for build
npm run verify-assets

# Expected output: ✅ SUCCESS: All required assets are present!
```

**Important**: The verification script checks for these REQUIRED assets:
- ✅ `icon.png` (App icon)
- ✅ `splash.png` (Splash screen)
- ✅ `adaptive-icon.png` (Adaptive icon foreground)
- ✅ `adaptive-icon-monochrome.png` (Android 13+ themed icon) - REQUIRED
- ✅ `notification-icon.png` (Notification tray icon) - REQUIRED

If any are missing, run `npm run generate-icons` to create placeholders.

---

## Environment Configuration

### 1. Create Environment Secrets

EAS Build uses secrets to store sensitive environment variables securely.

```bash
# Supabase
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"

# Sentry
eas secret:create --name EXPO_PUBLIC_SENTRY_DSN --value "https://your-key@sentry.io/your-project-id"

# Other secrets
eas secret:create --name EXPO_PUBLIC_API_URL --value "https://api.sinomanapp.id"
```

### 2. List Secrets
```bash
# View all configured secrets
eas secret:list

# Delete a secret (if needed)
eas secret:delete --name SECRET_NAME
```

### 3. Firebase Configuration

**Android:**
1. Download `google-services.json` from Firebase Console
2. Place in project root: `./google-services.json`
3. **DO NOT commit to Git** (already in .gitignore)

**iOS:**
1. Download `GoogleService-Info.plist` from Firebase Console
2. Place in project root: `./GoogleService-Info.plist`
3. **DO NOT commit to Git** (already in .gitignore)

---

## Building

### Build Profiles

We have 3 build profiles defined in `eas.json`:

1. **Development** - For local development and testing
2. **Preview** - For internal testing and beta distribution
3. **Production** - For App Store and Google Play submission

### 1. Development Build

```bash
# Android APK (for emulator/device)
eas build --profile development --platform android

# iOS Simulator build
eas build --profile development --platform ios

# Both platforms
eas build --profile development --platform all
```

**Use cases:**
- Local testing on device
- Debugging with development client
- Testing new features

### 2. Preview Build

```bash
# Android APK (internal testing)
eas build --profile preview --platform android

# iOS build (TestFlight beta)
eas build --profile preview --platform ios

# Both platforms
eas build --profile preview --platform all
```

**Use cases:**
- Internal team testing
- Beta tester distribution
- Pre-production validation

### 3. Production Build

```bash
# Android App Bundle (Google Play)
eas build --profile production --platform android

# iOS IPA (App Store)
eas build --profile production --platform ios

# Both platforms (recommended)
eas build --profile production --platform all
```

**Build time:** 15-25 minutes per platform

### 4. Monitor Build Progress

```bash
# View build status in browser
eas build:list

# Or check in terminal (builds will show URLs)
```

### 5. Download Builds

Builds are automatically stored on Expo servers. You can:
- Download from the build URL provided in terminal
- Download from Expo dashboard: https://expo.dev
- Install directly on device via QR code (for APK/IPA)

---

## Testing Builds

### Android Testing

**Install APK:**
```bash
# Download APK from build URL
# Install on device via:
adb install -r path/to/app.apk

# Or send link to testers
```

**Test Checklist:**
- [ ] App launches without crashes
- [ ] Authentication works (OTP, biometric)
- [ ] Navigation flows correctly
- [ ] Savings features functional
- [ ] QR payment works
- [ ] Marketplace browsing and checkout
- [ ] Fit Challenge features
- [ ] Push notifications received
- [ ] Offline mode works
- [ ] Performance is smooth (60 FPS)

### iOS Testing

**Install via TestFlight:**
1. Submit build to TestFlight (see Store Submission section)
2. Invite internal testers via App Store Connect
3. Testers download TestFlight app and install build

**Test Checklist:**
- Same as Android checklist
- [ ] Face ID/Touch ID works
- [ ] App works on iPhone and iPad
- [ ] Dark mode displays correctly
- [ ] Safe area insets respected (notch/Dynamic Island)

---

## Store Submission

### Google Play Store

#### 1. Prepare Store Listing

**Required Assets:**
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (5-8 images, 1080x1920)
- [ ] Privacy Policy URL
- [ ] App description

See `store-assets/descriptions/google-play-listing.md` for content.

#### 2. Create App in Play Console

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in:
   - App name: "Sinoman - Koperasi Digital"
   - Default language: Indonesian (id-ID)
   - App type: App
   - Category: Finance
   - Paid/Free: Free

#### 3. Complete Store Listing

Navigate to: **Store presence > Main store listing**

Fill in:
- App name
- Short description (80 chars)
- Full description (4000 chars)
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (5-8)
- Privacy policy URL: https://sinomanapp.id/privacy-policy

#### 4. Content Rating

Navigate to: **Policy > App content > Content rating**

1. Start questionnaire
2. Select category: Finance
3. Answer questions (select "No" for violence, gambling, etc.)
4. Submit for rating

#### 5. Submit Build

```bash
# First, ensure you have a service account JSON
# Download from Google Cloud Console > IAM & Admin > Service Accounts

# Place the JSON file in project root (DO NOT commit to Git)
# File: google-play-service-account.json

# Submit build
eas submit --profile production --platform android

# Follow prompts:
# - Select the latest build
# - Choose track: Internal testing (for first release)
# - Confirm submission
```

#### 6. Release Track

**Internal Testing** (recommended for first release):
- Up to 100 testers
- No review required
- Immediate availability
- Test before public release

**Promote to Production when ready:**
1. Go to Play Console > Testing > Internal testing
2. Click "Promote release" > "Production"
3. Submit for review (1-3 days)

---

### Apple App Store

#### 1. Prepare Store Listing

**Required Assets:**
- [ ] App icon (1024x1024)
- [ ] Screenshots:
  - 6.5" Display (1284x2778) - Required
  - 5.5" Display (1242x2208) - Required
- [ ] Privacy Policy URL
- [ ] App description
- [ ] Keywords

See `store-assets/descriptions/app-store-listing.md` for content.

#### 2. Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" > "+" > "New App"
3. Fill in:
   - Platform: iOS
   - Name: "Sinoman - Koperasi Digital"
   - Primary Language: Indonesian
   - Bundle ID: id.sinomanapp.mobile
   - SKU: sinoman-mobile-app-001

#### 3. Configure App Information

Navigate to: **App Information**

Fill in:
- Subtitle (30 chars)
- Category: Finance
- Secondary category: Lifestyle
- Content rights: Does not contain third-party content
- Privacy Policy URL: https://sinomanapp.id/privacy-policy

#### 4. Prepare for Submission

Navigate to: **App Store > [Version] > Prepare for Submission**

Fill in:
- Screenshots (6.5" and 5.5" required)
- Description (4000 chars)
- Keywords (100 chars, comma-separated)
- Support URL: https://sinomanapp.id/support
- Marketing URL: https://sinomanapp.id

#### 5. Pricing and Availability

- Price: Free
- Availability: Indonesia (or worldwide)

#### 6. App Privacy

Navigate to: **App Privacy**

Declare data collection:
- [ ] Financial information (collected)
- [ ] Contact information (collected)
- [ ] User content (profile photos)
- [ ] Identifiers (device ID)
- [ ] Usage data (analytics)

#### 7. Submit Build

```bash
# Submit build to App Store Connect
eas submit --profile production --platform ios

# Follow prompts:
# - Enter Apple ID email
# - Enter app-specific password (create at appleid.apple.com)
# - Select the latest build
# - Confirm submission
```

#### 8. Submit for Review

1. Go to App Store Connect > My Apps > Sinoman
2. Select version
3. Fill in "App Review Information":
   - Demo account (phone number + note about OTP)
   - Contact information
   - Notes: "App requires Koperasi membership. Test account provided."
4. Click "Submit for Review"

**Review Time:** 1-3 days (typically 24-48 hours)

---

## Post-Launch Monitoring

### 1. Crash Monitoring (Sentry)

```bash
# Check Sentry dashboard
# https://sentry.io/organizations/sinoman/projects/sinoman-mobile-app/

# Monitor:
# - Crash-free rate (should be >99%)
# - Error frequency
# - Affected users
# - Performance metrics
```

### 2. Analytics (Firebase)

```bash
# Check Firebase Console
# https://console.firebase.google.com/project/sinoman-mobile-app/

# Monitor:
# - Active users (DAU, MAU)
# - User engagement
# - Screen views
# - Conversion funnels
# - Retention rates
```

### 3. App Store Metrics

**Google Play Console:**
- Dashboard > Statistics
- Track: Installs, Uninstalls, Crashes, ANRs, Ratings

**App Store Connect:**
- Analytics > Metrics
- Track: Downloads, In-app purchases, Crashes, Ratings

### 4. User Feedback

**Reviews:**
- Monitor and respond to user reviews
- Address common complaints
- Thank positive reviews

**Support Tickets:**
- Email: support@sinomanapp.id
- WhatsApp: +62 82331052577
- Track response time (<24 hours)

### 5. Performance Targets

- **Crash-free rate:** >99%
- **ANR rate:** <0.5%
- **Cold start time:** <3 seconds
- **Screen load time:** <1 second
- **Rating:** >4.0 stars
- **Response time:** <24 hours

---

## Troubleshooting

### Build Failures

**Error: Missing google-services.json**
```bash
# Download from Firebase Console
# Place in project root
# Ensure it's NOT in .gitignore for builds
```

**Error: Invalid bundle identifier**
```bash
# Check app.json:
# - iOS: "bundleIdentifier": "id.sinomanapp.mobile"
# - Android: "package": "id.sinomanapp.mobile"
# Ensure they match App Store/Play Console
```

**Error: Build timeout**
```bash
# Retry build:
eas build --profile production --platform android --clear-cache
```

### Submission Failures

**Google Play: "Release not reviewed"**
- First release must go through internal testing
- Promote to production after testing

**App Store: "Missing compliance"**
- Export Compliance: No encryption (uses standard HTTPS)
- Or declare encryption usage in App Store Connect

**App Store: "App crashes on launch"**
- Provide detailed steps to reproduce
- Include demo account credentials
- Add notes about OTP in review information

### Common Issues

**OTP not received during review:**
- Add note in App Store review info: "Use test OTP: 123456"
- Implement test mode for reviewers

**Permissions denied:**
- Ensure all permissions are justified in Privacy Policy
- Add clear usage descriptions in app.json

**App size too large:**
```bash
# Analyze bundle size
npx react-native-bundle-visualizer

# Optimize:
# - Remove unused dependencies
# - Compress images
# - Enable Hermes (already enabled)
```

---

## Version Updates

### Incrementing Version

Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // User-facing version
    "android": {
      "versionCode": 2   // Build number
    },
    "ios": {
      "buildNumber": "1.0.1"  // Build number
    }
  }
}
```

Or use EAS auto-increment (already configured in eas.json):
```json
{
  "build": {
    "production": {
      "autoIncrement": true  // Automatically increments build numbers
    }
  }
}
```

### Submit Update

```bash
# Build new version
eas build --profile production --platform all

# Submit to stores
eas submit --profile production --platform all

# Update CHANGELOG.md with changes
```

---

## Useful Commands Reference

```bash
# EAS Login
eas login
eas whoami

# Build
eas build --profile production --platform all
eas build:list
eas build:view [BUILD_ID]

# Submit
eas submit --profile production --platform all

# Secrets
eas secret:create --name NAME --value "value"
eas secret:list
eas secret:delete --name NAME

# Credentials
eas credentials
eas credentials:configure

# Update
eas update --branch production --message "Fix critical bug"

# Clear cache (if build fails)
eas build --profile production --platform android --clear-cache
```

---

## Support & Resources

**Documentation:**
- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- **[EAS Project Setup Guide](./EAS_PROJECT_SETUP.md)** - How to obtain and configure EAS project ID

**Community:**
- Expo Forums: https://forums.expo.dev
- Discord: https://chat.expo.dev

**Sinoman Support:**
- Email: dev@sinomanapp.id
- Internal Slack: #mobile-app-dev

---

## Checklist: First Production Release

- [ ] All features complete and tested
- [ ] Unit tests passing
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security audit complete
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Assets generated (icons, splash)
- [ ] Screenshots captured
- [ ] Store listings written
- [ ] Firebase configured
- [ ] Sentry configured
- [ ] Environment secrets set
- [ ] Build successful (Android + iOS)
- [ ] Tested on real devices
- [ ] Google Play listing complete
- [ ] App Store listing complete
- [ ] Submitted for review
- [ ] Monitoring dashboards ready
- [ ] Support email/WhatsApp ready
- [ ] Launch announcement prepared

---

**Good luck with your launch! 🚀**

If you encounter issues, contact the team or refer to the troubleshooting section above.
