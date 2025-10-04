# FONTTE WhatsApp OTP Setup Guide

## Overview

Aplikasi Sinoman menggunakan custom OTP flow dengan FONTTE WhatsApp API untuk mengirim kode verifikasi. Sistem ini menggunakan Supabase Edge Functions sebagai backend untuk generate dan verify OTP codes.

### Mengapa FONTTE?

- ✅ WhatsApp lebih familiar untuk user Indonesia
- ✅ Delivery rate lebih tinggi dibanding SMS
- ✅ Biaya lebih terjangkau
- ✅ User tidak perlu memberikan SMS permission
- ✅ Support multimedia messages untuk future enhancements

### Arsitektur High-Level

```
Mobile App → Edge Function → Generate OTP → Save to DB → FONTTE API → WhatsApp → User
User → Enter OTP → Mobile App → Edge Function → Validate → Create Session → User Logged In
```

---

## Prerequisites

1. **Akun FONTTE Aktif**
   - Website: https://fonnte.com
   - Dashboard: https://fontte.com/dashboard

2. **WhatsApp Device Terkoneksi**
   - Device WhatsApp harus active dan terkoneksi ke FONTTE
   - Bisa menggunakan WhatsApp personal atau Business

3. **Supabase Project**
   - Project URL dan Anon Key
   - Service Role Key (untuk Edge Functions)
   - Database access

4. **Supabase CLI Installed**
   - Install: `npm install -g supabase`
   - Version: ≥ 1.0.0

---

## Step-by-Step Setup

### 1. FONTTE Account Setup

#### 1.1 Register FONTTE Account

1. Kunjungi https://fontte.com/register
2. Daftar menggunakan email dan password
3. Verify email Anda

#### 1.2 Connect WhatsApp Device

1. Login ke https://fontte.com/dashboard
2. Klik menu **"Connect Device"**
3. Scan QR code menggunakan WhatsApp Anda
4. Tunggu status berubah menjadi **"Connected"**

#### 1.3 Get API Token

1. Di dashboard, klik menu **"API Token"**
2. Copy token Anda (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
3. Simpan token ini dengan aman - **JANGAN SHARE KE SIAPAPUN**

#### 1.4 Top-Up Balance

1. Klik menu **"Balance"** atau **"Pricing"**
2. Pilih paket yang sesuai kebutuhan
3. Proses pembayaran
4. Verify balance sudah masuk

**Estimasi Biaya:**
- ~Rp 50-100 per pesan WhatsApp
- Untuk 1000 OTP messages ≈ Rp 50.000 - 100.000
- Minimum top-up biasanya Rp 50.000

#### 1.5 Test API

Test FONTTE API menggunakan curl:

```bash
curl -X POST https://api.fonnte.com/send \
  -H "Authorization: YOUR_FONTTE_TOKEN" \
  -d "target=628123456789" \
  -d "message=Test message dari FONTTE" \
  -d "countryCode=62"
```

Jika berhasil, Anda akan menerima pesan WhatsApp.

---

### 2. Supabase Database Setup

#### 2.1 Run Migrations

```bash
# Navigate to project directory
cd sinoman-mobile-app

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push migrations to create tables
supabase db push
```

**Tables Created:**
- `otp_requests` - stores OTP codes with expiry and verification status
- `user_profiles` - stores user profile data linked to auth.users

#### 2.2 Verify Tables Created

1. Login ke Supabase Dashboard
2. Klik **"Table Editor"**
3. Verify tables `otp_requests` dan `user_profiles` sudah ada

#### 2.3 Check RLS Policies

1. Di Table Editor, pilih table `otp_requests`
2. Klik tab **"Policies"**
3. Verify ada 2 policies:
   - Service role has full access
   - Users can read own OTP records

Lakukan hal yang sama untuk table `user_profiles`.

#### 2.4 Test Database Access

Run SQL query di SQL Editor:

```sql
SELECT * FROM otp_requests LIMIT 1;
SELECT * FROM user_profiles LIMIT 1;
```

Jika tidak ada error, database setup berhasil.

---

### 3. Supabase Edge Functions Setup

#### 3.1 Install Dependencies

Edge Functions menggunakan Deno, tidak perlu install dependencies secara eksplisit. Dependencies akan di-fetch saat deploy.

#### 3.2 Deploy Functions

```bash
# Deploy send-otp function
supabase functions deploy send-otp

# Deploy verify-otp function
supabase functions deploy verify-otp
```

**Output yang diharapkan:**
```
Deploying send-otp...
Function deployed successfully.
URL: https://your-project.supabase.co/functions/v1/send-otp

Deploying verify-otp...
Function deployed successfully.
URL: https://your-project.supabase.co/functions/v1/verify-otp
```

#### 3.3 Set Environment Secrets

```bash
# Set FONTTE API Token
supabase secrets set FONTTE_API_TOKEN=your-fontte-token-here

# Set OTP configuration
supabase secrets set OTP_EXPIRY_MINUTES=5
supabase secrets set MAX_OTP_ATTEMPTS=3
supabase secrets set RESEND_COOLDOWN_SECONDS=60
```

**Verify Secrets:**
```bash
supabase secrets list
```

#### 3.4 Test Edge Functions

**Test send-otp:**

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/send-otp \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"phone": "08123456789"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP berhasil dikirim ke WhatsApp",
  "expiresIn": 300
}
```

**Test verify-otp:**

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/verify-otp \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"phone": "08123456789", "otp": "123456"}'
```

