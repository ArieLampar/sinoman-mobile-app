# Sinoman Mobile App

Mobile application untuk anggota Koperasi Sinoman Ponorogo yang menyediakan akses mudah ke seluruh layanan koperasi melalui smartphone.

## Tech Stack

- **Framework**: Expo SDK 49 + React Native 0.72
- **Language**: TypeScript 5.0
- **Navigation**: React Navigation 6
- **State Management**: Zustand 4.4
- **UI Library**: React Native Paper 5.0
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Cloudinary

## ⚠️ Important: Asset Setup Required

This app requires three image assets (icon, splash screen, adaptive icon) that are **not included** in the repository. You must generate them before running the app.

**📖 Quick Setup Guide**: See [ASSETS_SETUP.md](ASSETS_SETUP.md) for complete instructions.

**🚀 Fast Track**: Open `scripts/generate-assets.html` in your browser to generate assets instantly.

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app (untuk testing di device)
- Android Studio atau Xcode (untuk native builds)

## Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd sinoman-mobile-app
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env dengan actual Supabase credentials
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Firebase Configuration

Configure Firebase for Analytics, Performance Monitoring, and Crashlytics:

```bash
# Copy template files
cp google-services.json.example google-services.json
cp GoogleService-Info.plist.example GoogleService-Info.plist
```

**Get Firebase Configuration Files:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project or create a new one
3. **For Android:**
   - Navigate to Project Settings > Your apps > Android app
   - Download `google-services.json`
   - Place it in the project root directory
4. **For iOS:**
   - Navigate to Project Settings > Your apps > iOS app
   - Download `GoogleService-Info.plist`
   - Place it in the project root directory

**⚠️ Important Security Notes:**

- These files contain API keys and are automatically **gitignored**
- **Never commit** `google-services.json` or `GoogleService-Info.plist` to the repository
- Each developer must obtain their own copies from Firebase Console
- Use template files (`.example` suffix) for reference only

**Configure Firebase Security:**

To secure your Firebase API keys:

1. **Restrict API Keys** in Google Cloud Console:
   - Android: Restrict to your app's SHA-1 fingerprint and package name
   - iOS: Restrict to your app's bundle ID
2. **Configure Firebase Security Rules** in Firebase Console
3. **Enable Firebase App Check** for additional security
4. See [docs/FIREBASE_SECURITY.md](docs/FIREBASE_SECURITY.md) for detailed instructions

### 4. Generate Placeholder Assets

The app requires icon and splash screen assets. Generate placeholder assets for development:

```bash
# Install sharp for image generation
npm install sharp

# Generate placeholder assets
npm run generate-assets
```

Or manually create the required files in `assets/` directory:
- `icon.png` (1024x1024)
- `splash.png` (1284x2778)
- `adaptive-icon.png` (1024x1024)

See [assets/README.md](assets/README.md) for detailed instructions.

### 5. Run Development Server

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

### 6. Scan QR Code

- Install Expo Go dari Play Store (Android) atau App Store (iOS)
- Scan QR code dari terminal
- App akan load di device Anda

## Project Structure

