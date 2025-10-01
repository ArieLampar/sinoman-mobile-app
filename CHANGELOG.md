# Changelog

All notable changes to Sinoman Mobile App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-01-10

#### Notification System (Complete Implementation)

**Services**
- `notificationService.ts` - Complete Expo push notification integration
  - Permission request flow for iOS & Android
  - Expo push token registration and management
  - Android notification channels (default, transactions, promotions)
  - Local notification scheduling
  - Badge count management
  - Notification listeners (received & tapped)
  - Background token sync with Supabase
  - Full initialization and cleanup flows

- `realtimeService.ts` - Supabase Realtime subscriptions
  - Balance updates subscription
  - Transaction updates subscription
  - Order status updates subscription
  - In-app notifications subscription
  - Fit Challenge updates subscription
  - Presence tracking (online/offline status)
  - Broadcast messaging support
  - Channel management and cleanup
  - Automatic reconnection handling

**State Management**
- `notificationStore.ts` - Zustand store for notification state
  - Complete notification management (add, read, delete)
  - Settings management with persistence
  - Permission status tracking
  - Badge count synchronization
  - Unread count tracking
  - Integration with realtime callbacks
  - Auto-initialization on login
  - Auto-cleanup on logout

**React Hooks**
- `useNotifications()` - Main notification hook
  - Automatic listener setup/cleanup
  - Smart navigation based on notification type
  - App state awareness (background/foreground)
  - Seamless integration with screens
- `useNotificationPermission()` - Permission management
- `useNotificationSettings()` - Settings management

**Type Definitions**
- `notification.types.ts` - Complete TypeScript definitions
  - NotificationType enum
  - NotificationData interface
  - PushNotification model
  - NotificationSettings interface
  - ExpoPushTokenData interface
  - NotificationPermissionStatus interface

**Documentation**
- `NOTIFICATION_QUICKREF.md` - One-page quick reference (2 pages)
- `NOTIFICATION_IMPLEMENTATION.md` - Step-by-step implementation guide (10 pages)
- `NOTIFICATION_TESTING.md` - Comprehensive testing procedures (15 pages)
- `NOTIFICATION_SUMMARY.md` - Complete system overview (8 pages)
- `docs/README.md` - Documentation index and navigation

**Database Schema**
- `push_tokens` table schema with RLS policies
- `notifications` table schema with RLS policies
- Realtime publication configuration
- Database trigger examples

**Features**
- ✅ Push notification support (iOS & Android)
- ✅ Permission handling with fallbacks
- ✅ Expo push token registration
- ✅ Local notification scheduling
- ✅ Badge management (iOS)
- ✅ Android notification channels
- ✅ Realtime balance updates
- ✅ Realtime transaction updates
- ✅ Realtime order updates
- ✅ In-app notification list
- ✅ Notification settings/preferences
- ✅ Smart notification navigation
- ✅ Offline/online handling
- ✅ Multi-device support
- ✅ Presence tracking
- ✅ Broadcast messaging

### Changed

#### Configuration
- Updated `app.json` package name: `id.co.sinoman.mobile` → `id.sinomanapp.mobile`
- Updated `app.json` iOS bundle identifier to match new package name
- Updated `constants.ts` APP_BUNDLE_ID constant
- Updated `prd_sinoman_mobile_app.md` with new package identifiers

#### Type System
- Updated `src/types/index.ts` to export notification types
- Added notification types to global type exports

#### Hooks System
- Updated `src/hooks/index.ts` to export notification hooks
- Added three new notification-related hooks

#### Services
- Created `src/services/index.ts` for centralized service exports
- Added notification and realtime services to exports

## [1.0.0] - 2025-01-08

### Added

#### Authentication System
- Phone number + OTP authentication
- Biometric authentication (TouchID/FaceID)
- Session management
- Auto-logout on inactivity
- Secure credential storage

#### Dashboard
- Balance overview with breakdown
- Quick action buttons
- Recent transactions
- Network status indicator

#### Savings Management
- Multiple savings types (Pokok, Wajib, Sukarela)
- Top-up functionality
- Transaction history
- Balance filtering

#### QR Code Features
- QR scanner for payments
- My QR code display
- QR payment confirmation
- Offline queue for failed scans

#### Marketplace
- Product browsing with categories
- Product search and filtering
- Shopping cart
- Checkout flow
- Order placement

#### Fit Challenge
- Challenge progress tracking
- Daily check-ins
- Progress history
- Visual progress indicators

#### Profile Management
- Personal information editing
- Profile photo upload
- Account settings
- Biometric toggle

#### Core Features
- Offline support
- Network status detection
- Inactivity timer
- Error boundary
- Logger utility
- Form validation

### Technical Stack
- React Native 0.72
- Expo SDK 49
- TypeScript 5.0
- Zustand for state management
- React Navigation 6
- Supabase for backend
- React Native Paper for UI
- React Hook Form for forms

## Release Notes

### Version 1.0.0 (Initial Release)
**Release Date:** 2025-01-08

Complete MVP with all core features:
- ✅ Authentication & Authorization
- ✅ Dashboard & Quick Actions
- ✅ Savings Management
- ✅ QR Payment Scanner
- ✅ Marketplace & Shopping
- ✅ Fit Challenge Program
- ✅ Profile Management

**Known Issues:**
- None reported

**Breaking Changes:**
- N/A (Initial release)

### Upcoming Features (v1.1.0)

**Planned for Next Release:**
- [ ] Push notification UI screens
- [ ] Notification preferences screen
- [ ] In-app notification center
- [ ] Enhanced realtime features
- [ ] Analytics integration
- [ ] Performance optimizations

**Under Consideration:**
- Social features (member directory)
- Chat/messaging
- Referral system
- Rewards program
- Advanced analytics dashboard

## Migration Guide

### Upgrading from Pre-Notification to Notification System

If you have an existing installation without notifications:

1. **Update dependencies** (if needed):
   ```bash
   npm install
   ```

2. **Add Expo project ID** to `app.json`:
   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "your-project-id"
         }
       }
     }
   }
   ```

3. **Setup database tables**:
   - Run SQL scripts from `NOTIFICATION_TESTING.md`
   - Enable realtime for required tables

4. **Update App.tsx**:
   ```typescript
   import { useNotifications } from '@hooks';

   function App() {
     useNotifications(); // Add this line
     return <NavigationContainer>...</NavigationContainer>;
   }
   ```

5. **No breaking changes** - Existing code continues to work

## Contributors

- Development Team
- Product Team
- QA Team

---

**Note:** This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

For detailed information about any feature, see the documentation in `/docs` folder.