---

### 4. Mobile App Configuration

#### 4.1 Update .env File

Copy `.env.example` to `.env` dan update:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# FONTTE WhatsApp OTP Configuration
EXPO_PUBLIC_FONTTE_ENABLED=true
EXPO_PUBLIC_OTP_EXPIRY_SECONDS=300
EXPO_PUBLIC_OTP_RESEND_COOLDOWN=60
```

**Important:**
- JANGAN include `FONTTE_API_TOKEN` di mobile `.env`
- Token hanya ada di Supabase secrets (server-side)

#### 4.2 Verify Supabase Client Configuration

File `src/services/supabase/client.ts` sudah configured dengan benar.

#### 4.3 Test Connection

```bash
# Start development server
npm start

# Run on Android or iOS
npm run android
# or
npm run ios
```

---

## Testing

### Test Send OTP

1. Buka aplikasi mobile
2. Di Login Screen, masukkan nomor telepon (contoh: `08123456789`)
3. Tap tombol **"Kirim Kode OTP"**
4. **Expected Behavior:**
   - Loading indicator muncul
   - Setelah 2-5 detik, WhatsApp message diterima
   - Navigate ke OTP Screen
   - Countdown timer mulai (5 menit)

**Troubleshooting jika gagal:**
- Check Supabase Edge Function logs: `supabase functions logs send-otp`
- Check FONTTE balance
- Verify WhatsApp device status di dashboard
- Check network connectivity

### Test Verify OTP

1. Setelah menerima WhatsApp OTP
2. Masukkan 6-digit OTP code
3. Tap **"Verifikasi"**
4. **Expected Behavior:**
   - Loading indicator muncul
   - Jika benar: Navigate ke Registration Screen (first time) atau Dashboard (returning user)
   - Jika salah: Error message "Kode OTP salah. Sisa percobaan: X"

**Test Cases:**
- ✅ Correct OTP → Success
- ✅ Wrong OTP → Error dengan attempts counter
- ✅ Expired OTP → Error "Kode OTP sudah kadaluarsa"
- ✅ Max attempts (3x) → OTP invalidated

### Test Resend OTP

1. Di OTP Screen, tap **"Kirim Ulang Kode"**
2. **Expected Behavior:**
   - Jika < 60 detik: Error "Mohon tunggu X detik"
   - Jika ≥ 60 detik: New OTP sent, timer reset

### Test Rate Limiting

1. Kirim OTP 5 kali dalam 1 jam untuk nomor yang sama
2. Pada request ke-6:
   - **Expected:** Error "Terlalu banyak permintaan"
   - Wait 1 jam atau test dengan nomor lain

### Test Complete Flow (End-to-End)

**Scenario 1: New User**
1. Enter phone → Send OTP → Receive WhatsApp
2. Enter correct OTP → Navigate to Registration Screen
3. Fill profile (Name, Email, Address) → Submit
4. Navigate to Dashboard → Authenticated ✅

**Scenario 2: Returning User**
1. Enter phone → Send OTP → Receive WhatsApp
2. Enter correct OTP → Navigate to Dashboard (skip registration)
3. Profile data loaded correctly ✅

---

## Monitoring & Maintenance

### Metrics to Monitor

**FONTTE Dashboard:**
- Message delivery rate (target: > 95%)
- Average delivery time (target: < 10 seconds)
- Failed messages count
- Balance remaining

**Supabase Dashboard:**
- Edge Function invocations (Functions > Logs)
- OTP verification success rate
- Failed authentication attempts
- Database table sizes

**Application Logs:**
- `supabase functions logs send-otp`
- `supabase functions logs verify-otp`

### Database Maintenance

**Auto Cleanup (configured):**
- Expired OTPs (> 24 hours) automatically deleted
- Runs via `cleanup_expired_otp()` function
- Schedule: every 1 hour (if pg_cron enabled)

**Manual Cleanup:**
```sql
-- Run this in Supabase SQL Editor
SELECT cleanup_expired_otp();
```

**Check Table Size:**
```sql
SELECT
  pg_size_pretty(pg_total_relation_size('otp_requests')) as size,
  COUNT(*) as rows