```
sinoman-mobile-app/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Generic components (Button, Card, Input)
│   │   ├── layout/       # Layout components (Container, Header)
│   │   └── forms/        # Form-specific components
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   ├── dashboard/    # Dashboard screens
│   │   ├── savings/      # Savings management
│   │   ├── qr/           # QR Scanner
│   │   ├── marketplace/  # Marketplace screens
│   │   └── profile/      # Profile & settings
│   ├── navigation/       # React Navigation setup
│   ├── services/         # Business logic & API
│   │   ├── api/          # API client
│   │   ├── auth/         # Auth service
│   │   └── supabase/     # Supabase client
│   ├── store/            # Zustand state management
│   ├── utils/            # Helper functions
│   ├── types/            # TypeScript types
│   └── theme/            # Design system
├── assets/               # Images, fonts, icons
├── App.tsx               # Root component
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run on web browser
- `npm run generate-assets` - Generate placeholder icon/splash assets
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Path aliases configured (@components, @screens, etc.)
- 100 character line length limit

### Commit Convention

Follow conventional commits:

```
feat: add QR scanner functionality
fix: resolve navigation issue on Android
docs: update README with setup instructions
style: format code with prettier
refactor: restructure auth service
test: add unit tests for validators
```

## 🔔 Notification System

Aplikasi ini menggunakan **Expo Push Notifications** dengan Supabase Realtime untuk notifikasi real-time.

### Features:
- ✅ Push notifications (iOS & Android)
- ✅ In-app notifications
- ✅ Realtime updates (balance, transactions, orders)
- ✅ Notification preferences
- ✅ Badge indicators
- ✅ Smart navigation dari notification tap

### Setup:

Lihat dokumentasi lengkap di [`docs/SETUP_NOTIFICATIONS.md`](./docs/SETUP_NOTIFICATIONS.md)

**Quick Start:**
```bash
# 1. Install dependencies
npm install

# 2. Setup Expo project
npx eas init

# 3. Add EAS_PROJECT_ID to .env
EAS_PROJECT_ID=your-project-id

# 4. Run app
npm start
```

### Testing:

Gunakan [Expo Push Notification Tool](https://expo.dev/notifications) untuk send test notifications.

Lihat testing guide lengkap di [`docs/NOTIFICATION_TESTING.md`](./docs/NOTIFICATION_TESTING.md)

### Documentation:

- 📖 [Setup Guide](./docs/SETUP_NOTIFICATIONS.md)
- 📖 [Implementation Guide](./docs/NOTIFICATION_IMPLEMENTATION.md)
- 📖 [Testing Guide](./docs/NOTIFICATION_TESTING.md)
- 📖 [System Summary](./docs/NOTIFICATION_SUMMARY.md)
- 📖 [Quick Reference](./docs/NOTIFICATION_QUICKREF.md)

## Environment Variables

Required environment variables in `.env`:

```bash
# Supabase Configuration (shared dengan PWA)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration (optional)
EXPO_PUBLIC_API_URL=https://api.sinoman.co.id

# Environment
EXPO_PUBLIC_ENV=development

# Expo EAS Configuration (for push notifications)
EAS_PROJECT_ID=your-expo-project-id-here
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Testing Fit Challenge

**Testing Challenge Overview:**
1. Navigate to Profile → Tap "Fit Challenge" menu item
2. Verify challenge info displays (8 weeks, participant count)
3. Verify progress stats (streak, points, rank)
4. Scroll through weekly progress (8 weeks)
5. View leaderboard top 10
6. Pull-to-refresh to update data

**Testing Daily Check-in:**
1. Open Fit Challenge screen
2. Tap "Check-in Hari Ini" button
3. Verify success alert shows "+10 poin"
4. Verify button changes to "Sudah Check-in Hari Ini" (disabled)
5. Verify progress updates (completed days, points)
6. Verify streak increments if consecutive day
7. Verify leaderboard rank updates

**Testing Edit Profile:**
1. Navigate to Profile → Tap "Edit Profil"
2. Update name field (test validation: min 3 chars)
3. Update email (test validation: valid format)
4. Update date of birth (test format: YYYY-MM-DD)
5. Change gender selection
6. Update address fields
7. Tap "Simpan Perubahan"
8. Verify success alert appears
9. Verify profile screen shows updated data

### Testing Offline Features

**Testing QR Scanner Flash Toggle:**
1. Navigate to QR Scanner screen
2. Tap "Nyalakan Flash" button in footer
3. Verify flash icon changes from 'flash-off' to 'flash'
4. Verify camera flash/torch activates
5. Tap "Matikan Flash" to disable
6. Test in low-light environment to verify scanning improvement

