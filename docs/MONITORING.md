# Error Handling, Logging & Monitoring

Comprehensive guide for monitoring infrastructure in Sinoman Mobile App.

## Overview

The app uses a multi-layered monitoring approach:

- **Sentry** - Crash reporting and error tracking
- **Firebase Analytics** - User behavior tracking
- **Firebase Performance** - App performance metrics
- **Custom Logger** - Sanitized logging with auto Sentry integration
- **ErrorBoundary** - React error catching with graceful recovery

## Table of Contents

1. [Sentry Setup](#sentry-setup)
2. [Firebase Setup](#firebase-setup)
3. [Error Boundary](#error-boundary)
4. [Logger Service](#logger-service)
5. [Analytics Tracking](#analytics-tracking)
6. [Performance Monitoring](#performance-monitoring)
7. [Retry Mechanisms](#retry-mechanisms)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Sentry Setup

### Configuration

1. Create a Sentry project at [sentry.io](https://sentry.io)
2. Copy your DSN and add to `.env`:

```bash
EXPO_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project-id
EXPO_PUBLIC_SENTRY_RELEASE=1.0.0
```

3. Sentry is automatically initialized in [App.tsx:114](../App.tsx#L114)

### Features

- **Automatic crash reporting** - All unhandled errors sent to Sentry
- **Data sanitization** - Sensitive data removed before sending
- **User context** - User ID and metadata attached to errors
- **Breadcrumbs** - User actions tracked for context
- **Development skip** - No errors sent in DEV mode

### Usage

```typescript
import { captureError, addBreadcrumb, setSentryUser } from '@services/monitoring';

// Capture an error manually
try {
  await riskyOperation();
} catch (error) {
  captureError(error, {
    screen: 'TopUp',
    action: 'submit_payment',
    timestamp: new Date().toISOString(),
  }, ErrorSeverity.ERROR);
}

// Add breadcrumbs for context
addBreadcrumb('User clicked top up button', 'user-action', {
  amount: 100000,
});

// Set user context
setSentryUser(userId, {
  phone: user.phone,
  name: user.name,
});
```

---

## Firebase Setup

### Configuration

**⚠️ Security Note**: Firebase config files contain API keys. Follow security best practices. See [FIREBASE_SECURITY.md](./FIREBASE_SECURITY.md) for complete guide.

1. **Create Firebase project** at [firebase.google.com](https://firebase.google.com)

2. **Copy template files first**:
   ```bash
   cp google-services.json.example google-services.json
   cp GoogleService-Info.plist.example GoogleService-Info.plist
   ```

3. **Download actual config files** from Firebase Console:
   - **Android**: Project Settings > Your apps > Android app → Download `google-services.json`
   - **iOS**: Project Settings > Your apps > iOS app → Download `GoogleService-Info.plist`
   - Replace template files with actual files in project root

4. **Important**: These files are **gitignored** for security. Never commit them to the repository.

5. **Configure Security** (Critical):
   - Restrict API keys in Google Cloud Console (package name/bundle ID)
   - Configure Firebase Security Rules (if using Firestore/Storage)
   - See [FIREBASE_SECURITY.md](./FIREBASE_SECURITY.md) for step-by-step guide

6. Firebase is automatically initialized in [App.tsx:117](../App.tsx#L117)

### Features

- **Analytics** - User behavior tracking
- **Performance** - App performance metrics
- **Screen tracking** - Auto-tracked via `useAnalytics` hook
- **Custom events** - Track business-critical actions

### Usage

#### Analytics Events

```typescript
import { logEvent, AnalyticsEvents } from '@services/monitoring';

// Log predefined events
await logEvent(AnalyticsEvents.TOP_UP_SUCCESS, {
  amount: 100000,
  method: 'bank_transfer',
});

// Log custom events
await logEvent('custom_event_name', {
  param1: 'value1',
  param2: 123,
});
```

#### Performance Traces

```typescript
import { startTrace, stopTrace } from '@services/monitoring';

const trace = await startTrace('top_up_transaction');

try {
  await processTopUp();
  await stopTrace(trace,
    { amount: 100000 }, // metrics
    { status: 'success' } // attributes
  );
} catch (error) {
  await stopTrace(trace, {}, { status: 'failed' });
  throw error;
}
```

#### Screen Tracking

```typescript
import { useAnalytics } from '@hooks';

function MyScreen() {
  // Automatically tracks screen view
  useAnalytics('MyScreen');

  return <View>...</View>;
}
```

---

## Error Boundary

### Overview

ErrorBoundary catches React component errors and displays a user-friendly fallback UI with recovery options.

### Implementation

Located at [src/components/common/ErrorBoundary.tsx](../src/components/common/ErrorBoundary.tsx)

### Usage

```typescript
import { ErrorBoundary } from '@components/common';

// Wrap entire sections
<ErrorBoundary context="Dashboard">
  <DashboardContent />
</ErrorBoundary>

// Custom fallback UI
<ErrorBoundary
  context="Payment"
  fallback={(error, resetError) => (
    <CustomErrorUI error={error} onRetry={resetError} />
  )}
>
  <PaymentFlow />
</ErrorBoundary>
```

### Features

- **Automatic error reporting** to Sentry
- **User-friendly messages** in Indonesian
- **Recovery actions** (Retry, Go Back, etc.)
- **Debug info** shown in development mode

### Error Recovery

The ErrorBoundary automatically provides recovery actions:

- **Network errors** → "Coba Lagi" button
- **Session expired** → "Login Ulang" button
- **Other errors** → "Kembali" button

---

## Logger Service

### Overview

Custom logger with automatic data sanitization and Sentry integration.

Located at [src/utils/logger.ts](../src/utils/logger.ts)

### Usage

```typescript
import { logger } from '@utils/logger';

// Debug logs (dev only)
logger.debug('User clicked button', { buttonId: 'topup' });

// Info logs (dev only)
logger.info('Transaction started', { amount: 100000 });

// Warning logs (dev + production)
logger.warn('API slow response', { duration: 3000 });

// Error logs (dev + production, auto-sent to Sentry)
logger.error('Payment failed', error);

// Breadcrumbs (sent to Sentry)
logger.breadcrumb('User navigated to dashboard', 'navigation', {
  from: 'auth',
});
```

### Features

- **Auto sanitization** - Sensitive data removed
- **Sentry integration** - Errors auto-reported in production
- **Breadcrumbs** - Track user actions for context
- **Environment aware** - Verbose dev, minimal prod

---

## Analytics Tracking

### Predefined Events

Use constants from `AnalyticsEvents` for consistency:

```typescript
// Authentication
AnalyticsEvents.LOGIN_SUCCESS
AnalyticsEvents.LOGIN_FAILED
AnalyticsEvents.LOGOUT

// Financial
AnalyticsEvents.TOP_UP_INITIATED
AnalyticsEvents.TOP_UP_SUCCESS
AnalyticsEvents.QR_PAYMENT_SUCCESS

// Marketplace
AnalyticsEvents.PRODUCT_VIEWED
AnalyticsEvents.ORDER_PLACED

// Health & Fitness
AnalyticsEvents.STEP_GOAL_ACHIEVED
AnalyticsEvents.CHALLENGE_COMPLETED

// Errors
AnalyticsEvents.ERROR_OCCURRED
AnalyticsEvents.API_ERROR
```

### Custom Events

```typescript
await logEvent('user_completed_onboarding', {
  steps_completed: 5,
  time_taken_seconds: 120,
});
```

### User Properties

```typescript
import { setUserProperties } from '@services/monitoring';

await setUserProperties({
  userId: user.id,
  memberNumber: user.memberNumber,
  tier: 'gold',
});
```

---

## Performance Monitoring

### Predefined Traces

Use constants from `PerformanceTraces`:

```typescript
PerformanceTraces.APP_START
PerformanceTraces.LOGIN_FLOW
PerformanceTraces.TOP_UP_TRANSACTION
PerformanceTraces.QR_SCAN
PerformanceTraces.ORDER_CHECKOUT
```

### Custom Traces

```typescript
const trace = await startTrace('load_products');

try {
  const products = await fetchProducts();

  await stopTrace(trace,
    { product_count: products.length }, // metrics
    { category: 'electronics' } // attributes
  );
} catch (error) {
  await stopTrace(trace, {}, { status: 'failed' });
}
```

---

## Retry Mechanisms

### Automatic Retry

```typescript
import { withRetry } from '@utils/retryHelper';

const result = await withRetry(
  async () => {
    return await apiCall();
  },
  {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  }
);
```

### Retry Logic

- **Network errors** → Auto retry with exponential backoff
- **500 errors** → Retry up to 3 times
- **401 errors** → No retry (redirect to login)
- **Validation errors** → No retry (show to user)

### Error Messages

User-friendly messages in Indonesian:

```typescript
import { getUserFriendlyMessage, getRecoveryActions } from '@services/monitoring';

const message = getUserFriendlyMessage(error);
// "Koneksi internet bermasalah. Periksa koneksi Anda."

const actions = getRecoveryActions(error, {
  retry: () => handleRetry(),
  goBack: () => navigation.goBack(),
});
// [{ label: 'Coba Lagi', action: handleRetry, isPrimary: true }]
```

---

## Best Practices

### Error Handling

1. **Always use try-catch** for async operations
2. **Log errors** before throwing
3. **Provide context** with error reports
4. **Show user-friendly messages** to users

```typescript
try {
  await topUp(amount);
  await logEvent(AnalyticsEvents.TOP_UP_SUCCESS);
} catch (error) {
  logger.error('Top up failed', error);
  captureError(error, {
    screen: 'TopUp',
    action: 'submit',
    additionalData: { amount },
  });
  Alert.alert('Gagal', getUserFriendlyMessage(error));
}
```

### Analytics

1. **Use predefined events** when possible
2. **Keep param names consistent** across events
3. **Don't track PII** (phone, email, etc.)
4. **Track key user journeys** (signup, first purchase, etc.)

### Performance

1. **Trace critical flows** (login, checkout, payment)
2. **Add metrics** (duration, count, size)
3. **Use attributes** for filtering (status, category)
4. **Don't trace too much** (focus on bottlenecks)

### Breadcrumbs

1. **Add before critical operations**
2. **Include relevant data** (screen, action, params)
3. **Use categories** (navigation, user-action, api)
4. **Limit data size** (max 500 chars)

---

## Troubleshooting

### Sentry not receiving errors

1. Check DSN is set in `.env`
2. Verify not in DEV mode (errors skipped in dev)
3. Check network connectivity
4. Review `beforeSend` hook in [sentryService.ts](../src/services/monitoring/sentryService.ts)

### Firebase not tracking events

1. Verify config files (`google-services.json` and `GoogleService-Info.plist`) are in project root
2. Verify files are actual Firebase files (not templates with placeholders)
3. Check Firebase console for real-time events
4. Events may take 24h to appear in dashboard
5. Ensure Analytics enabled: [firebaseService.ts:19](../src/services/monitoring/firebaseService.ts#L19)
6. Rebuild app after adding/changing config files: `npx expo prebuild --clean`

### ErrorBoundary not catching errors

1. ErrorBoundary only catches **render errors**
2. Use try-catch for **async errors**
3. Ensure wrapped around component tree
4. Check browser console for error details

### Logger not sanitizing data

1. Review sanitization rules in [dataSanitizer.ts](../src/services/security/dataSanitizer.ts)
2. Add custom patterns if needed
3. Test with `__DEV__ = false` locally

---

## Monitoring Dashboards

### Sentry Dashboard

- **Issues** - View all errors and crashes
- **Performance** - Track transaction speeds
- **Releases** - Compare versions
- **Alerts** - Set up notifications

### Firebase Console

- **Analytics** - User behavior and funnels
- **Performance** - App startup and network traces
- **Crashlytics** - Native crash reports (if configured)

---

## Next Steps

1. **Install dependencies**: `npm install`
2. **Setup Sentry**: Create project and add DSN
3. **Setup Firebase**: Add config files
4. **Test locally**: Trigger errors and check dashboards
5. **Production deploy**: Verify monitoring in production

For questions, see:
- [Sentry Docs](https://docs.sentry.io/platforms/react-native/)
- [Firebase Docs](https://firebase.google.com/docs)
- Implementation files in [src/services/monitoring/](../src/services/monitoring/)