FROM otp_requests;
```

**Archive Old Records (optional):**
```sql
-- Archive verified OTPs older than 30 days
DELETE FROM otp_requests
WHERE verified = true
  AND verified_at < now() - interval '30 days';
```

### Cost Optimization

**Current Costs:**
- FONTTE: ~Rp 50-100 per message
- Supabase: Free tier covers ~500K Edge Function invocations/month
- Estimated monthly cost (1000 users, 3 logins/month): **Rp 150.000 - 300.000**

**Optimization Tips:**
1. **Reduce message length** (shorter messages, cheaper)
2. **Implement smart rate limiting** (prevent abuse)
3. **Use OTP for critical flows only** (not for every action)
4. **Monitor and block suspicious patterns**
5. **Consider batch OTP for multiple requests**

---

## Security Best Practices

### Rate Limiting

**Implemented Limits:**
- 60 seconds cooldown between resends
- Max 5 OTP requests per hour per phone
- Max 3 verification attempts per OTP

**Additional Protection (recommended):**
- Implement per-IP rate limiting (use Cloudflare or API Gateway)
- Block phone numbers with excessive failed attempts
- Implement CAPTCHA for repeated failures
- Monitor and alert on unusual patterns

### OTP Security

**Current Implementation:**
✅ 6-digit random code (100k possible combinations)
✅ 5-minute expiry
✅ Single-use (invalidated after verification)
✅ Secure random generation (crypto.getRandomValues)
✅ Never logged to console
✅ Transmitted over HTTPS only

**Additional Measures:**
- Store OTP hashed (optional, for extra security)
- Implement device fingerprinting
- Add biometric verification for sensitive actions
- Use refresh tokens for session management

### API Security

**Edge Functions:**
✅ FONTTE token stored as secret (not in code)
✅ CORS configured properly
✅ Input validation on all endpoints
✅ Phone number sanitization
✅ Error messages don't expose internal details

**Mobile App:**
✅ Supabase Anon Key (public, but RLS protected)
✅ HTTPS only communication
✅ No sensitive data in logs
✅ Secure storage for session tokens

**Recommendations:**
- Enable Supabase Row Level Security (RLS) on all tables
- Use Supabase Edge Function secrets for all sensitive config
- Implement API request signing (optional, for high security)
- Regular security audits

---

## Troubleshooting

### OTP Tidak Terkirim

**Symptom:** User tap "Kirim OTP" tapi tidak ada WhatsApp masuk

**Possible Causes & Solutions:**

1. **FONTTE Balance Habis**
   - Check balance di dashboard
   - Top-up jika perlu

2. **WhatsApp Device Disconnected**
   - Check status di FONTTE dashboard
   - Reconnect device jika perlu

3. **FONTTE API Error**
   - Check Edge Function logs: `supabase functions logs send-otp`
   - Look for FONTTE error messages
   - Verify API token valid

4. **Network Issue**
   - Test FONTTE API dengan curl
   - Check Supabase Edge Function status
   - Verify mobile app has internet

5. **Rate Limiting**
   - Check if user exceeded hourly limit
   - Wait or adjust limits in Edge Function

**Debug Steps:**
```bash
# Check Edge Function logs
supabase functions logs send-otp --tail