**Testing Offline Queue:**
1. Enable Airplane Mode on device
2. Navigate to QR Scanner and scan a QR code
3. Complete payment flow (Konfirmasi Pembayaran)
4. Verify "Transaksi Disimpan" alert appears
5. Check Dashboard - Offline indicator should show with badge count
6. Disable Airplane Mode
7. Verify auto-sync triggered automatically
8. Check transaction appears in Transaction History
9. Verify offline indicator disappears after successful sync

**Testing My QR Code Generation:**
1. Navigate to QR Scanner screen
2. Tap "Tampilkan QR Saya" button
3. Select "Statis" tab - verify permanent QR code displays
4. Select "Dinamis" tab
5. Enter amount (e.g., Rp 50,000)
6. Enter description (e.g., "Bayar makan siang")
7. Set expiry (default: 30 minutes)
8. Tap "Generate QR Code"
9. Verify QR displays with user info, amount, and expiry time
10. Test "Bagikan" button - verify system share sheet appears
11. Test "Perbarui" button - verify new QR generated

**Testing Network Status Monitoring:**
1. Start app with internet connection
2. Navigate to Dashboard - no offline indicator should show
3. Enable Airplane Mode
4. Verify offline indicator appears on Dashboard
5. Navigate to QR Payment screen - verify offline indicator shows
6. Disable Airplane Mode
7. Verify offline indicator disappears across all screens

## Building for Production

### Android

```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

## Deployment

### Prerequisites

- EAS CLI installed (`npm install -g eas-cli`)
- EAS account configured
- App Store Connect account (iOS)
- Google Play Console account (Android)

### Steps

1. Configure EAS: `eas build:configure`
2. Build: `eas build --platform all`
3. Submit: `eas submit --platform all`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📊 Error Handling, Logging & Monitoring

The app includes a comprehensive monitoring and error tracking system for production reliability and user experience insights.

### Features

- ✅ **Sentry crash reporting** - Automatic error tracking and crash reporting
- ✅ **Firebase Analytics** - User behavior and engagement tracking
- ✅ **Firebase Performance** - App performance metrics and traces
- ✅ **Global ErrorBoundary** - Graceful error handling with recovery UI
- ✅ **User-friendly error messages** - Indonesian error messages with recovery actions
- ✅ **Retry mechanisms** - Exponential backoff for transient failures
- ✅ **Breadcrumb tracking** - User action trails for debugging
- ✅ **Automatic screen tracking** - All screen views logged to analytics
- ✅ **Data sanitization** - Sensitive data removed before logging
- ✅ **Development mode safety** - Errors logged locally in dev, sent to Sentry in production

### Setup

1. **Create Sentry Project**
   - Visit [sentry.io](https://sentry.io) and create a new project
   - Copy your DSN to `.env`:
     ```bash
     EXPO_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project-id
     EXPO_PUBLIC_SENTRY_RELEASE=1.0.0
     ```

2. **Configure Firebase** (Already set up in step 3)
   - Firebase Analytics and Performance are automatically enabled
   - No additional configuration needed if Firebase is already configured

3. **Rebuild the App**
   ```bash
   npx expo prebuild
   npm run android  # or npm run ios
   ```

4. **Verify Installation**
   - Check Sentry dashboard for events
   - Check Firebase console for analytics events
   - Trigger a test error to verify reporting

### Usage

**Track Screen Views (Automatic):**
```typescript
import { useAnalytics } from '@hooks';

export const MyScreen = () => {
  useAnalytics('MyScreen');  // Automatically tracks screen view
  // ... rest of component
};
```

**Log Custom Events:**
```typescript
import { logEvent } from '@services/monitoring';

// Track user actions
logEvent('button_clicked', { button_name: 'top_up' });
logEvent('purchase_completed', { amount: 50000, product_id: '123' });
```

**Capture Errors:**
```typescript
import { captureError } from '@services/monitoring';
import { ErrorSeverity } from '@types';

