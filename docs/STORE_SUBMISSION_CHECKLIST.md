# Store Submission Checklist

This comprehensive checklist ensures you don't miss any critical steps before submitting to Google Play Store and Apple App Store.

---

## Pre-Submission Checklist

### Code Quality
- [ ] All unit tests passing (`npm test`)
- [ ] All integration tests passing
- [ ] All E2E tests passing (`npm run test:e2e:android` and `npm run test:e2e:ios`)
- [ ] No `console.log` statements in production code
- [ ] ESLint passing without errors (`npm run lint`)
- [ ] TypeScript type checking passing (`npm run type-check`)
- [ ] No unused dependencies in package.json
- [ ] Code reviewed by team

### Functionality
- [ ] **Authentication**
  - [ ] Phone number + OTP login works
  - [ ] Biometric authentication works (Face ID, Touch ID, Fingerprint)
  - [ ] Auto-logout after 15 minutes
  - [ ] Remember device functionality
- [ ] **Savings Management**
  - [ ] View balance (Pokok, Wajib, Sukarela)
  - [ ] Top-up via bank transfer
  - [ ] Top-up via virtual account
  - [ ] Top-up via e-wallet
  - [ ] Transaction history loads correctly
  - [ ] Filters work (date range, type)
- [ ] **QR Payments**
  - [ ] QR scanner opens and scans correctly
  - [ ] Payment confirmation screen displays
  - [ ] Payment processes successfully
  - [ ] My QR code generates and displays
  - [ ] Payment history tracked
- [ ] **Marketplace**
  - [ ] Product grid loads
  - [ ] Categories work
  - [ ] Search functionality
  - [ ] Add to cart
  - [ ] Checkout flow complete
  - [ ] Order history
- [ ] **Fit Challenge**
  - [ ] Active challenge displays
  - [ ] Daily check-in works
  - [ ] Progress chart updates
  - [ ] Leaderboard loads
  - [ ] Points awarded correctly
- [ ] **Profile & Settings**
  - [ ] Profile edit works
  - [ ] Photo upload
  - [ ] Security settings
  - [ ] Notification preferences
  - [ ] Language switching (if applicable)
- [ ] **Offline Mode**
  - [ ] App works without internet
  - [ ] Queued actions stored
  - [ ] Auto-sync when online
  - [ ] Conflict resolution

### Performance
- [ ] **Cold start time:** <3 seconds (test on low-end device)
- [ ] **Screen load time:** <1 second average
- [ ] **Frame rate:** ~60 FPS (no janky animations)
- [ ] **Memory usage:** <200MB average
- [ ] **App size:** <30MB (check build output)
- [ ] **Network efficiency:** Minimal data usage
- [ ] **Battery usage:** No excessive drain
- [ ] Tested on minimum OS version:
  - [ ] Android 6.0 (API 23)
  - [ ] iOS 13.0
- [ ] Tested on latest OS:
  - [ ] Android 14
  - [ ] iOS 17

### Assets
- [ ] **App Icon**
  - [ ] `icon-source.png` created (1024x1024)
  - [ ] All sizes generated (`npm run generate-assets`)
  - [ ] Icon displays correctly on device
  - [ ] No transparency issues
  - [ ] Safe area respected (no clipping)
- [ ] **Splash Screen**
  - [ ] `splash-source.png` created (2048x2048)
  - [ ] Splash generated (`npm run generate-assets`)
  - [ ] Displays correctly on all screen sizes
  - [ ] No distortion or stretching
- [ ] **Adaptive Icon (Android)**
  - [ ] `adaptive-icon.png` generated
  - [ ] `adaptive-icon-monochrome.png` created (white silhouette)
  - [ ] Displays correctly on Android 13+
- [ ] **Notification Icon**
  - [ ] `notification-icon.png` generated (96x96)
  - [ ] Displays correctly in notification tray

