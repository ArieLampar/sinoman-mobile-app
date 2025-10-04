# Migration Guide - Security & Robustness Updates

## Overview
This guide helps you migrate to the new security-hardened version of the Sinoman Mobile App. Follow these steps carefully to ensure a smooth transition.

---

## Pre-Migration Checklist

### 1. Backup Current State
```bash
# Backup database
supabase db dump -f backups/pre_security_update_$(date +%Y%m%d).sql

# Backup Edge Functions
cd supabase/functions
tar -czf ../../backups/edge_functions_backup_$(date +%Y%m%d).tar.gz .

# Tag current version
git tag -a v1.0.0-pre-security -m "Pre-security update"
git push origin v1.0.0-pre-security
```

### 2. Update Dependencies
```bash
npm install
```

New dependencies added:
- `crypto-es@^3.1.2` - Real AES encryption
- `decimal.js@^10.6.0` - Precise monetary calculations
- `zod@^4.1.11` - Schema validation
- `react-native-get-random-values@^1.11.0` - Crypto polyfill

### 3. Environment Variables
Ensure `.env` has:
```bash
# Required
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OTP Configuration
EXPO_PUBLIC_OTP_RESEND_COOLDOWN=60

# Environment
EXPO_PUBLIC_ENV=production
```

---

## Database Migration

### Step 1: Apply Migrations
```bash
# Connect to Supabase
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Verify migrations
supabase db dump --schema public -f verify_schema.sql
```

### Step 2: Verify RLS Policies
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('transactions', 'user_balances', 'savings_balance', 'merchants');

-- Should all show rowsecurity = true

-- Test RLS (as regular user, not service role)
SELECT * FROM transactions WHERE user_id = auth.uid();
-- Should only return current user's transactions
```

### Step 3: Test Atomic RPC
```sql
-- Test QR payment RPC
SELECT * FROM process_qr_payment(
  p_user_id := auth.uid(),
  p_amount := 50000.00,
  p_merchant_id := 'valid-merchant-uuid',
  p_savings_type := 'regular',
  p_notes := 'Test payment'
);

-- Verify transaction created and balance updated
SELECT * FROM transactions WHERE user_id = auth.uid() ORDER BY created_at DESC LIMIT 1;
SELECT * FROM user_balances WHERE user_id = auth.uid();
```

---

## Edge Functions Update

### Step 1: Update Logging
Replace all Edge Function console.* calls with the new logger:

```typescript
// Before
console.log('User logged in:', userId);
console.error('Error:', error);

// After
import * as log from '../_shared/log.ts';

log.info('User logged in', { userId });
log.error('Error occurred', { error: error.message });
```

### Step 2: Deploy Functions
```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy send-otp
supabase functions deploy verify-otp
```

### Step 3: Set Environment Variables
```bash
# Set log level
supabase secrets set LOG_LEVEL=info

# Set environment
supabase secrets set ENVIRONMENT=production

# Verify secrets
supabase secrets list
```

---

## Client-Side Migration

### Step 1: Data Migration (Automatic)
The app will automatically migrate data from AsyncStorage to SecureStore on first launch. This happens in the background:

1. User opens app
2. `migrateFromAsyncStorage()` runs
3. Data moved to encrypted SecureStore
4. AsyncStorage cleaned up
5. Migration flag set

**Monitor migration**:
```typescript
// In App.tsx or index.tsx
import { migrateFromAsyncStorage } from '@services/auth/sessionManager';

useEffect(() => {
  migrateFromAsyncStorage()
    .then(() => console.log('Migration completed'))
    .catch((err) => console.error('Migration failed:', err));
}, []);
```

### Step 2: Update API Calls
Replace direct Supabase calls with new API client:

```typescript
// Before
const { data, error } = await supabase.functions.invoke('send-otp', {
  body: { phone },
});

// After
import { invokeEdgeFunction } from '@services/apiClient';

const { data, error } = await invokeEdgeFunction('send-otp', { phone }, {
  timeout: 10000,
  retryAttempts: 3,
});
```

### Step 3: Update QR Payment Flow
Replace direct transaction insert with atomic RPC:

```typescript
// Before
const { data: transaction } = await supabase
  .from('transactions')
  .insert({...})
  .select()
  .single();

await supabase
  .from('user_balances')
  .update({ available_balance: newBalance })
  .eq('user_id', userId);

// After
import { executeRpc } from '@services/apiClient';

const { data, error } = await executeRpc('process_qr_payment', {
  p_user_id: userId,
  p_amount: amount,
  p_merchant_id: merchantId,
  p_savings_type: savingsType,
  p_notes: notes,
});

if (data?.success) {
  // Payment successful
  console.log('Transaction ID:', data.transaction_id);
  console.log('New balance:', data.new_balance);
} else {
  // Handle error
  console.error(data?.error_message);
}
```

### Step 4: Update Monetary Calculations
Replace float arithmetic with Decimal.js utilities:

```typescript
// Before
const total = subtotal + tax;
const taxAmount = subtotal * (taxRate / 100);

// After
import { addMoney, calculateTax } from '@utils/monetary';

const taxAmount = calculateTax(subtotal, taxRate);
const total = addMoney(subtotal, taxAmount);
```

### Step 5: Add Validation to QR Payments
```typescript
import { validateQRPaymentRequest, safeValidate } from '@schemas/qrPaymentSchema';

// Validate before sending
const validation = safeValidate(QRPaymentRequestSchema, paymentData);
if (!validation.success) {
  // Show errors
  console.error(validation.errors);
  return;
}

// Use validated data
const { data } = await executeRpc('process_qr_payment', validation.data);
```

### Step 6: Add Image Validation
For Fit Challenge or profile uploads:

```typescript
import { prepareImageForUpload } from '@utils/imageValidation';

