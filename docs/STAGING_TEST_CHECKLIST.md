# Staging Environment Test Checklist

## 🎯 Critical Flows to Test

Run through these tests on the staging environment before deploying to production.

---

## ✅ Test 1: Login with OTP

### Prerequisites
- App running on staging: `EXPO_PUBLIC_ENV=staging npm start`
- Phone with test number ready (e.g., 81234567890)
- Access to OTP verification (Fontte dashboard or logs)

### Steps

#### 1.1 Send OTP
- [ ] Open the app
- [ ] Enter phone number: `81234567890`
- [ ] Tap "Send OTP" button
- [ ] **Verify**: Button shows cooldown timer (60 seconds)
- [ ] **Verify**: Button is disabled during cooldown
- [ ] **Verify**: Cannot spam the button (debounced)
- [ ] **Check logs**: PII redaction working (phone should be masked in logs)

```bash
# Monitor Edge Function logs
supabase functions logs send-otp --tail
```

**Expected log format**:
```json
{
  "timestamp": "2025-01-28T...",
  "level": "INFO",
  "message": "OTP sent successfully",
  "meta": { "phone": "8123***890" }  // ← Phone masked
}
```

#### 1.2 Verify OTP
- [ ] Receive OTP (check Fontte dashboard or logs)
- [ ] Enter OTP code
- [ ] Tap "Verify OTP"
- [ ] **Verify**: Loading state shown
- [ ] **Verify**: No email placeholder in session data
- [ ] **Verify**: Proper phone authentication used

```bash
# Check verify-otp logs
supabase functions logs verify-otp --tail
```

**Expected**: Should see "OTP verified successfully" with proper session creation (no magic link hacks).

#### 1.3 Session Storage (SecureStore)
- [ ] **Verify**: User logged in successfully
- [ ] **Check**: Session stored in SecureStore (not AsyncStorage)

**Manual verification**:
```typescript
// In React Native Debugger or console
import * as SecureStore from 'expo-secure-store';

// Should have data
const token = await SecureStore.getItemAsync('sinoman_auth_token');
console.log('Token exists:', !!token);

// AsyncStorage should be empty (or have migration flag only)
import AsyncStorage from '@react-native-async-storage/async-storage';
const oldToken = await AsyncStorage.getItem('@sinoman:auth_token');
console.log('Old token (should be null):', oldToken);
```

#### 1.4 Migration Test (Existing Users)
If testing with an app that has existing AsyncStorage data:

- [ ] Launch app (first time after update)
- [ ] **Check logs**: "Starting migration from AsyncStorage to SecureStore"
- [ ] **Check logs**: "Migration completed successfully"
- [ ] **Verify**: User still logged in
- [ ] **Verify**: Data moved to SecureStore
- [ ] **Verify**: AsyncStorage cleaned up

---

## ✅ Test 2: QR Payment with Atomic RPC

### Prerequisites
- Logged in user with sufficient balance
- Test merchant ID in database
- Access to database to verify atomicity

### Steps

#### 2.1 Successful Payment
- [ ] Navigate to QR Scanner
- [ ] Scan test QR code (or use mock data)
- [ ] **Verify**: Payment details shown (amount, merchant name)
- [ ] **Verify**: Current balance displayed
- [ ] Note current balance: `______`
- [ ] Tap "Confirm Payment"
- [ ] **Verify**: Loading state shown
- [ ] **Verify**: Success message appears
- [ ] **Verify**: New balance = old balance - amount
- [ ] **Verify**: Transaction appears in history immediately

**Database verification**:
```sql
-- Check transaction created
SELECT * FROM transactions
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC
LIMIT 1;

-- Verify balance updated atomically
SELECT * FROM user_balances
WHERE user_id = 'your-user-id';

-- Both should match (no race condition)
```

#### 2.2 Insufficient Balance
- [ ] Note current balance: `______`
- [ ] Attempt payment for amount > balance
- [ ] **Verify**: Error message: "Saldo tidak mencukupi" or "Insufficient balance"
- [ ] **Verify**: Balance unchanged
- [ ] **Verify**: No transaction record created

**Database verification**:
```sql
-- Should NOT have failed transaction
SELECT * FROM transactions
WHERE user_id = 'your-user-id'
  AND status = 'failed'
  AND created_at > NOW() - INTERVAL '5 minutes';
-- Should be empty
```

#### 2.3 Invalid Merchant
- [ ] Mock QR with non-existent merchant ID
- [ ] Attempt payment
- [ ] **Verify**: Error message: "Invalid or inactive merchant"
- [ ] **Verify**: Balance unchanged
- [ ] **Verify**: No transaction created

#### 2.4 Concurrent Payment Test (Race Condition)
This tests the atomic RPC prevents double-spending:

**Manual test** (requires 2 devices or rapid taps):
- [ ] Start payment on device 1
- [ ] Immediately start same payment on device 2 (within 1 second)
- [ ] **Verify**: Only ONE payment succeeds
- [ ] **Verify**: Balance deducted only once
- [ ] **Verify**: Database shows only 1 transaction

