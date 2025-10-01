# Setup Notifikasi - Sinoman Mobile App

Panduan lengkap untuk setup sistem notifikasi menggunakan Expo Push Notifications dan Supabase Realtime.

## Prerequisites

- Expo account (https://expo.dev)
- Physical device untuk testing (emulator tidak support push notifications)
- Supabase project sudah setup
- Node.js dan npm/yarn terinstall

## Step 1: Install Dependencies

Jalankan perintah install di root project:

```bash
npm install
# atau
yarn install
```

Dependencies yang akan diinstall (sudah ada di package.json):
- `expo-notifications` ~0.20.1 - Expo push notification API
- `expo-device` ~5.4.0 - Device information untuk permission checking

## Step 2: Setup Expo Project

### 2.1 Login ke Expo

```bash
npx expo login
```

Masukkan credentials Expo account Anda.

### 2.2 Initialize EAS Project

```bash
npx eas init
```

Perintah ini akan:
- Create atau link project di Expo dashboard
- Generate Project ID
- Create `eas.json` configuration file

### 2.3 Get Project ID

Setelah `eas init`, Anda akan mendapatkan Project ID. Atau bisa check di:
- Output terminal setelah `eas init`
- Expo dashboard: https://expo.dev/accounts/[your-account]/projects

### 2.4 Add Project ID to Environment

Buat file `.env` di root project (copy dari `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` dan tambahkan Project ID:

```bash
# Expo EAS Configuration
EAS_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**⚠️ PENTING:** Jangan commit file `.env` ke git!

## Step 3: Setup Supabase Tables

### 3.1 Create Push Tokens Table

Jalankan SQL migration berikut di Supabase SQL Editor:

```sql
-- Create push_tokens table
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('ios', 'android')),
  device_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);

-- Enable Row Level Security (RLS)
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage own push tokens
CREATE POLICY "Users can manage own push tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3.2 Create Notifications Table

```sql
-- Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);
```

### 3.3 Enable Realtime

Di Supabase Dashboard:

1. Go to **Database** → **Replication**
2. Click **Enable Replication** untuk table `notifications`
3. Pastikan **Realtime** toggle aktif

Atau via SQL:

```sql
-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

## Step 4: Testing di Physical Device

### 4.1 Build Development Client

**Android:**
```bash
npx expo start --android
```

**iOS:**
```bash
npx expo start --ios
```

Atau scan QR code dengan Expo Go app.

### 4.2 Login dan Check Logs

1. Open app di physical device
2. Login dengan credentials
3. Check console logs untuk:

```
✅ Notification permission granted
✅ Expo push token obtained: ExponentPushToken[xxxxxxxxxxxxxx]
✅ Push token saved to backend
✅ Realtime subscriptions initialized
```

### 4.3 Copy Expo Push Token

Dari console log, copy Expo Push Token (format: `ExponentPushToken[...]`). Token ini akan digunakan untuk testing.

## Step 5: Send Test Notification

### Method 1: Expo Push Notification Tool (Recommended)

1. Open https://expo.dev/notifications
2. Paste Expo Push Token yang sudah di-copy
3. Compose test notification:

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxx]",
  "title": "Test Notification",
  "body": "This is a test notification from Expo",
  "data": {
    "type": "general",
    "screen": "Dashboard"
  },
  "sound": "default",
  "badge": 1,
  "priority": "high"
}
```

4. Click **"Send a Notification"**

### Method 2: Using cURL

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[xxxxxxxxxxxxxx]",
    "title": "Test Notification",
    "body": "Testing from cURL",
    "data": {
      "type": "transaction",
      "transactionId": "TRX-123"
    }
  }'