### Legal Documents
- [ ] **Privacy Policy**
  - [ ] Published at https://sinomanapp.id/privacy-policy
  - [ ] Accessible without login
  - [ ] Contains all required sections:
    - [ ] Data collection practices
    - [ ] Data usage
    - [ ] Data protection measures
    - [ ] User rights (access, deletion)
    - [ ] Contact information
  - [ ] Complies with Indonesian Data Protection Law
  - [ ] GDPR-compliant (if serving EU users)
- [ ] **Terms of Service**
  - [ ] Published at https://sinomanapp.id/terms-of-service
  - [ ] Accessible without login
  - [ ] Contains all required sections:
    - [ ] Eligibility requirements
    - [ ] Prohibited activities
    - [ ] Liability limitations
    - [ ] Dispute resolution
    - [ ] Contact information
- [ ] Legal docs linked in app (Settings > Legal)

### Configuration
- [ ] **app.json**
  - [ ] Version number updated (e.g., "1.0.0")
  - [ ] Android versionCode incremented
  - [ ] iOS buildNumber incremented
  - [ ] App name correct: "Sinoman Mobile App"
  - [ ] Bundle IDs correct:
    - [ ] iOS: `id.sinomanapp.mobile`
    - [ ] Android: `id.sinomanapp.mobile`
  - [ ] **EAS Project ID configured** ⚠️ REQUIRED
    - [ ] `expo.extra.eas.projectId` set in app.json
    - [ ] Valid UUID format (from `eas init`)
    - [ ] Matches EAS dashboard project
  - [ ] Permissions justified
  - [ ] Privacy descriptions clear (iOS InfoPlist)
- [ ] **eas.json**
  - [ ] Production profile configured
  - [ ] Android builds as app-bundle
  - [ ] iOS builds for App Store
  - [ ] Auto-increment enabled
  - [ ] Environment variables set