**Database verification**:
```sql
-- Check for duplicate transactions
SELECT merchant_id, COUNT(*) as count
FROM transactions
WHERE user_id = 'your-user-id'
  AND created_at > NOW() - INTERVAL '1 minute'
GROUP BY merchant_id
HAVING COUNT(*) > 1;
-- Should be empty
```

#### 2.5 Validation Test (Zod Schema)
- [ ] Attempt payment with invalid amount (0 or negative)
- [ ] **Verify**: Client-side validation error
- [ ] Attempt payment with invalid merchant ID format
- [ ] **Verify**: Validation error before API call
- [ ] Attempt payment with notes > 500 characters
- [ ] **Verify**: Validation error: "Notes cannot exceed 500 characters"
- [ ] Attempt payment with invalid characters in notes (e.g., `<script>`)
- [ ] **Verify**: Validation error: "Notes contain invalid characters"

---

## ✅ Test 3: SecureStore Migration

### For New Installs
- [ ] Fresh install (clear app data first)
- [ ] Complete login
- [ ] **Verify**: Data stored in SecureStore
- [ ] **Verify**: No AsyncStorage entries (except migration flag)

### For Existing Users (Upgrade Path)
- [ ] Install old version
- [ ] Login and save some data
- [ ] **Verify**: Data in AsyncStorage
- [ ] Upgrade to new version
- [ ] **Check logs**: Migration runs automatically
- [ ] **Verify**: Data moved to SecureStore
- [ ] **Verify**: AsyncStorage cleaned up
- [ ] **Verify**: User remains logged in (seamless)

**Verification script**:
```typescript
import { migrateFromAsyncStorage } from '@services/auth/sessionManager';

// Run migration
const success = await migrateFromAsyncStorage();
console.log('Migration successful:', success);

// Check SecureStore has data
const session = await getStoredSession();
console.log('Session in SecureStore:', !!session);
```

---

## ✅ Test 4: RLS Policies Enforcement

### Prerequisites
- Access to Supabase dashboard
- Test user account
- Database access

### Steps

#### 4.1 Verify RLS Enabled
```sql
-- Check RLS is ON
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('transactions', 'user_balances', 'savings_balance', 'merchants');

-- All should show rowsecurity = true
```

#### 4.2 Test User Isolation
**As authenticated user**:
```sql
-- Should only see OWN transactions
SELECT COUNT(*) FROM transactions WHERE user_id = auth.uid();
-- Returns count

SELECT COUNT(*) FROM transactions WHERE user_id != auth.uid();
-- Returns 0 or error (no access to other users)
```

#### 4.3 Test Direct Modification Blocked
**Try direct insert (should FAIL)**:
```sql
-- This should be blocked by RLS
INSERT INTO transactions (user_id, type, amount, status)
VALUES (auth.uid(), 'qr_payment', 50000, 'completed');
-- Expected: "new row violates row-level security policy"
```

**Try direct balance update (should FAIL)**:
```sql
-- This should be blocked by RLS
UPDATE user_balances
SET available_balance = available_balance + 1000000
WHERE user_id = auth.uid();
-- Expected: "new row violates row-level security policy"
```

#### 4.4 Test RPC Works (Privileged)
```sql
-- This should SUCCEED (uses security definer)
SELECT * FROM process_qr_payment(
  p_user_id := auth.uid(),
  p_amount := 10000,
  p_merchant_id := 'valid-merchant-uuid',
  p_savings_type := 'regular',
  p_notes := 'Test payment'
);
-- Expected: success = true, transaction_id returned
```

#### 4.5 Test Via REST API
```bash
# Get transactions (authenticated)
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_USER_TOKEN" \
     https://your-project.supabase.co/rest/v1/transactions

# Expected: Returns only user's transactions

# Try to access another user's balance (should fail)
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_USER_TOKEN" \
     https://your-project.supabase.co/rest/v1/user_balances?user_id=eq.other-user-id

# Expected: Empty array or error
```

---

## ✅ Test 5: Logout Credential Purge

### Steps

#### 5.1 Before Logout
- [ ] Login successfully
- [ ] Note session exists in SecureStore
- [ ] Note user data exists
- [ ] **Verify**: `isAuthenticated = true` in app state

**Check storage**:
```typescript
import * as SecureStore from 'expo-secure-store';

const token = await SecureStore.getItemAsync('sinoman_auth_token');
const refreshToken = await SecureStore.getItemAsync('sinoman_refresh_token');
const userData = await SecureStore.getItemAsync('sinoman_user_data');

console.log('Before logout:', {
  hasToken: !!token,
  hasRefreshToken: !!refreshToken,
  hasUserData: !!userData,
});
// All should be true
```

#### 5.2 Perform Logout
- [ ] Tap logout button
- [ ] **Verify**: Loading state shown
- [ ] **Check logs**: "User signed out successfully - all credentials cleared"
- [ ] **Verify**: Redirected to login screen

#### 5.3 After Logout
- [ ] **Verify**: All SecureStore keys cleared
- [ ] **Verify**: MMKV encrypted stores cleared
- [ ] **Verify**: Supabase client state reset
- [ ] **Verify**: App state reset (`isAuthenticated = false`)