```

### Verify Test Results

✅ **Expected behavior:**
- Notification banner appears di device
- Notification muncul di NotificationsScreen
- Badge count increases di dashboard bell icon
- Tap notification navigates ke appropriate screen
- Sound plays (if enabled di settings)

## Step 6: Test Realtime Updates

### 6.1 Test Balance Update

Buka Supabase Dashboard:

1. Go to **Table Editor** → `savings_balances`
2. Manually update balance for your user
3. Di app, balance harus update otomatis tanpa refresh

### 6.2 Test Transaction Notification

Insert new transaction via SQL:

```sql
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
  'your-user-id-here',
  'transaction',
  'Transaksi Berhasil',
  'Top up Rp 100,000 berhasil',
  '{"transactionId": "TRX-123", "amount": 100000}'::jsonb
);
```

Notification harus muncul realtime di app.

## Step 7: Production Setup

### 7.1 Build Production App

**Android APK:**
```bash
npx eas build --platform android --profile production
```

**iOS IPA:**
```bash
npx eas build --platform ios --profile production
```

### 7.2 Submit to Stores

**Google Play Store:**
```bash
npx eas submit --platform android
```

**Apple App Store:**
```bash
npx eas submit --platform ios
```

### 7.3 Setup Supabase Edge Functions (Optional)

Untuk send notifications dari backend, create Supabase Edge Function:

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Expo } from 'npm:expo-server-sdk@3.6.0';

const expo = new Expo();

serve(async (req) => {
  const { token, title, body, data } = await req.json();

  if (!Expo.isExpoPushToken(token)) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 400,
    });
  }

  const messages = [{
    to: token,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
  }];

  const tickets = await expo.sendPushNotificationsAsync(messages);

  return new Response(JSON.stringify({ success: true, tickets }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

Deploy:
```bash
npx supabase functions deploy send-notification
```

## Troubleshooting

### Issue: Token tidak muncul di logs

**Kemungkinan penyebab:**
- Running di emulator (push notifications tidak support)
- Permission denied
- Project ID tidak valid

**Solusi:**
1. Pastikan running di physical device
2. Check permission status di Settings
3. Verify `EAS_PROJECT_ID` di `.env`
4. Restart app

### Issue: Notification tidak muncul

**Kemungkinan penyebab:**
- Do Not Disturb mode aktif
- Notification permission denied
- App di background dan system killed it

**Solusi:**
1. Check system notification settings
2. Request permission lagi via Settings
3. Test dengan app di foreground dulu

### Issue: Realtime tidak working

**Kemungkinan penyebab:**
- Realtime tidak enabled di Supabase
- RLS policy blocking access
- Network connection issue

**Solusi:**
1. Enable realtime di Supabase Dashboard
2. Check RLS policies
3. Test network connection

### Issue: Badge count tidak update

**Kemungkinan penyebab:**
- Badge disabled di notification settings
- iOS permission tidak include badge

**Solusi:**
1. Enable badge di Settings → Notifikasi
2. Re-request permission di iOS

## Best Practices

### Security

- ✅ Always validate push tokens before saving
- ✅ Use RLS policies untuk protect user data
- ✅ Never expose service role key di client
- ✅ Implement rate limiting untuk notification sends

### Performance

- ✅ Batch notification sends
- ✅ Cleanup old tokens regularly
- ✅ Limit notification history (keep last 100)
- ✅ Use background fetch untuk sync

### User Experience

- ✅ Request permission at appropriate time (not on first launch)
- ✅ Explain why permission is needed
- ✅ Provide granular notification preferences
- ✅ Allow users to opt-out easily
- ✅ Don't spam notifications

## Resources

### Documentation
- [Expo Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Notification Implementation Guide](./NOTIFICATION_IMPLEMENTATION.md)
- [Notification Testing Guide](./NOTIFICATION_TESTING.md)
- [Notification System Summary](./NOTIFICATION_SUMMARY.md)

### Tools
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Expo Dashboard](https://expo.dev)
- [Supabase Dashboard](https://app.supabase.com)

### Support
- [Expo Forums](https://forums.expo.dev)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/expo/expo/issues)

---

**Setup Complete!** 🎉

Notification system Anda sudah siap digunakan. Untuk implementation details, lihat [NOTIFICATION_IMPLEMENTATION.md](./NOTIFICATION_IMPLEMENTATION.md).

**Last Updated:** 2025-01-10
