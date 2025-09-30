# Phase 2 Setup Guide

Quick setup guide for Phase 2 Authentication System.

---

## 📦 Step 1: Install Dependencies

```bash
npm install
```

New dependencies added:
- `expo-local-authentication@~13.4.1` - Biometric authentication
- `expo-app-state@~2.4.0` - App state monitoring

---

## 🔧 Step 2: Configure Supabase SMS Provider

### Option A: Using Twilio (Recommended)

1. **Create Twilio Account**
   - Go to [twilio.com](https://www.twilio.com)
   - Sign up for free account
   - Get $15 trial credit

2. **Get Credentials**
   - Account SID
   - Auth Token
   - Phone Number

3. **Configure in Supabase**
   - Go to Supabase Dashboard
   - Authentication → Providers
   - Enable "Phone"
   - Select "Twilio" as SMS provider
   - Enter Account SID, Auth Token, Phone Number
   - Save

### Option B: Using MessageBird

1. **Create MessageBird Account**
   - Go to [messagebird.com](https://www.messagebird.com)
   - Sign up for account
   - Get API key

2. **Configure in Supabase**
   - Supabase Dashboard → Authentication → Providers
   - Enable "Phone"
   - Select "MessageBird"
   - Enter API Key
   - Save

### Option C: Test Mode (Development Only)

For development without SMS:

1. **Enable Test Mode in Supabase**
   - Dashboard → Authentication → Phone
   - Enable "Test Mode"
   - Use test OTP: `123456`

2. **Test Phone Numbers**
   - Any phone starting with `81` will work
   - OTP will always be `123456` in test mode

---

## ⚙️ Step 3: Environment Variables

Ensure your `.env` has:

```bash
# Supabase (should already be set from Phase 1)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_ENV=development
```

---

## 🧪 Step 4: Test Authentication

### Test Login Flow

1. **Start App**
   ```bash
   npm start
   ```

2. **Enter Phone Number**
   - Format: `81234567890` (without +62 or leading 0)
   - Example: `81234567890`

3. **Receive OTP**
   - Check SMS (real SMS provider)
   - Or use `123456` (test mode)

4. **Enter OTP**
   - Enter 6-digit code
   - Auto-submits when complete
   - Should login to Main App

### Test Biometric (Physical Device Only)

1. **Login first** with phone + OTP
2. **Enable biometric** in Profile (when implemented)
3. **Logout**
4. **Login again** - should prompt for biometric

### Test Session Persistence

1. **Login** with phone + OTP
2. **Close app completely**
3. **Reopen app**
4. **Should stay logged in**

### Test Auto-Logout

1. **Login** with phone + OTP
2. **Leave app inactive** for 15 minutes
3. **App should automatically logout**

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:**
```bash
# Check .env file exists
ls .env

# Verify contents
cat .env

# Restart Metro bundler
npm start
```

### Issue: "Failed to send OTP"

**Possible Causes:**
1. SMS provider not configured in Supabase
2. No credit in SMS provider account
3. Invalid phone number format
4. Network connectivity issue

**Solutions:**
- Check Supabase Dashboard → Authentication → Phone
- Verify SMS provider credentials
- Ensure phone number starts with 8 (Indonesian format)
- Check internet connection

### Issue: "Biometric not available"

**Causes:**
- Running on simulator/emulator
- Device doesn't have biometric hardware
- Biometric not enrolled

**Solutions:**
- Test on real device
- Enroll fingerprint/Face ID in device settings
- Fallback to OTP login will work

### Issue: "Session not persisting"

**Solutions:**
```bash
# Clear AsyncStorage (development only)
# In app, add temporary code:
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();

# Or reinstall app
```

### Issue: OTP not auto-reading (Android)

**Notes:**
- Auto-read requires Google Play Services
- Works on physical devices
- May not work on all Android versions
- User can still manually enter code

---

## 📱 Testing Checklist

Before proceeding to Phase 3:

- [ ] Phone input accepts Indonesian numbers
- [ ] OTP is received via SMS
- [ ] OTP verification works
- [ ] Session persists after app restart
- [ ] Auto-logout after 15 minutes works
- [ ] Biometric prompt appears (on real device)
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Navigation flows correctly
- [ ] No console errors

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 📝 Notes

### Indonesian Phone Format
- Format: `8XXXXXXXXXX` (10-13 digits)
- Starts with `8` (without +62 or 0)
- Example: `81234567890`
- App automatically adds +62 prefix

### OTP Details
- Length: 6 digits
- Expiry: 5 minutes
- Can resend after expiry
- Test mode OTP: `123456`

### Session Details
- Token expiry: 1 hour
- Auto-refresh by Supabase
- Session timeout: 15 minutes inactivity
- Persisted to AsyncStorage

---

## 🎯 Success Criteria

Phase 2 is successfully set up when:

✅ Can login with phone + OTP
✅ Session persists across app restarts
✅ Biometric works on real device (optional)
✅ Auto-logout after inactivity
✅ No TypeScript errors
✅ No ESLint errors
✅ All screens render correctly

---

## 🔜 Ready for Phase 3

Once all tests pass, you're ready for:

**Phase 3: Core Features (Day 5-7)**
- Dashboard with balance overview
- Savings management (Pokok, Wajib, Sukarela)
- Transaction history
- Top-up functionality
- Real-time balance updates

---

## 📞 Need Help?

- **Technical**: tech@sinomanapp.id
- **Supabase**: product@sinomanapp.id
- **WhatsApp**: +62 82331052577

---

**Setup Time**: ~10-15 minutes
**Testing Time**: ~10 minutes
**Total**: ~25 minutes

**Good luck!** 🚀