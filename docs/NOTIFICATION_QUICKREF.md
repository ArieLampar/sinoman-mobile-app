# Notification System - Quick Reference

One-page reference for implementing notifications in Sinoman Mobile App.

## Setup (One Time)

```json
// app.json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

## Basic Usage

### 1. Show Notification Count in UI

```typescript
import { useNotifications } from '@hooks';

const { unreadCount } = useNotifications();

<Badge>{unreadCount}</Badge>
```

### 2. Display Notification List

```typescript
import { useNotificationStore } from '@store/notificationStore';

const { notifications, markAsRead, deleteNotification } = useNotificationStore();

<FlatList
  data={notifications}
  renderItem={({ item }) => (
    <NotificationItem
      notification={item}
      onPress={() => markAsRead(item.id)}
      onDelete={() => deleteNotification(item.id)}
    />
  )}
/>
```

### 3. Check Permission

```typescript
import { useNotificationPermission } from '@hooks';

const { hasPermission, requestPermissions } = useNotificationPermission();

if (!hasPermission) {
  await requestPermissions();
}
```

### 4. Update Settings

```typescript
import { useNotificationSettings } from '@hooks';

const { settings, updateSettings } = useNotificationSettings();

// Toggle transaction notifications
updateSettings({ transactions: false });
```

## Service Functions

### Push Notifications

```typescript
import {
  registerForPushNotifications,
  scheduleLocalNotification,
  setBadgeCount,
  clearAllNotifications,
} from '@services/notificationService';

// Get push token
const token = await registerForPushNotifications();

// Schedule local notification
await scheduleLocalNotification(
  {
    title: 'Reminder',
    body: 'Check your balance',
    data: { screen: 'Savings' },
  },
  { seconds: 3600 } // in 1 hour
);

// Update badge
await setBadgeCount(5);

// Clear all
await clearAllNotifications();
```

### Realtime Subscriptions

```typescript
import {
  subscribeToBalanceUpdates,
  subscribeToTransactions,
  unsubscribeChannel,
} from '@services/realtimeService';

// Subscribe to balance updates
subscribeToBalanceUpdates(userId, (payload) => {
  console.log('Balance updated:', payload.new);
});

// Subscribe to transactions
subscribeToTransactions(userId, (payload) => {
  console.log('New transaction:', payload.new);
});

// Unsubscribe
await unsubscribeChannel(`balance:${userId}`);
```

## Sending Notifications

### Method 1: Expo Push Tool (Testing)

1. Go to: https://expo.dev/notifications
2. Enter your token (from app logs)
3. Fill notification details
4. Click "Send a Notification"

### Method 2: Code (Production)

```typescript
// Backend/Edge Function
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

const messages = [{
  to: 'ExponentPushToken[xxx]',
  title: 'Transaction Success',
  body: 'Payment of Rp 50,000 successful',
  data: { type: 'transaction', transactionId: 'TRX-123' },
  sound: 'default',
  badge: 1,
}];

const tickets = await expo.sendPushNotificationsAsync(messages);
```

## Notification Types & Navigation

| Type | Navigate To | Data Needed |
|------|-------------|-------------|
| `transaction` | TransactionDetail | `transactionId` |
| `balance_update` | Savings | - |
| `order_status` | OrderDetail | `orderId` |
| `promotion` | Marketplace | - |
| `fit_challenge` | FitChallenge | - |
| `system` | Custom screen | `screen`, `params` |

## Common Patterns

### Pattern 1: Initialize on Login

```typescript
// In login screen
import { useNotificationStore } from '@store/notificationStore';

const { initialize } = useNotificationStore();

// After successful login
await initialize(user.id);
```

### Pattern 2: Cleanup on Logout

```typescript
// In logout function
import { useNotificationStore } from '@store/notificationStore';

const { cleanup } = useNotificationStore();

await cleanup(user.id);
```

### Pattern 3: Handle Notification Tap

```typescript
// Automatically handled by useNotifications hook
// Just include it in your App.tsx
import { useNotifications } from '@hooks';

function App() {
  useNotifications(); // Sets up listeners
  return <NavigationContainer>...</NavigationContainer>;
}
```

### Pattern 4: Custom Notification Handler

```typescript
import { addNotificationReceivedListener } from '@services/notificationService';

useEffect(() => {
  const subscription = addNotificationReceivedListener((notification) => {
    // Custom handling
    console.log('Received:', notification);
  });

  return () => subscription.remove();
}, []);
```

## Database Setup

```sql
-- Push tokens table
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('ios', 'android')),
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| No token | Check device is physical (not emulator) |
| No permission | Call `requestPermissions()` |
| Notifications not showing | Check system settings, DND mode |
| Realtime not working | Enable realtime in Supabase dashboard |
| Badge not updating | Verify `badgeEnabled` in settings |
| Tap not navigating | Check data payload has correct keys |

## Testing Commands

```bash
# Install Expo CLI
npm install -g expo-cli

# Send test notification (using npx)
npx expo-cli send-push-notification \
  --token "ExponentPushToken[xxx]" \
  --title "Test" \
  --body "Testing notification" \
  --data '{"type":"transaction","transactionId":"123"}'
```

## Store Methods Quick Reference

```typescript
// Notification Store
const {
  notifications,        // PushNotification[]
  unreadCount,         // number
  settings,            // NotificationSettings
  initialize,          // (userId: string) => Promise<boolean>
  cleanup,             // (userId: string) => Promise<void>
  addNotification,     // (notification: PushNotification) => void
  markAsRead,          // (id: string) => void
  markAllAsRead,       // () => void
  deleteNotification,  // (id: string) => void
  clearAll,            // () => Promise<void>
  updateSettings,      // (settings: Partial<NotificationSettings>) => Promise<void>
} = useNotificationStore();
```

## Environment Variables

```env
# .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Important Notes

⚠️ **Always test on physical devices** (emulators have limited support)

⚠️ **Request permissions before sending** (check `hasPermission`)

⚠️ **Cleanup on logout** (prevent ghost notifications)

⚠️ **Handle offline gracefully** (realtime auto-reconnects)

⚠️ **Respect user settings** (check before sending)

## Links

- 📚 [Full Testing Guide](./NOTIFICATION_TESTING.md)
- 📝 [Implementation Guide](./NOTIFICATION_IMPLEMENTATION.md)
- 📊 [Summary](./NOTIFICATION_SUMMARY.md)
- 🔔 [Expo Push Tool](https://expo.dev/notifications)
- 📖 [Expo Docs](https://docs.expo.dev/push-notifications/)
- 🔌 [Supabase Realtime](https://supabase.com/docs/guides/realtime)