- [ ] **Environment Variables**
  - [ ] All secrets created in EAS:
    - [ ] `EXPO_PUBLIC_SUPABASE_URL`
    - [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY`
    - [ ] `EXPO_PUBLIC_SENTRY_DSN`
    - [ ] `EXPO_PUBLIC_API_URL` (if applicable)
  - [ ] Verified with `eas secret:list`
- [ ] **Firebase Configuration**
  - [ ] `google-services.json` in project root (Android)
  - [ ] `GoogleService-Info.plist` in project root (iOS)
  - [ ] Firebase plugins configured in app.json
  - [ ] Push notifications working
  - [ ] Analytics tracking
- [ ] **Sentry Configuration**
  - [ ] DSN configured
  - [ ] Source maps uploaded
  - [ ] Test error tracked in Sentry dashboard

### Security
- [ ] **Data Encryption**
  - [ ] Sensitive data encrypted (AES-256)
  - [ ] Expo SecureStore used for tokens
  - [ ] No hardcoded secrets in code
- [ ] **Network Security**
  - [ ] All API calls use HTTPS
  - [ ] Certificate pinning (if applicable)
  - [ ] TLS 1.3 enforced
- [ ] **Authentication**
  - [ ] OTP expiry working (5 minutes)
  - [ ] Rate limiting on OTP requests
  - [ ] Biometric authentication secure
  - [ ] Session timeout (15 minutes)
- [ ] **Code Security**
  - [ ] No sensitive logs in production
  - [ ] Error messages don't leak info
  - [ ] Jailbreak/root detection (if applicable)
  - [ ] Code obfuscation enabled (production builds)

---

## Build Checklist

### Before Building
- [ ] Latest code committed to Git
- [ ] Version numbers updated in app.json
- [ ] CHANGELOG.md updated with release notes
- [ ] All dependencies updated (check for security issues)
- [ ] Build cache cleared (if previous build failed)

### Build Execution
- [ ] **Android Production Build**
  ```bash
  eas build --profile production --platform android
  ```
  - [ ] Build completed successfully
  - [ ] Build time: ~15-25 minutes
  - [ ] Download URL received
  - [ ] AAB file downloaded
- [ ] **iOS Production Build**
  ```bash
  eas build --profile production --platform ios
  ```
  - [ ] Build completed successfully
  - [ ] Build time: ~15-25 minutes
  - [ ] Download URL received
  - [ ] IPA file downloaded

### Build Verification
- [ ] **Android**
  - [ ] Install AAB on test device via Play Console (internal testing)
  - [ ] App launches without crashes
  - [ ] All features work
  - [ ] Performance acceptable
  - [ ] No debug overlays visible
- [ ] **iOS**
  - [ ] Upload to TestFlight
  - [ ] Install on test device via TestFlight
  - [ ] App launches without crashes
  - [ ] All features work
  - [ ] Performance acceptable
  - [ ] No debug overlays visible

---

## Store Listing Checklist

### Google Play Store

#### App Details
- [ ] **App name:** "Sinoman - Koperasi Digital" (30 chars max)
- [ ] **Short description:** 80 characters (see `store-assets/descriptions/google-play-listing.md`)
- [ ] **Full description:** 4000 characters (see template)
- [ ] **Category:** Finance
- [ ] **Tags/Keywords:** koperasi, simpanan, qr payment, etc.
- [ ] **Contact email:** support@sinomanapp.id
- [ ] **Website:** https://sinomanapp.id
- [ ] **Phone:** +62 82331052577

#### Graphics
- [ ] **App icon:** 512x512 PNG uploaded
- [ ] **Feature graphic:** 1024x500 PNG/JPEG uploaded
- [ ] **Phone screenshots:** 5-8 images (1080x1920) uploaded
  - [ ] 01-dashboard.png
  - [ ] 02-qr-scanner.png
  - [ ] 03-savings.png
  - [ ] 04-marketplace.png
  - [ ] 05-fit-challenge.png
  - [ ] (Optional) 06-profile.png
  - [ ] (Optional) 07-transactions.png
- [ ] **Tablet screenshots (optional):** 7-10" tablet screenshots
- [ ] **Promo video (optional):** YouTube URL

#### Store Settings
- [ ] **Content rating:** Completed questionnaire
  - [ ] Category: Finance
  - [ ] Age rating: Everyone
- [ ] **Privacy Policy URL:** https://sinomanapp.id/privacy-policy
- [ ] **Data safety:** Declared data collection practices
  - [ ] Financial info: Yes
  - [ ] Personal info: Yes (name, email, phone)
  - [ ] Location: No (or Yes if using)
  - [ ] Photos: Yes (profile picture)
- [ ] **Target audience:** 18+ (financial app)
- [ ] **Countries:** Indonesia (or worldwide)
- [ ] **Pricing:** Free

### Apple App Store

#### App Information
- [ ] **Name:** "Sinoman - Koperasi Digital" (30 chars max)
- [ ] **Subtitle:** "Simpanan, Belanja, Kesehatan" (30 chars max)
- [ ] **Promotional text:** 170 characters (see template)
- [ ] **Description:** 4000 characters (see `store-assets/descriptions/app-store-listing.md`)
- [ ] **Keywords:** 100 characters, comma-separated
- [ ] **Support URL:** https://sinomanapp.id/support
- [ ] **Marketing URL:** https://sinomanapp.id
- [ ] **Privacy Policy URL:** https://sinomanapp.id/privacy-policy

#### Graphics
- [ ] **App icon:** 1024x1024 PNG uploaded (no transparency)
- [ ] **iPhone Screenshots:**
  - [ ] **6.5" Display (1284x2778):** 5-10 screenshots
    - [ ] 01-dashboard.png
    - [ ] 02-qr-scanner.png
    - [ ] 03-savings.png
    - [ ] 04-marketplace.png
    - [ ] 05-fit-challenge.png
  - [ ] **5.5" Display (1242x2208):** Same 5-10 screenshots
- [ ] **iPad Screenshots (optional):** 12.9" or 11" screenshots
- [ ] **App Preview (optional):** 15-30 second video

#### App Store Settings
- [ ] **Primary category:** Finance
- [ ] **Secondary category:** Lifestyle
- [ ] **Age rating:** 4+ (or appropriate rating)
- [ ] **Copyright:** © 2025 Koperasi Sinoman Ponorogo
- [ ] **Pricing:** Free
- [ ] **Availability:** Indonesia (or worldwide)

#### App Privacy
- [ ] **Privacy practices declared:**
  - [ ] Financial info: Collected
  - [ ] Contact info: Collected (name, email, phone)
  - [ ] User content: Collected (profile photos)
  - [ ] Identifiers: Collected (device ID)
  - [ ] Usage data: Collected (analytics)
  - [ ] Location: Not collected (or Collected if using)
- [ ] **Data linked to user:** Yes (all above)
- [ ] **Data used for tracking:** Analytics only

#### App Review Information
- [ ] **Demo account credentials:**
  - [ ] Phone number: +62 812 3456 7890 (example)
  - [ ] Notes: "OTP will be sent to this number. Alternatively, use test OTP: 123456"
- [ ] **Contact information:**
  - [ ] First name: [Your name]
  - [ ] Last name: [Your name]
  - [ ] Phone: +62 82331052577
  - [ ] Email: dev@sinomanapp.id
- [ ] **Notes for reviewer:**
  ```
  This app requires membership in Koperasi Sinoman Ponorogo.
  For review purposes, please use the test account provided above.

  Key features to test:
  1. Login with phone + OTP
  2. View savings balance
  3. Scan QR code for payment (demo QR in Help section)
  4. Browse Marketplace
  5. Check Fit Challenge progress
  ```

---

## Submission Checklist

### Google Play Console

- [ ] **Navigate to:** Production > Create new release
- [ ] **Upload AAB:** From EAS build or via `eas submit`
- [ ] **Release name:** "1.0.0 - Initial Release"
- [ ] **Release notes (Indonesian):**
  ```
  Rilis perdana Sinoman Mobile App!

  ✨ Fitur:
  - Kelola simpanan (Pokok, Wajib, Sukarela)
  - Pembayaran QR code
  - Marketplace dengan harga khusus member
  - Fit Challenge program kesehatan
  - Keamanan tingkat tinggi (OTP + Biometric)

  Sehat Bareng, Kaya Bareng, Bareng Sinoman!
  ```
- [ ] **Release notes (English - optional):**
  ```
  First release of Sinoman Mobile App!

  ✨ Features:
  - Manage savings (Pokok, Wajib, Sukarela)
  - QR code payments
  - Marketplace with member discounts
  - Fit Challenge health program
  - High security (OTP + Biometric)

  Join us for health and wealth!
  ```
- [ ] **Review and rollout:**
  - [ ] Start with **Internal testing** (recommended)
  - [ ] Invite testers via email
  - [ ] Test for 1-3 days
  - [ ] Promote to **Production** when ready
- [ ] **Submit for review**

### App Store Connect

- [ ] **Navigate to:** My Apps > Sinoman > App Store > [Version]
- [ ] **Select build:** Choose the build uploaded via `eas submit` or Xcode
- [ ] **Version number:** 1.0.0
- [ ] **Copyright:** © 2025 Koperasi Sinoman Ponorogo
- [ ] **What's New in This Version:**
  ```
  Rilis perdana Sinoman Mobile App!

  ✨ Fitur:
  • Kelola simpanan (Pokok, Wajib, Sukarela)
  • Pembayaran QR code
  • Marketplace dengan harga khusus member
  • Fit Challenge program kesehatan
  • Keamanan tingkat tinggi (OTP + Biometric)

  Sehat Bareng, Kaya Bareng, Bareng Sinoman!
  ```
- [ ] **App Review Information:** Filled (demo account, notes)
- [ ] **Export Compliance:**
  - [ ] If using encryption: Declare usage
  - [ ] If only HTTPS: Select "No" (standard encryption)
- [ ] **Submit for review**

---

## Post-Submission Checklist

### Monitoring Setup
- [ ] **Sentry Dashboard:** Configured and accessible
  - [ ] Alerts set for crash rate >1%
  - [ ] Email notifications enabled
- [ ] **Firebase Analytics:** Configured and tracking
  - [ ] DAU/MAU tracking
  - [ ] Screen views tracked
  - [ ] Conversion events tracked
- [ ] **App Store Metrics:** Monitoring tools enabled
  - [ ] Google Play Console > Statistics
  - [ ] App Store Connect > Analytics

### Support Readiness
- [ ] **Email:** support@sinomanapp.id monitored
- [ ] **WhatsApp:** +62 82331052577 staffed
- [ ] **In-app support:** Help section complete
- [ ] **FAQ:** Published on website
- [ ] **Response SLA:** <24 hours for critical, <48 for general

### Marketing Preparation
- [ ] **Launch announcement:** Draft ready
- [ ] **Social media posts:** Prepared
- [ ] **Email to members:** Draft ready
- [ ] **Press release (optional):** Prepared
- [ ] **Screenshots for marketing:** Exported
- [ ] **Promo video (optional):** Ready

### Team Readiness
- [ ] **On-call rotation:** Scheduled for launch week
- [ ] **Incident response plan:** Documented
- [ ] **Rollback plan:** Tested (how to pull app if critical bug)
- [ ] **Team briefed:** Everyone knows their role

---

## Launch Day Checklist

### Before Launch (T-1 day)
- [ ] Final build tested on multiple devices
- [ ] Monitoring dashboards checked
- [ ] Support email/WhatsApp tested
- [ ] Team briefed on launch plan
- [ ] Backup contact info shared (in case of emergency)

### Launch Day (T-0)
- [ ] **Morning:**
  - [ ] Check app store status (approved/pending)
  - [ ] Monitor for any last-minute review feedback
  - [ ] Test app download on fresh devices
- [ ] **App Goes Live:**
  - [ ] Verify app is discoverable in stores
  - [ ] Test download and installation
  - [ ] Test first-time user experience
  - [ ] Send launch announcement
- [ ] **Evening:**
  - [ ] Check metrics:
    - [ ] Downloads
    - [ ] Crashes (should be <1%)
    - [ ] User ratings
    - [ ] Support tickets
  - [ ] Respond to user reviews
  - [ ] Address critical issues immediately

### Week 1 Post-Launch
- [ ] **Daily:**
  - [ ] Monitor crash-free rate (should be >99%)
  - [ ] Check error logs (Sentry)
  - [ ] Review user feedback
  - [ ] Respond to reviews (within 24 hours)
- [ ] **By Day 7:**
  - [ ] Metrics analysis:
    - [ ] Total downloads
    - [ ] DAU/MAU
    - [ ] Retention rate (D1, D7)
    - [ ] Average rating
    - [ ] Crash-free rate
  - [ ] Post-launch retrospective meeting
  - [ ] Plan hotfix release (if needed)
  - [ ] Celebrate launch! 🎉

---

## Success Criteria

### Technical Metrics
- [ ] **Crash-free rate:** >99%
- [ ] **ANR rate (Android):** <0.5%
- [ ] **Cold start time:** <3 seconds
- [ ] **Screen load time:** <1 second average
- [ ] **Memory usage:** <200MB average
- [ ] **App size:** <30MB

### User Metrics
- [ ] **Downloads:** [Set target, e.g., 1,000 in Week 1]
- [ ] **Active users (DAU):** [Set target]
- [ ] **Retention (D7):** >40%
- [ ] **Average rating:** >4.0 stars
- [ ] **Support response time:** <24 hours

### Business Metrics
- [ ] **Transaction volume:** [Set target]
- [ ] **Top-up success rate:** >95%
- [ ] **Payment success rate:** >95%
- [ ] **User satisfaction:** [Based on reviews/surveys]

---

## Notes

- **This checklist is comprehensive but may not cover every edge case.** Adapt as needed for your specific app.
- **Use this as a living document.** Update it based on learnings from each release.
- **Don't skip steps!** Each item is here because it's been a source of issues in the past.

---

**When all items are checked, you're ready to launch! 🚀**

Good luck, and may your launch be smooth and successful!