**Check storage**:
```typescript
const token = await SecureStore.getItemAsync('sinoman_auth_token');
const refreshToken = await SecureStore.getItemAsync('sinoman_refresh_token');
const userData = await SecureStore.getItemAsync('sinoman_user_data');

console.log('After logout:', {
  hasToken: !!token,
  hasRefreshToken: !!refreshToken,
  hasUserData: !!userData,
});
// All should be false or null
```

#### 5.4 Attempt Re-login
- [ ] Try to login again
- [ ] **Verify**: No cached credentials
- [ ] **Verify**: Fresh OTP required
- [ ] **Verify**: Successful login works normally

---

## ✅ Test 6: Additional Security Checks

### 6.1 HTTPS Enforcement
- [ ] Check app config enforces HTTPS
- [ ] Attempt to build with HTTP URL (should fail)

```bash
# Try to run with HTTP (should throw error)
EXPO_PUBLIC_SUPABASE_URL=http://example.com npm start
# Expected: "Supabase URL must use HTTPS"
```

### 6.2 OTP Cooldown & Debouncing
- [ ] Send OTP
- [ ] **Verify**: 60-second cooldown starts
- [ ] **Verify**: Button disabled with countdown
- [ ] Try rapid taps during cooldown
- [ ] **Verify**: Debounce prevents multiple requests
- [ ] Wait for cooldown to expire
- [ ] **Verify**: Button re-enabled

### 6.3 Encryption Verification
Test that data is actually encrypted (not plaintext):

```typescript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'sinoman-secure' });
const encryptedData = storage.getString('some-key');

console.log('Encrypted data:', encryptedData);
// Should look like: {"ciphertext":"...","iv":"...","authTag":"..."}
// NOT plaintext

// Verify decryption works
import { decryptJSON } from '@services/security/encryptionService';
const decrypted = await decryptJSON(encryptedData, key);
console.log('Decrypted:', decrypted);
```

### 6.4 Monetary Precision
Test that calculations are precise:

```typescript
import { addMoney, calculateTax, formatMoney } from '@utils/monetary';

// Test precision
const subtotal = 10000.1;
const tax = calculateTax(subtotal, 11); // 11% = 1100.011
const total = addMoney(subtotal, tax); // 11100.111

console.log('Total:', total); // Should be exact, no float errors
console.log('Formatted:', formatMoney(total)); // "Rp 11.100,11"

// Test no float errors
const result = addMoney(0.1, 0.2);
console.log('0.1 + 0.2 =', result); // Should be exactly 0.3
```

---

## 📊 Test Results Template

```markdown
## Test Run: [DATE]
Tester: [NAME]
Environment: Staging
App Version: 1.0.0
Build: [BUILD_NUMBER]

### Test 1: Login with OTP
- [ ] PASS / ❌ FAIL - Send OTP
  - Issues: ___________
- [ ] PASS / ❌ FAIL - Verify OTP
  - Issues: ___________
- [ ] PASS / ❌ FAIL - SecureStore migration
  - Issues: ___________

### Test 2: QR Payment
- [ ] PASS / ❌ FAIL - Successful payment
  - Issues: ___________
- [ ] PASS / ❌ FAIL - Insufficient balance
  - Issues: ___________
- [ ] PASS / ❌ FAIL - Invalid merchant
  - Issues: ___________
- [ ] PASS / ❌ FAIL - Race condition prevention
  - Issues: ___________
- [ ] PASS / ❌ FAIL - Validation
  - Issues: ___________

### Test 3: RLS Policies
- [ ] PASS / ❌ FAIL - User isolation
  - Issues: ___________
- [ ] PASS / ❌ FAIL - Direct modification blocked
  - Issues: ___________
- [ ] PASS / ❌ FAIL - RPC works
  - Issues: ___________

### Test 4: Logout
- [ ] PASS / ❌ FAIL - Credential purge
  - Issues: ___________
- [ ] PASS / ❌ FAIL - State reset
  - Issues: ___________

### Test 5: Additional
- [ ] PASS / ❌ FAIL - HTTPS enforcement
  - Issues: ___________
- [ ] PASS / ❌ FAIL - OTP cooldown
  - Issues: ___________
- [ ] PASS / ❌ FAIL - Encryption
  - Issues: ___________
- [ ] PASS / ❌ FAIL - Monetary precision
  - Issues: ___________

## Overall: ✅ READY FOR PRODUCTION / ❌ NEEDS FIXES

Notes:
___________________________________________
```

---

## 🐛 Common Issues & Solutions

### Issue: Migration doesn't run
**Solution**: Clear app data and reinstall
```bash
# Android
adb shell pm clear id.sinomanapp.mobile

# iOS
Uninstall app and reinstall
```

### Issue: RLS blocks legitimate access
**Solution**: Check auth.uid() matches user_id
```sql
SELECT auth.uid(); -- Should match your user ID
```

### Issue: OTP not received
**Solution**: Check Fontte configuration and logs
```bash
supabase functions logs send-otp --tail
```

### Issue: Payment hangs
**Solution**: Check database locks
```sql
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

---

**Document Version**: 1.0
**Last Updated**: 2025-01-28
