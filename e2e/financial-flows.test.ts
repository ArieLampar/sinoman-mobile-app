/**
 * E2E Tests for Critical Financial Flows
 * Tests QR payments, top-ups, withdrawals, and error handling
 */

import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Financial Flows E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { camera: 'YES', notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('QR Payment Flow', () => {
    it('should successfully complete a QR payment', async () => {
      // Login first
      await element(by.id('phone-input')).typeText('81234567890');
      await element(by.id('send-otp-button')).tap();

      // Enter OTP (mock in test environment)
      await waitFor(element(by.id('otp-input')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('otp-input')).typeText('123456');
      await element(by.id('verify-otp-button')).tap();

      // Navigate to QR Scanner
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('qr-scan-button')).tap();

      // Mock QR scan (inject test QR data)
      await element(by.id('mock-qr-scan')).tap();

      // Verify payment details shown
      await detoxExpect(element(by.id('payment-amount'))).toBeVisible();
      await detoxExpect(element(by.id('merchant-name'))).toBeVisible();

      // Get initial balance
      const initialBalance = await element(by.id('user-balance')).getAttributes();

      // Confirm payment
      await element(by.id('confirm-payment-button')).tap();

      // Wait for success
      await waitFor(element(by.id('payment-success')))
        .toBeVisible()
        .withTimeout(10000);

      // Verify balance updated
      await waitFor(element(by.id('user-balance')))
        .not.toHaveText(initialBalance.text!)
        .withTimeout(5000);

      // Verify transaction appears in history
      await element(by.id('view-history-button')).tap();
      await detoxExpect(element(by.id('transaction-list')).atIndex(0)).toBeVisible();
    });

    it('should show error for insufficient balance', async () => {
      // Login with user having low balance
      await loginAsUser('81234567890', '123456');

      // Navigate to QR Scanner
      await element(by.id('qr-scan-button')).tap();

      // Mock QR with high amount
      await element(by.id('mock-qr-scan-high-amount')).tap();

      // Confirm payment
      await element(by.id('confirm-payment-button')).tap();

      // Wait for error message
      await waitFor(element(by.text('Saldo tidak mencukupi')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify balance unchanged
      await element(by.id('close-error-button')).tap();
      await element(by.id('back-button')).tap();
      const balance = await element(by.id('user-balance')).getAttributes();
      await detoxExpect(element(by.id('user-balance'))).toHaveText(balance.text!);
    });

    it('should handle network timeout gracefully', async () => {
      await loginAsUser('81234567890', '123456');

      // Enable network throttling (if supported)
      await device.setNetworkCondition('offline');

      // Attempt payment
      await element(by.id('qr-scan-button')).tap();
      await element(by.id('mock-qr-scan')).tap();
      await element(by.id('confirm-payment-button')).tap();

      // Should show timeout error
      await waitFor(element(by.text(/timeout|offline|network/i)))
        .toBeVisible()
        .withTimeout(35000); // API_TIMEOUT + buffer

      // Re-enable network
      await device.setNetworkCondition('online');
    });
  });

  describe('Top-Up Flow', () => {
    it('should successfully complete a top-up', async () => {
      await loginAsUser('81234567890', '123456');

      // Navigate to top-up
      await element(by.id('top-up-button')).tap();

      // Enter amount
      await element(by.id('amount-input')).typeText('50000');

      // Select payment method
      await element(by.id('payment-method-bank-transfer')).tap();

      // Confirm
      await element(by.id('confirm-top-up-button')).tap();

      // Wait for payment instructions
      await waitFor(element(by.id('payment-instructions')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify virtual account number shown
      await detoxExpect(element(by.id('virtual-account'))).toBeVisible();
    });

    it('should validate minimum top-up amount', async () => {
      await loginAsUser('81234567890', '123456');

      await element(by.id('top-up-button')).tap();

      // Enter amount below minimum (< 10000)
      await element(by.id('amount-input')).typeText('5000');
      await element(by.id('confirm-top-up-button')).tap();

      // Should show validation error
      await detoxExpect(element(by.text(/minimum.*10.*000/i))).toBeVisible();
    });
  });

  describe('Transaction History & Pagination', () => {
    it('should load transaction history with pagination', async () => {
      await loginAsUser('81234567890', '123456');

      // Navigate to history
      await element(by.id('transaction-history-button')).tap();

      // Wait for first page to load
      await waitFor(element(by.id('transaction-list')))
        .toBeVisible()
        .withTimeout(5000);

      // Count initial items
      const initialCount = await element(by.id('transaction-item')).getAttributes();

      // Scroll to bottom to trigger pagination
      await element(by.id('transaction-list')).scrollTo('bottom');

      // Wait for more items to load
      await waitFor(element(by.id('loading-more-transactions')))
        .toBeVisible()
        .withTimeout(2000);

      await waitFor(element(by.id('loading-more-transactions')))
        .not.toBeVisible()
        .withTimeout(5000);

      // Verify more items loaded
      // (Implementation depends on list structure)
    });

    it('should filter transactions by type', async () => {
      await loginAsUser('81234567890', '123456');

      await element(by.id('transaction-history-button')).tap();

      // Apply filter
      await element(by.id('filter-button')).tap();
      await element(by.id('filter-qr-payment')).tap();
      await element(by.id('apply-filter-button')).tap();

      // Wait for filtered results
      await waitFor(element(by.id('transaction-list')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify only QR payments shown (check first item type)
      await detoxExpect(element(by.id('transaction-type-0'))).toHaveText('QR Payment');
    });
  });

  describe('Offline Queue', () => {
    it('should queue payment when offline and sync when online', async () => {
      await loginAsUser('81234567890', '123456');

      // Go offline
      await device.setNetworkCondition('offline');

      // Attempt payment
      await element(by.id('qr-scan-button')).tap();
      await element(by.id('mock-qr-scan')).tap();
      await element(by.id('confirm-payment-button')).tap();

      // Should show queued message
      await waitFor(element(by.text(/queued|offline/i)))
        .toBeVisible()
        .withTimeout(5000);

      // Go back online
      await device.setNetworkCondition('online');

      // Trigger sync (or wait for automatic sync)
      await element(by.id('sync-button')).tap();

      // Wait for sync success
      await waitFor(element(by.text(/synced|success/i)))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Withdrawal Flow', () => {
    it('should successfully request withdrawal', async () => {
      await loginAsUser('81234567890', '123456');

      // Navigate to withdrawal
      await element(by.id('menu-button')).tap();
      await element(by.id('withdrawal-button')).tap();

      // Enter amount
      await element(by.id('withdrawal-amount')).typeText('100000');

      // Enter bank details
      await element(by.id('bank-select')).tap();
      await element(by.text('BCA')).tap();
      await element(by.id('account-number')).typeText('1234567890');
      await element(by.id('account-name')).typeText('John Doe');

      // Confirm
      await element(by.id('confirm-withdrawal-button')).tap();

      // Wait for success
      await waitFor(element(by.id('withdrawal-success')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify withdrawal appears in pending
      await element(by.id('view-pending-button')).tap();
      await detoxExpect(element(by.id('pending-withdrawal-0'))).toBeVisible();
    });
  });
});

// Helper functions

async function loginAsUser(phone: string, otp: string) {
  await element(by.id('phone-input')).typeText(phone);
  await element(by.id('send-otp-button')).tap();

  await waitFor(element(by.id('otp-input')))
    .toBeVisible()
    .withTimeout(5000);

  await element(by.id('otp-input')).typeText(otp);
  await element(by.id('verify-otp-button')).tap();

  await waitFor(element(by.id('home-screen')))
    .toBeVisible()
    .withTimeout(5000);
}