# Test FONTTE API directly
curl -X POST https://api.fonnte.com/send \
  -H "Authorization: YOUR_TOKEN" \
  -d "target=628123456789" \
  -d "message=Test"

# Check database for recent OTP
SELECT * FROM otp_requests
WHERE phone = '+628123456789'
ORDER BY created_at DESC LIMIT 5;
```

### OTP Verification Gagal

**Symptom:** User masukkan OTP yang benar tapi tetap error

**Possible Causes & Solutions:**

1. **OTP Sudah Expired**
   - Check `expires_at` di database
   - Kirim OTP baru

2. **OTP Sudah Digunakan**
   - Check `verified = true` di database
   - Kirim OTP baru

3. **Max Attempts Tercapai**
   - Check `attempts >= 3` di database
   - OTP otomatis invalidated
   - Kirim OTP baru

4. **Session Creation Failed**
   - Check Edge Function logs: `supabase functions logs verify-otp`
   - Verify Supabase auth configuration
   - Check service role key valid

**Debug Steps:**
```bash
# Check OTP record
SELECT * FROM otp_requests
WHERE phone = '+628123456789'
  AND verified = false
  AND expires_at > now()
ORDER BY created_at DESC LIMIT 1;

# Check user creation
SELECT * FROM auth.users WHERE phone = '+628123456789';
SELECT * FROM user_profiles WHERE phone = '+628123456789';

# Check Edge Function logs
supabase functions logs verify-otp --tail
```

### Session Creation Gagal ⚠️ **KNOWN ISSUE**

**Symptom:** OTP verified tapi user tidak login - Edge Function returns 500 error

**Current Status (2025-10-04):**
- ❌ Session token generation fails in Edge Function
- ✅ OTP send and verification logic works
- ✅ User creation in database works
- ✅ Navigation and UI works

**Root Cause:**
Supabase JS v2.39.0 doesn't support `admin.createSession()` and magic link token extraction fails with various approaches attempted:
1. `admin.createSession()` - Method not available
2. `admin.generateLink()` with phone - Fails
3. `admin.generateLink()` with temp email - Server error 500

**Attempted Solutions:**
1. ✅ Fixed navigation issues (inline components, isLoading state)
2. ❌ Tried `admin.createSession()` - not available in v2.39.0
3. ❌ Tried magic link with phone - fails
4. ❌ Tried creating temp email for magic link - still fails

**Recommended Solutions:**

**Option A: Migrate to Supabase Phone Auth (RECOMMENDED)**
```typescript
// Replace FONTTE with Supabase built-in
const { error } = await supabase.auth.signInWithOtp({
  phone: '+6285215641903',
})

