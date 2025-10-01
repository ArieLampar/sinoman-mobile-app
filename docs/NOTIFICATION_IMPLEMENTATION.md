# Notification Implementation Guide

Step-by-step guide to implement notifications in Sinoman Mobile App.

## Quick Start

### 1. Add Project ID to app.json

```json
{
  "expo": {
    "name": "Sinoman Mobile App",
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

Get your project ID from: https://expo.dev/accounts/[your-account]/projects

### 2. Initialize in App.tsx

```typescript
import { useEffect } from 'react';
import { useNotifications } from '@hooks';
import { useAuthStore } from '@store/authStore';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const { isInitialized } = useNotifications();

  useEffect(() => {
    // Notifications will auto-initialize when user logs in
    if (isAuthenticated && isInitialized) {
      console.log('Notifications ready!');
    }
  }, [isAuthenticated, isInitialized]);

  return (
    // Your app components
  );
}
```

### 3. Use in Screens

#### Dashboard Screen - Show Notification Count

```typescript
import { useNotifications } from '@hooks';
import { Badge } from 'react-native-paper';

export function DashboardScreen() {
  const { unreadCount } = useNotifications();

  return (
    <View>
      <IconButton icon="bell" onPress={() => navigation.navigate('Notifications')}>
        {unreadCount > 0 && (
          <Badge style={styles.badge}>{unreadCount}</Badge>
        )}
      </IconButton>
    </View>
  );
}
```

#### Notifications Screen - Display Notifications

```typescript
import { useNotificationStore } from '@store/notificationStore';
import { FlatList, TouchableOpacity } from 'react-native';
import { List, Badge, IconButton } from 'react-native-paper';

export function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationStore();

  const handleNotificationPress = (notification: PushNotification) => {
    // Mark as read
    markAsRead(notification.id);

    // Navigate based on type
    switch (notification.type) {
      case 'transaction':
        navigation.navigate('TransactionDetail', {
          transactionId: notification.data?.transactionId,
        });
        break;
      case 'order_status':
        navigation.navigate('OrderDetail', {
          orderId: notification.data?.orderId,
        });
        break;
      // Add more cases as needed
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Notifikasi</Text>
        {unreadCount > 0 && (
          <Button onPress={markAllAsRead}>Tandai Semua Dibaca</Button>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={item.message}
            left={(props) => (
              <List.Icon
                {...props}
                icon={getNotificationIcon(item.type)}
                color={item.read ? '#999' : '#059669'}
              />
            )}
            right={(props) => (
              <View style={styles.rightContent}>
                {!item.read && <Badge size={8} style={styles.unreadBadge} />}
                <IconButton
                  icon="delete"
                  onPress={() => deleteNotification(item.id)}
                />
              </View>
            )}
            onPress={() => handleNotificationPress(item)}
            style={[
              styles.listItem,
              !item.read && styles.unreadItem,
            ]}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="bell-off" size={64} color="#999" />
            <Text>Tidak ada notifikasi</Text>
          </View>
        }
      />

      {notifications.length > 0 && (
        <Button mode="outlined" onPress={clearAll} style={styles.clearButton}>
          Hapus Semua
        </Button>
      )}
    </View>
  );
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'transaction':
      return 'cash';
    case 'balance_update':
      return 'wallet';
    case 'order_status':
      return 'package-variant';
    case 'promotion':
      return 'sale';
    case 'fit_challenge':
      return 'run';
    case 'system':
      return 'information';
    default:
      return 'bell';
  }
}
```

#### Settings Screen - Notification Preferences

```typescript
import { useNotificationSettings, useNotificationPermission } from '@hooks';
import { Switch, List, Divider } from 'react-native-paper';