const result = await prepareImageForUpload(imageUri);
if (!result.isValid) {
  Alert.alert('Error', result.error);
  return;
}

// Upload compressed image
await uploadImage(result.compressedUri);
```

---

## Testing Checklist

### Unit Tests
- [ ] Test encryption/decryption with new AES implementation
- [ ] Test monetary calculations (no float errors)
- [ ] Test zod schema validation (valid/invalid cases)
- [ ] Test OTP cooldown hook
- [ ] Test image validation (size, format, compression)

### Integration Tests
- [ ] Test SecureStore migration (AsyncStorage → SecureStore)
- [ ] Test atomic QR payment RPC (success/failure)
- [ ] Test RLS policies (unauthorized access blocked)
- [ ] Test API client retry/timeout logic
- [ ] Test logout credential purge

### E2E Tests
Run the new E2E test suite:
```bash
# Build for testing
npm run test:e2e:build:android
npm run test:e2e:build:ios

# Run tests
npm run test:e2e:android
npm run test:e2e:ios
```

**Must pass**:
- [ ] QR payment success flow
- [ ] Insufficient balance handling
- [ ] Network timeout/offline handling
- [ ] Transaction history pagination
- [ ] Offline queue sync
- [ ] Top-up validation
- [ ] Withdrawal flow

### Security Tests
- [ ] Verify HTTPS-only (try HTTP URL → should fail)
- [ ] Verify RLS (try accessing other user's data → blocked)
- [ ] Verify encryption (check MMKV/SecureStore data → not readable)
- [ ] Verify logout (check storage after logout → empty)
- [ ] Verify PII redaction in logs (check server logs → no raw phone/OTP)

---

## Rollback Plan

If issues arise, rollback procedure:

### 1. Rollback Database
```bash
# Restore from backup
psql -h db.your-project.supabase.co -U postgres -d postgres < backups/pre_security_update_YYYYMMDD.sql

# Or use Supabase PITR (if available)
# Dashboard → Database → Backups → Restore to point in time
```

### 2. Rollback Edge Functions
```bash
# Extract backup
tar -xzf backups/edge_functions_backup_YYYYMMDD.tar.gz -C supabase/functions

# Redeploy old functions
supabase functions deploy
```

### 3. Rollback App
```bash
# Revert to previous version
git revert HEAD
git push

# Create emergency OTA update
eas update --branch production --message "Rollback security update"
```

### 4. Monitor
- Check error rates in Sentry
- Monitor database load
- Watch for failed migrations

---

## Post-Migration Verification

### 1. Monitor Key Metrics
```bash
# Database queries
SELECT COUNT(*) FROM transactions WHERE created_at > NOW() - INTERVAL '1 hour';
SELECT COUNT(*) FROM user_balances WHERE updated_at > NOW() - INTERVAL '1 hour';

# Check for errors
SELECT * FROM audit_log WHERE timestamp > NOW() - INTERVAL '1 hour' ORDER BY timestamp DESC;
```

### 2. User Feedback
- Monitor support channels
- Check app reviews
- Watch for crash reports

### 3. Performance
- API response times (should be < 500ms for RPC)
- Encryption overhead (minimal)
- Image compression (should reduce upload time)

---

## Troubleshooting

### Issue: Migration Failed
**Symptom**: App shows "Login required" after update

**Solution**:
```typescript
// Force re-login
await clearSession();
navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
```

### Issue: RLS Blocking Legitimate Access
**Symptom**: "Insufficient privileges" error

**Solution**:
```sql
-- Check user's auth.uid()
SELECT auth.uid();

-- Verify RLS policy
SELECT * FROM pg_policies WHERE tablename = 'transactions';

-- Temporary: Disable RLS (NOT for production!)
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

### Issue: Atomic Payment RPC Timeout
**Symptom**: Payment hangs or times out

**Solution**:
```sql
-- Check for long-running transactions
SELECT * FROM pg_stat_activity WHERE state = 'active' AND query LIKE '%process_qr_payment%';

-- Kill if stuck
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = <stuck_pid>;

-- Increase statement timeout
ALTER DATABASE postgres SET statement_timeout = '30s';
```

### Issue: Image Upload Fails
**Symptom**: "File too large" or compression error

**Solution**:
```typescript
// Check image size before compression
const fileInfo = await FileSystem.getInfoAsync(uri);
console.log('File size:', fileInfo.size);

// Try lower quality
const result = await compressImage(uri, 1920, 1920, 0.6);
```

---

## Support

If you encounter issues during migration:

1. **Check logs**:
   ```bash
   # Edge Functions
   supabase functions logs send-otp --tail

   # Client logs
   npx expo start --clear
   ```

2. **Contact team**:
   - Technical Lead: [CONTACT]
   - Database Admin: [CONTACT]
   - DevOps: [CONTACT]

3. **Reference docs**:
   - [SECURITY_IMPROVEMENTS_SUMMARY.md](./SECURITY_IMPROVEMENTS_SUMMARY.md)
   - [BACKUP_STRATEGY.md](./BACKUP_STRATEGY.md)

---

## Timeline

### Week 1: Testing & Staging
- Day 1-2: Deploy to staging
- Day 3-4: Run test suite
- Day 5: Security audit

### Week 2: Production Rollout
- Day 1: Deploy database migrations (off-peak)
- Day 2: Deploy Edge Functions
- Day 3: Release app update (phased rollout)
- Day 4-5: Monitor & support

### Week 3: Cleanup
- Remove old code
- Update documentation
- Team training session

---

**Document Version**: 1.0
**Last Updated**: 2025-01-28
**Migration Status**: Ready for staging
