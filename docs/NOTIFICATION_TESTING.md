# Notification Testing Guide

Complete guide for testing push notifications and realtime subscriptions in Sinoman Mobile App.

## Table of Contents

1. [Setup Requirements](#setup-requirements)
2. [Permission Testing](#permission-testing)
3. [Push Notification Testing](#push-notification-testing)
4. [Realtime Subscription Testing](#realtime-subscription-testing)
5. [Testing Scenarios](#testing-scenarios)
6. [Troubleshooting](#troubleshooting)

---

## Setup Requirements

### Prerequisites

- Physical device (iOS or Android) - Emulators have limited notification support
- Expo Go app installed OR development build
- Active Expo account
- Supabase project configured with realtime enabled

### Environment Setup

1. **Install Expo Push Notification Tool**
   ```bash
   npm install -g expo-cli
   ```

2. **Enable Realtime in Supabase**
   - Go to Supabase Dashboard → Database → Replication
   - Enable realtime for required tables:
     - `savings_balances`
     - `transactions`
     - `orders`
     - `notifications`
     - `fit_challenge_progress`

3. **Create Required Database Tables**

   ```sql
   -- Push tokens table
   CREATE TABLE push_tokens (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     token TEXT NOT NULL,
     device_type TEXT NOT NULL CHECK (device_type IN ('ios', 'android')),
     device_id TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id, device_id)
   );

   -- Enable RLS
   ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

   -- RLS Policies
   CREATE POLICY "Users can manage own push tokens"
     ON push_tokens FOR ALL
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);

   -- Notifications table
   CREATE TABLE notifications (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     type TEXT NOT NULL,
     title TEXT NOT NULL,
     message TEXT NOT NULL,
     data JSONB,
     read BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

   -- RLS Policies
   CREATE POLICY "Users can view own notifications"
     ON notifications FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Service role can insert notifications"
     ON notifications FOR INSERT
     WITH CHECK (true);
   ```

---

## Permission Testing

### Test Cases

#### TC001: Request Notification Permissions (First Time)

**Steps:**
1. Install app on device (first time)
2. Login with valid credentials
3. Observe permission dialog

**Expected Result:**
- System permission dialog appears
- User can grant or deny
- Permission status saved correctly

**Verify:**
```typescript
// In app code
const permissionStatus = await requestNotificationPermissions();
console.log('Permission granted:', permissionStatus.granted);
console.log('Can ask again:', permissionStatus.canAskAgain);
```

#### TC002: Check Permission Status

**Steps:**
1. Open app with previously granted permissions
2. Check notification settings screen

**Expected Result:**
- Permission status displays correctly
- Settings toggle enabled if permission granted

#### TC003: Handle Permission Denial

**Steps:**
1. Deny notification permission
2. Try to enable notifications in settings

**Expected Result:**
- App shows message directing to system settings
- Graceful handling without crash

---

## Push Notification Testing

### Method 1: Using Expo Push Notification Tool (Web)

1. **Get Expo Push Token**
   - Run app on device
   - Login as a user
   - Copy the Expo push token from logs or settings screen
   - Token format: `ExponentPushToken[xxxxxxxxxxxxxx]`

2. **Send Test Notification**
   - Go to: https://expo.dev/notifications
   - Paste your Expo push token
   - Fill in notification details:
     ```json
     {
       "to": "ExponentPushToken[your-token-here]",
       "title": "Test Notification",
       "body": "This is a test notification",
       "data": {
         "type": "transaction",
         "amount": 50000
       },
       "sound": "default",
       "badge": 1,
       "priority": "high"
     }
     ```
   - Click "Send a Notification"

3. **Verify Results**
   - Notification appears on device
   - Sound plays (if enabled)
   - Badge count updates
   - Tapping notification opens app

### Method 2: Using Expo CLI

```bash
# Install expo-server-sdk
npm install expo-server-sdk

# Create test script: send-push.js
```

```javascript
const { Expo } = require('expo-server-sdk');

async function sendPushNotification() {
  const expo = new Expo();

  const messages = [{
    to: 'ExponentPushToken[your-token-here]',
    sound: 'default',
    title: 'Transaction Success',
    body: 'Pembayaran Rp 50,000 berhasil',
    data: {
      type: 'transaction',
      transactionId: 'TRX-123',
      amount: 50000
    },
    badge: 1,
    priority: 'high',
  }];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
      console.log('Tickets:', ticketChunk);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

sendPushNotification();
```

```bash
# Run the script
node send-push.js
```

### Method 3: Using Supabase Edge Function

Create a Supabase Edge Function to send notifications:

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Expo } from 'npm:expo-server-sdk@3.6.0';

const expo = new Expo();

serve(async (req) => {
  try {
    const { token, title, body, data } = await req.json();

    if (!Expo.isExpoPushToken(token)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Expo push token' }),
        { status: 400 }
      );
    }

    const messages = [{
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    }];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    return new Response(
      JSON.stringify({ success: true, tickets }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

Deploy and test:
```bash
supabase functions deploy send-notification

# Test with curl
curl -X POST https://your-project.supabase.co/functions/v1/send-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "token": "ExponentPushToken[xxx]",
    "title": "Test",
    "body": "Testing from Edge Function",
    "data": {"test": true}
  }'
```

---

## Realtime Subscription Testing

### Test Balance Updates

1. **Setup Subscription**
   - Login to app
   - Verify subscription is active in logs:
     ```
     [INFO] Subscribed to balance updates
     [INFO] Balance subscription status: SUBSCRIBED
     ```

2. **Trigger Update via Supabase Dashboard**
   - Go to Supabase Dashboard → Table Editor
   - Find `savings_balances` table
   - Update balance for your user
   - Observe realtime update in app

3. **Expected Behavior**
   - Balance updates immediately without refresh
   - In-app notification appears
   - No API call needed

### Test Transaction Updates

1. **Create New Transaction**
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO transactions (
     user_id,
     type,
     amount,
     description,
     status
   ) VALUES (
     'your-user-id',
     'debit',
     50000,
     'Test Transaction',
     'completed'
   );
   ```

2. **Expected Behavior**
   - Transaction appears in app immediately
   - Notification triggered
   - Transaction history updates

### Test Order Updates

1. **Update Order Status**
   ```sql
   UPDATE orders
   SET status = 'shipped'
   WHERE id = 'order-id' AND user_id = 'your-user-id';
   ```

2. **Expected Behavior**
   - Order status updates in app
   - Push notification sent
   - Badge count increases

---

## Testing Scenarios

### Scenario 1: Complete Flow Test

**User Story:** User receives notification when balance is updated

1. Login to app on device
2. Verify push token registered
3. Verify realtime subscription active
4. Update balance in Supabase
5. Verify:
   - ✓ In-app notification appears
   - ✓ Balance updates without refresh
   - ✓ Badge count increases
   - ✓ Sound plays

### Scenario 2: Notification Tap Test

**User Story:** User taps notification and app opens to correct screen

1. Send push notification with navigation data:
   ```json
   {
     "data": {
       "type": "transaction",
       "screen": "TransactionDetail",
       "transactionId": "TRX-123"
     }
   }
   ```
2. Receive notification on device
3. Tap notification
4. Verify:
   - ✓ App opens (if closed)
   - ✓ App brings to foreground (if backgrounded)
   - ✓ Navigates to correct screen
   - ✓ Passes correct data

### Scenario 3: Offline/Online Test

**User Story:** Notifications queue when offline and sync when online

1. Enable airplane mode
2. Update data in Supabase
3. Disable airplane mode
4. Verify:
   - ✓ Realtime subscription reconnects
   - ✓ Missed updates sync
   - ✓ Notifications appear

### Scenario 4: Multi-Device Test

**User Story:** User receives notifications on multiple devices

1. Login on Device A
2. Login on Device B (same account)
3. Trigger notification
4. Verify:
   - ✓ Both devices receive notification
   - ✓ Badge count syncs
   - ✓ Mark as read syncs across devices

### Scenario 5: Notification Settings Test

**User Story:** User can customize notification preferences

1. Go to Settings → Notifications
2. Disable "Transaction Notifications"
3. Create a transaction
4. Verify:
   - ✓ No push notification sent
   - ✓ In-app notification still appears
   - ✓ Settings persist after app restart

---

## Troubleshooting

### Issue: Token Not Registering

**Symptoms:**
- Push token is `null`
- No notifications received

**Solutions:**
1. Check if running on physical device (not emulator)
2. Verify Expo project ID in `app.json`:
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
3. Check permission status
4. Restart app and try again

### Issue: Realtime Not Working

**Symptoms:**
- No realtime updates received
- Subscription status shows `CHANNEL_ERROR`

**Solutions:**
1. Verify realtime is enabled in Supabase:
   ```sql
   -- Check realtime settings
   SELECT * FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime';
   ```
2. Enable realtime for table:
   ```sql
   ALTER PUBLICATION supabase_realtime
   ADD TABLE savings_balances;
   ```
3. Check RLS policies allow user to read data
4. Verify network connectivity

### Issue: Notifications Not Appearing

**Symptoms:**
- No visual notification
- No sound

**Solutions:**
1. Check system notification settings
2. Verify app has notification permission
3. Check Do Not Disturb mode
4. For Android: Check notification channel settings
5. Check badge count manually:
   ```typescript
   const count = await getBadgeCount();
   console.log('Current badge count:', count);
   ```

### Issue: High Battery Usage

**Symptoms:**
- App draining battery in background

**Solutions:**
1. Limit number of realtime subscriptions
2. Use notification channels appropriately
3. Unsubscribe when app goes to background:
   ```typescript
   AppState.addEventListener('change', (state) => {
     if (state === 'background') {
       cleanupRealtimeSubscriptions();
     }
   });
   ```

---

## Best Practices

### 1. Token Management
- Always register token after login
- Update token if it changes
- Delete token on logout
- Handle token refresh gracefully

### 2. Realtime Subscriptions
- Subscribe after successful authentication
- Unsubscribe when user logs out
- Handle reconnection automatically
- Limit concurrent subscriptions

### 3. Notification Content
- Keep titles short and clear
- Use localized messages
- Include actionable data
- Set appropriate priority

### 4. Testing Checklist

- [ ] Permissions work correctly
- [ ] Push token registers successfully
- [ ] Notifications received in foreground
- [ ] Notifications received in background
- [ ] Notifications received when app is closed
- [ ] Notification tap opens correct screen
- [ ] Badge count updates correctly
- [ ] Sound plays when enabled
- [ ] Realtime updates work
- [ ] Offline/online transitions work
- [ ] Settings persist correctly
- [ ] Multi-device sync works
- [ ] Unsubscribe works on logout

---

## Resources

- [Expo Push Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Testing Push Notifications](https://docs.expo.dev/push-notifications/testing/)
- [Notification Channels (Android)](https://developer.android.com/training/notify-user/channels)
- [User Notifications (iOS)](https://developer.apple.com/documentation/usernotifications)
