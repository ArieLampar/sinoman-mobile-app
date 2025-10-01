# Firebase Security Best Practices

**Date**: 2025-10-01
**Status**: Security Guidelines for Sinoman Mobile App

---

## Table of Contents

1. [Introduction](#introduction)
2. [Understanding Firebase API Keys](#understanding-firebase-api-keys)
3. [Configuration Files](#configuration-files)
4. [Security Best Practices](#security-best-practices)
5. [API Key Restrictions](#api-key-restrictions)
6. [Firebase Security Rules](#firebase-security-rules)
7. [Git Security](#git-security)
8. [Troubleshooting](#troubleshooting)
9. [References](#references)

---

## Introduction

### Why This Guide?

Firebase configuration files (`google-services.json` and `GoogleService-Info.plist`) contain API keys that are technically **designed to be public** - they're embedded in mobile apps that users can inspect. However, security best practices require:

1. **API key restrictions** to prevent unauthorized use
2. **Firebase Security Rules** to protect data access
3. **Git hygiene** to avoid exposing keys unnecessarily
4. **Firebase App Check** for additional security layer

### Security Mindset

Firebase security is **NOT** about hiding API keys (impossible in mobile apps). It's about:

- ✅ **Restricting** where API keys can be used (specific apps only)
- ✅ **Protecting** data with Firebase Security Rules
- ✅ **Monitoring** usage to detect abuse
- ✅ **Layering** security with App Check and authentication

---

## Understanding Firebase API Keys

### Are Firebase API Keys Secret?

**No.** Firebase API keys in mobile apps are **not secrets**. They:

- ✅ Are embedded in the app bundle (users can extract them)
- ✅ Are meant to identify your Firebase project
- ✅ Don't grant access to data by themselves
- ✅ Must be combined with proper security rules

### What Protects Your Data?

1. **Firebase Security Rules** - Define who can read/write data
2. **API Key Restrictions** - Limit which apps can use the key
3. **Firebase Authentication** - Verify user identity
4. **Firebase App Check** - Verify requests come from your app

### Why Gitignore Them?

Even though Firebase API keys are public, we gitignore them because:

1. **Defense in depth** - Reduces attack surface
2. **Prevents automated scanning** - GitHub bots flag exposed keys
3. **Best practice** - Industry standard for all API keys
4. **Team workflow** - Each developer uses their own Firebase project for testing

---

## Configuration Files

### google-services.json (Android)

**Location**: Project root
**Format**: JSON
**Contains**:
- Project number and ID
- API key for Android
- App ID
- Storage bucket URL

**Example**:
```json
{
  "project_info": {
    "project_number": "123456789012",
    "project_id": "your-project-id",
    "storage_bucket": "your-project-id.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123456789012:android:abcdef123456",
        "android_client_info": {
          "package_name": "id.sinomanapp.mobile"
        }
      },
      "api_key": [
        {
          "current_key": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        }
      ]
    }
  ]
}
```

### GoogleService-Info.plist (iOS)

**Location**: Project root
**Format**: XML plist
**Contains**:
- API key for iOS
- Project ID and number
- App ID and bundle ID
- Feature flags

**Example**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
	<key>API_KEY</key>
	<string>AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</string>
	<key>PROJECT_ID</key>
	<string>your-project-id</string>
	<key>BUNDLE_ID</key>
	<string>id.sinomanapp.mobile</string>
</dict>
</plist>
```

### How to Obtain

1. **Firebase Console**: [https://console.firebase.google.com](https://console.firebase.google.com)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. **For Android**: Click Android app → Download `google-services.json`
6. **For iOS**: Click iOS app → Download `GoogleService-Info.plist`
7. Place files in project root (next to `package.json`)

---

## Security Best Practices

### 1. API Key Restrictions (Critical)

**Why**: Prevent unauthorized apps from using your Firebase project

**How**: See [API Key Restrictions](#api-key-restrictions) section below

### 2. Firebase Security Rules (Critical)

**Why**: Control who can read/write data in Firestore/Storage

**How**: See [Firebase Security Rules](#firebase-security-rules) section below

### 3. Firebase Authentication (Required)

**Why**: Verify user identity before granting access

**Implementation**:
```typescript
// Already implemented in Sinoman app
import { supabase } from '@services/supabase';

// User must be authenticated before accessing Firebase features
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  throw new Error('User not authenticated');
}
```

### 4. Firebase App Check (Recommended)

**Why**: Verify requests come from your genuine app (not bots/scrapers)

**How**:
1. Go to Firebase Console > App Check
2. Enable App Check for your app
3. For **iOS**: Use DeviceCheck or App Attest
4. For **Android**: Use Play Integrity API or SafetyNet
5. Enforce App Check for all services

**Code Example**:
```typescript
// Add to app initialization
import { initializeAppCheck } from '@react-native-firebase/app-check';

await initializeAppCheck({
  // Use Play Integrity on Android
  provider: 'playIntegrity',
  // Use debug token in development
  isTokenAutoRefreshEnabled: true,
});
```

### 5. Monitor Usage

**Where**: Firebase Console > Usage and billing

**What to monitor**:
- Unusual spike in requests
- Requests from unexpected locations
- High error rates
- Storage/bandwidth anomalies

**Set up alerts**:
1. Firebase Console > Alerts
2. Create alert for quota usage
3. Set threshold (e.g., 80% of quota)
4. Add notification email

---

## API Key Restrictions

### Step-by-Step Guide

#### 1. Navigate to Google Cloud Console

- Go to [https://console.cloud.google.com](https://console.cloud.google.com)
- Select your Firebase project from dropdown
- Navigate to **APIs & Services** > **Credentials**

#### 2. Restrict Android API Key

1. Find the API key for Android (usually named "Android key (auto created by Firebase)")
2. Click on the key name to edit
3. Under **Application restrictions**:
   - Select **Android apps**
   - Click **Add an item**
   - **Package name**: `id.sinomanapp.mobile`
   - **SHA-1 certificate fingerprint**: (get from your keystore)
4. Under **API restrictions**:
   - Select **Restrict key**
   - Enable only these APIs:
     - Firebase Installations API
     - Cloud Firestore API (if using Firestore)
     - Cloud Storage for Firebase API (if using Storage)
     - Firebase Analytics API
     - Firebase Performance Monitoring API
5. Click **Save**

#### 3. Get SHA-1 Fingerprint (Android)

**For debug keystore**:
```bash
# Windows
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android

# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**For production keystore**:
```bash
keytool -list -v -keystore /path/to/your/keystore.jks -alias your-key-alias
```

Copy the **SHA-1** value and add it to both:
- Google Cloud Console (API restrictions)
- Firebase Console (Project Settings > Your apps > Android app > Add fingerprint)

#### 4. Restrict iOS API Key

1. Find the API key for iOS (usually named "iOS key (auto created by Firebase)")
2. Click on the key name to edit
3. Under **Application restrictions**:
   - Select **iOS apps**
   - Click **Add an item**
   - **Bundle ID**: `id.sinomanapp.mobile`
4. Under **API restrictions**:
   - Select **Restrict key**
   - Enable only these APIs:
     - Firebase Installations API
     - Cloud Firestore API (if using Firestore)
     - Cloud Storage for Firebase API (if using Storage)
     - Firebase Analytics API
     - Firebase Performance Monitoring API
5. Click **Save**

#### 5. Verify Restrictions

**Test that restrictions work**:
1. Try using the API key from a different app → Should fail
2. Try using the API key from your app → Should succeed
3. Check Firebase Console > Usage → Should see requests only from your app

---

## Firebase Security Rules

### Overview

Firebase Security Rules define who can read/write data in:
- **Firestore** (NoSQL database)
- **Realtime Database** (JSON tree database)
- **Cloud Storage** (file storage)

### Firestore Security Rules

**Location**: Firebase Console > Firestore Database > Rules

**Example - Production Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // User profiles - users can only read/write their own
    match /user_profiles/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }

    // Transactions - read-only for owner
    match /transactions/{transactionId} {
      allow read: if isSignedIn();
      allow write: if false; // Only server can write
    }

    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true; // Public
      allow write: if false; // Only server/admin
    }

    // Default deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Key Principles**:
1. **Default deny** - Deny all access unless explicitly allowed
2. **Authenticate users** - Require `request.auth != null`
3. **Validate ownership** - Check `request.auth.uid` matches resource owner
4. **Validate data** - Check field types and values before write
5. **Test rules** - Use Firebase Console Rules Playground

### Cloud Storage Security Rules

**Location**: Firebase Console > Storage > Rules

**Example - Production Rules**:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // User avatars - users can read all, write own
    match /avatars/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // 5MB
                   && request.resource.contentType.matches('image/.*');
    }

    // Product images - public read, admin write
    match /products/{productId}/{fileName} {
      allow read: if true;
      allow write: if false; // Only server/admin
    }

    // Default deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Testing Security Rules

**Firebase Console Rules Playground**:
1. Firebase Console > Firestore/Storage > Rules
2. Click **Rules playground** tab
3. Select operation (read/write)
4. Enter path (e.g., `/user_profiles/user123`)
5. Add authentication (mock user ID)
6. Click **Run** to test

**Automated Testing** (advanced):
```bash
npm install -D @firebase/rules-unit-testing

# Create tests in firestore.rules.test.ts
# Run: npm test
```

---

## Git Security

### Why Gitignore Firebase Config Files?

1. **Defense in depth** - One layer of security
2. **Prevent automated bots** - GitHub Secret Scanning alerts
3. **Team workflow** - Developers use separate Firebase projects
4. **Best practice** - Industry standard

### .gitignore Configuration

**Already configured** in this project:

```gitignore
# Firebase / Google Services Configuration Files
# These files contain API keys and should never be committed
google-services.json
GoogleService-Info.plist
```

**Verify**:
```bash
git status
# Should NOT show google-services.json or GoogleService-Info.plist
```

### If Already Committed

If you've already committed these files, see [GIT_CLEANUP_INSTRUCTIONS.md](../GIT_CLEANUP_INSTRUCTIONS.md) for:
1. **BFG Repo-Cleaner** method (recommended)
2. **git filter-branch** method (traditional)
3. **git filter-repo** method (modern)

### Using Template Files

**For team collaboration**:
1. Commit template files: `google-services.json.example`, `GoogleService-Info.plist.example`
2. Team members copy templates to actual files
3. Fill in actual values from their own Firebase projects
4. Actual files are gitignored

**Setup instructions** in `README.md`:
```bash
cp google-services.json.example google-services.json
cp GoogleService-Info.plist.example GoogleService-Info.plist
# Then download actual files from Firebase Console
```

---

## Troubleshooting

### "API key exposed on GitHub" Alert

**What happened**: GitHub Secret Scanning detected your API key

**What to do**:
1. **Don't panic** - Firebase keys are meant to be in apps
2. **Verify restrictions** - Check API key restrictions are in place
3. **Check Security Rules** - Ensure Firebase Security Rules are configured
4. **Remove from git history** - See [GIT_CLEANUP_INSTRUCTIONS.md](../GIT_CLEANUP_INSTRUCTIONS.md)
5. **Rotate key** (optional) - Create new Firebase project if concerned

### How to Rotate API Keys

1. **Create new Firebase project**
2. **Download new config files**
3. **Update app with new config**
4. **Migrate data** (if needed)
5. **Delete old project** after migration complete

**Note**: Usually not necessary if restrictions are properly configured

### "Permission denied" Errors

**Symptom**: App can't read/write to Firestore/Storage

**Causes**:
1. **Security Rules too restrictive** - Check rules allow your use case
2. **User not authenticated** - Ensure user is logged in
3. **API key restrictions** - Check key is allowed for your app

**Debug**:
```typescript
// Enable Firestore debug logging
import firestore from '@react-native-firebase/firestore';

if (__DEV__) {
  firestore().settings({
    persistence: false,
  });
  // Check console for detailed error messages
}
```

### "Quota exceeded" Errors

**Symptom**: Firebase returns quota limit errors

**Causes**:
1. **Abuse** - Someone using your API key maliciously
2. **Bug** - Infinite loop making excessive requests
3. **Growth** - Legitimate usage exceeded free tier

**Solutions**:
1. **Check usage** - Firebase Console > Usage and billing
2. **Check Security Rules** - Ensure they're restrictive enough
3. **Enable billing** - Upgrade to Blaze plan for higher quotas
4. **Implement caching** - Reduce unnecessary API calls

---

## References

### Official Documentation

- [Firebase Security Overview](https://firebase.google.com/docs/rules)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)

### Internal Documentation

- [MONITORING.md](./MONITORING.md) - Firebase setup and usage guide
- [MONITORING_IMPLEMENTATION.md](./MONITORING_IMPLEMENTATION.md) - Implementation details
- [GIT_CLEANUP_INSTRUCTIONS.md](../GIT_CLEANUP_INSTRUCTIONS.md) - Remove files from git history

### Video Tutorials

- [Firebase Security Rules - Firebase YouTube](https://www.youtube.com/watch?v=eW5MdE3ZcAw)
- [Firebase App Check - Firebase YouTube](https://www.youtube.com/watch?v=qne2QRpnzCI)

### Community Resources

- [Firebase Slack Community](https://firebase.community/)
- [Stack Overflow - Firebase Tag](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase GitHub Discussions](https://github.com/firebase/firebase-js-sdk/discussions)

---

## Summary Checklist

Use this checklist to ensure Firebase is properly secured:

### API Keys
- [ ] Android API key restricted to app package name
- [ ] Android app SHA-1 fingerprint added
- [ ] iOS API key restricted to app bundle ID
- [ ] Only necessary Firebase APIs enabled
- [ ] API key usage monitored in Google Cloud Console

### Security Rules
- [ ] Firestore Security Rules configured (not default public)
- [ ] Cloud Storage Security Rules configured (not default public)
- [ ] Rules tested in Firebase Console Rules Playground
- [ ] Default deny all policy implemented

### Authentication & App Check
- [ ] Firebase Authentication integrated with Supabase Auth
- [ ] Firebase App Check enabled (optional but recommended)
- [ ] App Check enforced for all services

### Git Security
- [ ] Config files added to `.gitignore`
- [ ] Template files with placeholders committed instead
- [ ] Actual config files never committed (verify with `git log`)
- [ ] Team members instructed to use their own Firebase projects

### Monitoring
- [ ] Usage alerts configured in Firebase Console
- [ ] Quota limits set appropriately
- [ ] Error monitoring enabled (Sentry integration)
- [ ] Regular security audits scheduled

---

**Last Updated**: 2025-10-01
**Maintained By**: Sinoman Tech Team
**Questions**: tech@sinomanapp.id