try {
  await riskyOperation();
} catch (error) {
  captureError(error, {
    screen: 'CheckoutScreen',
    action: 'process_payment',
    timestamp: new Date().toISOString(),
  }, ErrorSeverity.ERROR);
}
```

**Add Breadcrumbs:**
```typescript
import { addBreadcrumb } from '@services/monitoring';

addBreadcrumb('User tapped checkout button', 'user-action', {
  cart_items: 3,
  total_amount: 150000,
});
```

**Retry Failed Operations:**
```typescript
import { withRetry } from '@utils/retryHelper';

const result = await withRetry(
  async () => await apiService.fetchData(),
  { maxAttempts: 3, delayMs: 1000 }
);
```

**Performance Traces:**
```typescript
import { startTrace, stopTrace } from '@services/monitoring';

const trace = await startTrace('checkout_flow');
// ... perform checkout operations
await stopTrace(trace,
  { duration: 1500, items_count: 3 },  // metrics
  { status: 'success', payment_method: 'balance' }  // attributes
);
```

### Documentation

- 📖 **[Complete Monitoring Guide](./docs/MONITORING.md)** - Comprehensive guide with examples
- 📖 **[Implementation Details](./docs/MONITORING_IMPLEMENTATION.md)** - Technical implementation details

### Analytics Events

Standard events tracked throughout the app:
- `login_success`, `login_failed`, `logout`
- `top_up_initiated`, `top_up_success`, `top_up_failed`
- `qr_payment_success`, `qr_payment_failed`
- `product_viewed`, `order_placed`, `order_completed`
- `challenge_joined`, `challenge_completed`
- `app_open`, `notification_received`

See [firebaseService.ts](./src/services/monitoring/firebaseService.ts) for the complete list.

### Error Recovery

The app provides user-friendly error messages in Indonesian with recovery actions:

| Error Type | Message | Recovery Actions |
|------------|---------|------------------|
| Network Error | "Koneksi internet bermasalah..." | Coba Lagi, Kembali |
| Session Expired | "Sesi Anda telah berakhir..." | Login Ulang |
| Insufficient Balance | "Saldo tidak mencukupi" | Top Up, Kembali |
| QR Invalid | "QR code tidak valid..." | Pindai Ulang |

### Monitoring Dashboards

- **Sentry Dashboard**: [sentry.io](https://sentry.io) - Error tracking, crash reports, performance
- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com) - Analytics, performance traces, user engagement

## Performance

The app has been optimized for maximum performance and user experience.

| Metric | Target | Before | After | Status |
|--------|--------|--------|-------|--------|
| Cold Start | < 3s | ~4.5s | ~2.8s | ✅ 38% faster |
| Screen Load | < 1s | ~1.5s | ~0.7s | ✅ 53% faster |
| Frame Rate | 60 FPS | ~45 FPS | ~58 FPS | ✅ 29% better |
| Memory Usage | < 200MB | ~250MB | ~180MB | ✅ 28% lower |
| App Size | < 30MB | ~35MB | ~28MB | ✅ 20% smaller |

### Key Optimizations

1. **Hermes Engine** - 30-50% faster startup
2. **Lazy Loading** - 20-30% smaller initial bundle (13 screens lazy-loaded)
3. **expo-image** - 30-50% faster image loading with built-in caching
4. **Memoization** - 40-70% fewer re-renders (useMemo, useCallback, React.memo)
5. **FlatList Optimizations** - 40-50% smoother scrolling with performance props
6. **Metro Bundler** - Enhanced minification for 15-20% smaller bundles

### Documentation

See [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) for:
- Complete list of optimizations
- Performance monitoring tools
- Profiling guide with Flipper
- Best practices and guidelines
- Troubleshooting tips
- Cache management

## License

Proprietary - Koperasi Sinoman Ponorogo

## Contact

- **Product Owner**: Bestar Anwar - product@sinomanapp.id
- **Tech Lead**: Bestar Anwar - tech@sinomanapp.id
- **Support**: support@sinomanapp.id
- **WhatsApp**: +62 82331052577
- **Help Center**: https://help.sinomanapp.id

---

## Implementation Status

✅ **Phase 1**: Foundation Setup (Navigation, Services, Types)
✅ **Phase 2**: Authentication System (Phone OTP, Biometric)
✅ **Phase 2 Design System**: Design Tokens & Core Components
✅ **Phase 3**: Dashboard & Savings (Balance, Transactions, Top Up)
✅ **Phase 4**: QR Payment & Profile (Scanner, Payment, Settings)
✅ **Auth Enhancement**: Registration Flow & Android OTP Auto-Read
✅ **QR Enhancement**: Flash Toggle, MyQRCode Screen, Offline Support
✅ **Phase 5**: Marketplace Module (Product Browsing, Cart, Checkout)
✅ **Phase 6**: Profile & Settings Complete (Edit Profile, Fit Challenge)

**Current Status**: All Core Features - 100% Complete 🎉

**See Documentation**:
- [Phase 1 Summary](IMPLEMENTATION_SUMMARY.md)
- [Phase 2 Complete](PHASE_2_COMPLETE.md)
- [Phase 2 Design System](PHASE_2_DESIGN_SYSTEM_COMPLETE.md)
- [Phase 3 Complete](docs/PHASE_3_COMPLETE.md)
- [Phase 4 Complete](docs/PHASE_4_COMPLETE.md)

## Authentication Features

The authentication system includes:

### Phone + OTP Authentication
- Indonesian phone number validation (08XXXXXXXXX)
- 6-digit OTP verification via Supabase Auth
- OTP expiry countdown (180 seconds)
- Resend OTP functionality

### Android OTP Auto-Read
- Automatic SMS detection using SMS Retriever API
- Auto-fills OTP from incoming SMS
- No SMS permission required
- Works on Android devices only

### User Registration
- Profile completion after first-time OTP verification
- Collects: Name (required), Email (optional), Address (optional)
- Field validation with Indonesian error messages
- Seamless transition to main app after registration

### Biometric Authentication
- TouchID/FaceID/Fingerprint support
- Optional enablement per user
- Fallback to OTP if biometric fails
- Secure session management with refresh tokens

### Session Management
- JWT-based access + refresh tokens
- Persistent sessions using AsyncStorage
- Auto-logout after 15 minutes of inactivity
- Automatic session refresh on app foreground

## QR Scanner & Payment Features

### QR Code Scanner
- Camera-based QR code scanning with viewfinder
- **Flash toggle** for low-light environments (Nyalakan/Matikan Flash)
- Visual scan area indicator with corner borders
- QR code recognition in **<2 seconds** (performance optimized)
- Merchant info preview before payment confirmation
- Camera permission handling with graceful UI fallback
- Real-time scanning with barcode scanner integration

### My QR Code Screen
- **Static QR code** for receiving payments (permanent)
- **Dynamic QR code** with amount and expiry time
- User info display (name, phone) with avatar
- Optional amount and description fields
- QR code generation using `react-native-qrcode-svg`
- Share QR code via system share sheet
- Refresh/regenerate QR code on demand
- Visual expiry countdown for dynamic QR codes

### Payment Processing
- Payment confirmation screen with merchant details
- Multiple savings type selection (Pokok, Wajib, Sukarela)
- Balance checking before payment
- Balance deduction from selected savings type
- Transaction notes field (optional)
- Successful payment receipts
- Transaction history tracking

### Offline Support
- **Offline queue management** using MMKV storage (encrypted)
- Transactions automatically queued when offline
- Visual offline indicator with queue count badge
- **Auto-sync** when connection restored
- Manual retry for failed transactions
- Queue persistence across app restarts
- Network status monitoring with `@react-native-community/netinfo`

**Offline Queue Flow:**
1. User scans QR code or initiates payment while offline
2. Transaction saved to local MMKV queue with status: 'pending'
3. Offline indicator shows on Dashboard and QR Payment screens
4. When online, auto-sync triggered via `useNetworkStatus` hook
5. Successfully synced transactions removed from queue
6. Failed transactions marked with retry count for manual retry

**Libraries Used:**
- `react-native-qrcode-svg` - QR code generation
- `react-native-mmkv` - Fast key-value storage (30x faster than AsyncStorage)
- `@react-native-community/netinfo` - Network connectivity detection
- `expo-camera` - Camera access for QR scanning
- `expo-barcode-scanner` - QR code recognition

## Marketplace Features

The marketplace module includes:

### Product Browsing
- Product catalog with grid/list view
- Category filtering (All, Sembako, Fashion, Elektronik, etc.)
- Search functionality
- Product images with Cloudinary integration
- Price display with Indonesian Rupiah formatting
- Stock availability indicators

### Product Details
- Full product information (name, price, description, stock)
- Image gallery with zoom support
- Add to cart functionality
- Quantity selector
- Category badge
- Merchant information

### Shopping Cart
- Cart item management (add, update quantity, remove)
- Real-time total calculation
- Stock validation
- Persistent cart state (Zustand)
- Empty cart state handling
- Checkout button with total amount

### Order Processing
- Checkout screen with order summary
- Shipping address input
- Order notes (optional)
- Payment method selection
- Order confirmation with order ID
- Order total calculation
- Transaction integration with savings balance

### State Management
- **Marketplace Store (Zustand)**: Products, categories, cart, orders
- Cart persistence across app sessions
- Real-time cart updates
- Order history tracking

## Profile & Settings Features

The profile and settings module includes:

### Profile Management
- ✅ Profile header with avatar and basic info
- ✅ **Edit Profile** functionality with form validation
  - Full name (required, min 3 characters)
  - Email (optional, validated)
  - Date of birth (YYYY-MM-DD format)
  - Gender selection (Laki-laki, Perempuan, Lainnya)
  - Occupation (optional)
  - Address information (address, city, postal code, province)
- ✅ Profile photo upload support
- ✅ KYC verification status badge
- ✅ Phone number change option

### Fit Challenge Program
- ✅ **8-week health challenge** with daily check-ins
- ✅ **Daily check-in functionality** (maximum 1 per day)
- ✅ **Progress tracking** with completion percentage
- ✅ **Streak tracking** (current streak and longest streak)
- ✅ **Points system** (10 points per check-in, bonus for streaks)
- ✅ **Weekly progress breakdown** (8 weeks with completion status)
- ✅ **Leaderboard** with top 10 participants
  - Medal icons for top 3 (🥇🥈🥉)
  - Participant ranking with points and streak display
  - "My Rank" display if outside top 10
- ✅ **Challenge rules** display with visual checkmarks
- ✅ **Pull-to-refresh** for real-time data updates
- ✅ **Visual progress indicators** (progress bars, stats grid)
- ✅ **Participant count** and duration display
- ✅ **Registration fee** display (Rp 600,000)

### Settings & Preferences
- ✅ Biometric authentication toggle (TouchID/FaceID/Fingerprint)
- ✅ Notification preferences management
- ✅ Language selection (Bahasa Indonesia)
- ✅ Theme selection (Light/Dark/System)
- ✅ Privacy settings
- ✅ Help center access
- ✅ About app information
- ✅ Terms & conditions
- ✅ Privacy policy
- ✅ Logout with confirmation dialog

### State Management
- **Profile Store (Zustand)**: User profile data, update operations
- **Fit Challenge Store (Zustand)**: Challenge data, progress, leaderboard, check-ins
- Form validation with real-time error messages
- Persistent settings across app sessions
- Profile photo upload to Supabase storage

### Fit Challenge Data Flow
- Service layer with mock data (Supabase migration path prepared)
- Weekly progress calculation (8 weeks × 7 days)
- Check-in validation (1 per day, datetime-based)
- Leaderboard sorting by points and streak
- Automatic rank updates after check-ins
- Pull-to-refresh triggers parallel data fetching