const { data, error } = await supabase.auth.verifyOtp({
  phone: '+6285215641903',
  token: '123456',
  type: 'sms'
})
```

Benefits:
- Built-in session management (no custom Edge Function needed)
- Proven and tested
- No token generation issues
- Better security

Drawbacks:
- Requires SMS provider (Twilio ~Rp1500/SMS vs FONTTE ~Rp75/WhatsApp)
- Additional monthly cost

**Option B: Simplify FONTTE Implementation**
1. Edge Function only verifies OTP and returns user ID
2. Client creates anonymous session
3. Link anonymous session to user profile
4. Use refresh tokens for persistence

```typescript
// In verify-otp Edge Function - return user data only
return {
  success: true,
  userId: user.id,
  isProfileComplete: false
}

// In client - create session manually
const { data } = await supabase.auth.signInAnonymously()
// Then link to user profile via metadata
```

**Possible Causes & Solutions:**

1. **Supabase Auth Config Issue**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` correct
   - Check RLS policies allow user creation
   - Verify auth.users table accessible

2. **user_profiles Insert Failed**
   - Check RLS policy allows service role insert
   - Verify foreign key constraint
   - Check Edge Function logs for errors

3. **Session Token Invalid**
   - Check magic link generation in Edge Function
   - Verify token extraction logic
   - Test with Supabase admin functions

4. **Supabase JS Version Issue** ⚠️
   - v2.39.0 may not support `admin.createSession()`
   - Consider upgrading to latest version
   - Or use alternative session creation method

**Debug Steps:**
```bash
# Check auth.users creation
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;

# Check user_profiles sync
SELECT u.id, u.phone, u.created_at, p.name, p.is_profile_complete
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC LIMIT 5;

# Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

# Check Edge Function logs for specific error
supabase functions logs verify-otp --tail
```

**Immediate Workaround for Testing:**
If you need to test the app flow, manually create a session:
```sql
-- In Supabase SQL Editor, after OTP verification
-- This creates a user if not exists
INSERT INTO auth.users (phone, phone_confirmed_at, confirmed_at)
VALUES ('+6285215641903', now(), now())
ON CONFLICT (phone) DO NOTHING;

-- Then in mobile app, use signInWithPassword with a temp password
-- Or manually set tokens in SecureStore for testing
```

### Rate Limiting Issues

**Symptom:** "Terlalu banyak permintaan" error terlalu cepat

**Solutions:**

**For Development/Testing:**
```typescript
// Temporarily increase limits in send-otp/index.ts
const MAX_HOURLY_REQUESTS = 100; // was 5
const RESEND_COOLDOWN_SECONDS = 10; // was 60
```

**For Production:**
```sql
-- Reset rate limit for specific phone (admin only)
DELETE FROM otp_requests
WHERE phone = '+628123456789'
  AND created_at > now() - interval '1 hour';
```

**Adjust Limits via Secrets:**
```bash
supabase secrets set MAX_HOURLY_REQUESTS=10
supabase secrets set RESEND_COOLDOWN_SECONDS=30
```

---

## FAQ

### Q: Apakah FONTTE legal dan aman?

A: FONTTE menggunakan WhatsApp Web automation, **bukan** official WhatsApp Business API. Ini artinya:
- ⚠️ Melanggar WhatsApp Terms of Service
- ⚠️ Risiko WhatsApp number banned
- ⚠️ Tidak ada SLA atau dukungan official dari WhatsApp

**Rekomendasi untuk Production:**
- Gunakan official WhatsApp Business API untuk skala besar
- FONTTE cocok untuk MVP, testing, atau volume kecil
- Siapkan fallback ke SMS jika FONTTE bermasalah

### Q: Berapa lama OTP berlaku?

A: Default 5 menit. Bisa diatur via environment variable `OTP_EXPIRY_MINUTES` di Supabase secrets.

### Q: Berapa kali user bisa request OTP?