export function NotificationSettingsScreen() {
  const { settings, updateSettings } = useNotificationSettings();
  const { hasPermission, requestPermissions } = useNotificationPermission();

  const handleToggle = (key: keyof NotificationSettings) => {
    updateSettings({ [key]: !settings[key] });
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionPrompt}>
        <Icon name="bell-off" size={64} color="#999" />
        <Text variant="titleLarge">Izin Notifikasi Diperlukan</Text>
        <Text>Aktifkan notifikasi untuk menerima update penting</Text>
        <Button mode="contained" onPress={requestPermissions}>
          Aktifkan Notifikasi
        </Button>
      </View>
    );
  }

  return (
    <ScrollView>
      <List.Section>
        <List.Subheader>Umum</List.Subheader>
        <List.Item
          title="Aktifkan Notifikasi"
          description="Master toggle untuk semua notifikasi"
          right={() => (
            <Switch
              value={settings.enabled}
              onValueChange={() => handleToggle('enabled')}
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Jenis Notifikasi</List.Subheader>
        <List.Item
          title="Transaksi"
          description="Notifikasi transaksi dan pembayaran"
          disabled={!settings.enabled}
          right={() => (
            <Switch
              value={settings.transactions}
              onValueChange={() => handleToggle('transactions')}
              disabled={!settings.enabled}
            />
          )}
        />
        <List.Item
          title="Update Saldo"
          description="Notifikasi perubahan saldo"
          disabled={!settings.enabled}
          right={() => (
            <Switch
              value={settings.balanceUpdates}
              onValueChange={() => handleToggle('balanceUpdates')}
              disabled={!settings.enabled}
            />
          )}
        />
        <List.Item
          title="Status Pesanan"
          description="Notifikasi status pesanan marketplace"
          disabled={!settings.enabled}
          right={() => (
            <Switch
              value={settings.orderUpdates}
              onValueChange={() => handleToggle('orderUpdates')}
              disabled={!settings.enabled}
            />
          )}
        />
        <List.Item
          title="Promosi"
          description="Notifikasi promo dan penawaran"
          disabled={!settings.enabled}
          right={() => (
            <Switch
              value={settings.promotions}
              onValueChange={() => handleToggle('promotions')}
              disabled={!settings.enabled}
            />
          )}
        />
        <List.Item
          title="Fit Challenge"
          description="Notifikasi program Fit Challenge"
          disabled={!settings.enabled}
          right={() => (
            <Switch
              value={settings.fitChallenge}
              onValueChange={() => handleToggle('fitChallenge')}
              disabled={!settings.enabled}
            />
          )}
        />
        <List.Item
          title="Sistem"
          description="Notifikasi sistem dan maintenance"
          disabled={!settings.enabled}
          right={() => (
            <Switch
              value={settings.system}
              onValueChange={() => handleToggle('system')}
              disabled={!settings.enabled}
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Preferensi</List.Subheader>
        <List.Item
          title="Suara"
          description="Mainkan suara notifikasi"
          disabled={!settings.enabled}
          right={() => (
            <Switch
              value={settings.soundEnabled}
              onValueChange={() => handleToggle('soundEnabled')}
              disabled={!settings.enabled}
            />
          )}
        />
        <List.Item
          title="Getaran"
          description="Aktifkan getaran"
          disabled={!settings.enabled}
          right={() => (
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={() => handleToggle('vibrationEnabled')}
              disabled={!settings.enabled}
            />
          )}
        />
        <List.Item
          title="Badge"
          description="Tampilkan jumlah notifikasi di icon app"
          disabled={!settings.enabled}
          right={() => (
            <Switch
              value={settings.badgeEnabled}
              onValueChange={() => handleToggle('badgeEnabled')}
              disabled={!settings.enabled}
            />
          )}
        />
      </List.Section>
    </ScrollView>
  );
}
```

## Advanced Usage

### Send Local Notification

```typescript
import { scheduleLocalNotification } from '@services/notificationService';

// Schedule a reminder
await scheduleLocalNotification(
  {
    title: 'Reminder',
    body: 'Jangan lupa check-in Fit Challenge hari ini!',
    data: { type: 'fit_challenge', screen: 'FitChallenge' },
  },
  {
    // Trigger in 1 hour
    seconds: 3600,
  }
);

// Schedule daily reminder
await scheduleLocalNotification(
  {
    title: 'Daily Check-in',
    body: 'Waktunya check-in harian Anda!',
    data: { type: 'fit_challenge' },
  },
  {
    // Repeat daily at 8 AM
    hour: 8,
    minute: 0,
    repeats: true,
  }
);
```

### Manually Subscribe to Realtime Events

```typescript
import { subscribeToBalanceUpdates } from '@services/realtimeService';

const channel = subscribeToBalanceUpdates(userId, (payload) => {
  console.log('Balance updated:', payload);

  // Update UI
  if (payload.eventType === 'UPDATE') {
    const newBalance = payload.new;
    // Update your state
  }
});

// Later, unsubscribe
await unsubscribeChannel(`balance:${userId}`);
```

### Custom Notification Handler

```typescript
import { addNotificationReceivedListener } from '@services/notificationService';

const subscription = addNotificationReceivedListener((notification) => {
  const { title, body, data } = notification.request.content;

  // Custom handling
  if (data?.priority === 'urgent') {
    // Show alert dialog
    Alert.alert(title || 'Urgent', body || '', [
      { text: 'OK', onPress: () => console.log('Acknowledged') },
    ]);
  }
});

// Clean up
subscription.remove();
```

## Backend Integration

### Supabase Edge Function Example

Create a function to send notifications when data changes:

```typescript
// supabase/functions/notify-transaction/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Expo } from 'npm:expo-server-sdk@3.6.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const expo = new Expo();

serve(async (req) => {
  try {
    const { userId, transactionId, amount, type } = await req.json();

    // Get user's push tokens
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No push tokens found' }),
        { status: 200 }
      );
    }

    // Prepare notification messages
    const messages = tokens
      .filter((t) => Expo.isExpoPushToken(t.token))
      .map((t) => ({
        to: t.token,
        sound: 'default',
        title: 'Transaksi Berhasil',
        body: `Transaksi ${type} sebesar Rp ${amount.toLocaleString('id-ID')} berhasil`,
        data: {
          type: 'transaction',
          transactionId,
          amount,
          screen: 'TransactionDetail',
        },
        badge: 1,
        priority: 'high',
      }));

    // Send notifications
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    // Save notification to database
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'transaction',
      title: 'Transaksi Berhasil',
      message: `Transaksi ${type} sebesar Rp ${amount.toLocaleString('id-ID')} berhasil`,
      data: { transactionId, amount },
    });

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

### Database Trigger Example

Automatically send notification when transaction is created:

```sql
-- Create function to notify on transaction
CREATE OR REPLACE FUNCTION notify_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Call edge function
  PERFORM
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/notify-transaction',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := jsonb_build_object(
        'userId', NEW.user_id,
        'transactionId', NEW.id,
        'amount', NEW.amount,
        'type', NEW.type
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_transaction_created
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_transaction();
```

## Error Handling

### Handle Permission Denied

```typescript
const { hasPermission, canAskAgain, requestPermissions } = useNotificationPermission();

if (!hasPermission) {
  if (canAskAgain) {
    // Show prompt to request permission
    const status = await requestPermissions();
    if (!status.granted) {
      // User denied permission
      Alert.alert(
        'Notifikasi Dinonaktifkan',
        'Anda dapat mengaktifkan notifikasi di pengaturan sistem',
        [
          { text: 'Nanti', style: 'cancel' },
          { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() },
        ]
      );
    }
  } else {
    // Can't ask again, direct to settings
    Alert.alert(
      'Izin Notifikasi Diperlukan',
      'Buka pengaturan untuk mengaktifkan notifikasi',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() },
      ]
    );
  }
}
```

### Handle Token Registration Failure

```typescript
import { initializePushNotifications } from '@services/notificationService';

const initialized = await initializePushNotifications(userId);

if (!initialized) {
  // Retry after delay
  setTimeout(async () => {
    const retryResult = await initializePushNotifications(userId);
    if (!retryResult) {
      // Log error for monitoring
      logger.error('Failed to initialize push notifications after retry');
      // Continue with app, notifications will be disabled
    }
  }, 5000);
}
```

## Best Practices

1. **Always check permissions before sending notifications**
2. **Unsubscribe from realtime channels on logout**
3. **Handle notification tap gracefully with proper navigation**
4. **Respect user's notification preferences**
5. **Keep notification content concise and actionable**
6. **Use appropriate notification priority**
7. **Test on physical devices, not emulators**
8. **Monitor notification delivery rates**
9. **Implement retry logic for failed token registration**
10. **Clean up listeners when components unmount**

## Troubleshooting

See [NOTIFICATION_TESTING.md](./NOTIFICATION_TESTING.md) for comprehensive troubleshooting guide.