A: **Rate Limits:**
- Cooldown: 60 detik antar request
- Hourly limit: 5 requests per phone number
- Daily limit: Tidak ada (tapi limited by hourly)

Adjust via secrets: `RESEND_COOLDOWN_SECONDS` dan `MAX_HOURLY_REQUESTS`

### Q: Apa yang terjadi jika FONTTE down atau quota habis?

A: **Current Behavior:**
- Edge Function returns error
- User melihat error message: "Gagal mengirim OTP"
- User bisa retry setelah cooldown

**Recommended Fallback (future enhancement):**
1. Detect FONTTE error
2. Fallback ke Supabase SMS OTP atau Twilio
3. Notify admin via monitoring system

### Q: Bagaimana cara migrate dari Supabase OTP ke FONTTE?

A: **Good news:** No migration needed!
- Old users (dengan existing sessions) tetap bisa login
- New OTP requests otomatis pakai FONTTE
- Tidak ada breaking changes pada user experience
- User data tetap sama di database

**Steps:**
1. Deploy Edge Functions
2. Update mobile app dengan service baru
3. Test dengan new users
4. Monitor logs untuk errors
5. Gradually rollout to production

### Q: Apakah bisa pakai SMS sebagai fallback?

A: Ya, bisa diimplementasikan. **Cara:**

1. Tambahkan parameter `channel` di send-otp request
2. Modify Edge Function untuk detect channel
3. If `channel === 'sms'`, use Twilio/Supabase SMS
4. If `channel === 'whatsapp'`, use FONTTE

**Example:**
```typescript
// In send-otp/index.ts
const { phone, channel = 'whatsapp' } = await req.json();

if (channel === 'sms') {
  // Use Twilio or Supabase SMS
  await sendSmsOtp(phone, otpCode);
} else {
  // Use FONTTE WhatsApp
  await sendFontteOtp(phone, otpCode);
}
```

### Q: Bagaimana cara scale untuk 10,000+ users?

A: **Scalability Considerations:**

**Database:**
- ✅ Auto cleanup keeps table size manageable
- ✅ Indexed queries for fast lookups
- Consider partitioning `otp_requests` by date

**Edge Functions:**
- ✅ Supabase Edge Functions auto-scale
- ✅ Stateless design (no session affinity)
- Monitor cold start times

**FONTTE:**
- ⚠️ May have API rate limits (check docs)
- Consider multiple FONTTE accounts/devices
- Or migrate to WhatsApp Business API

**Cost:**
- 10K users × 3 logins/month = 30K OTPs
- At Rp 75/message ≈ **Rp 2.25 juta/month**
- Edge Functions: Free tier sufficient
- Database: Free tier sufficient

---

## References

### Documentation Links

- [FONTTE API Docs](https://docs.fonnte.com)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Deno Deploy](https://deno.com/deploy/docs)

### Support Contacts

**FONTTE Support:**
- Email: support@fontte.com
- WhatsApp: (check dashboard)
- Docs: https://docs.fonnte.com

**Supabase Support:**
- Discord: https://discord.supabase.com
- Docs: https://supabase.com/docs
- GitHub: https://github.com/supabase/supabase

**Sinoman Team:**
- Tech Lead: tech@sinomanapp.id
- Support: support@sinomanapp.id

---

## Changelog

### Version 1.0.0 (2025-01-28)
- ✅ Initial FONTTE integration
- ✅ Custom OTP flow with Edge Functions
- ✅ Database tables and migrations
- ✅ Rate limiting implementation
- ✅ Complete documentation

### Future Enhancements
- [ ] SMS fallback option
- [ ] WhatsApp Business API migration
- [ ] Multi-language OTP messages
- [ ] OTP templates customization
- [ ] Advanced fraud detection
- [ ] Admin dashboard for OTP monitoring

---

**Last Updated:** 2025-01-28
**Maintainer:** Sinoman Tech Team
**Version:** 1.0.0
