/**
 * E2E Test: QR Payment Flow
 * Tests the complete QR code scanning and payment flows
 */

import { device, element, by, waitFor } from 'detox';
import { loginUser, takeScreenshot, expectElementToBeVisible } from './setup';

describe('QR Payment Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // Login before running payment tests
    await loginUser('081234567890');
  });

  beforeEach(async () => {
    // Return to dashboard before each test
    await element(by.id('dashboard-tab')).tap();
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  describe('QR Code Scanner', () => {
    it('should open QR scanner from dashboard', async () => {
      await element(by.id('scan-qr-button')).tap();

      await waitFor(element(by.id('qr-scanner-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await takeScreenshot('qr-scanner');

      // Camera permission should be requested
      await expect(element(by.id('camera-view'))).toBeVisible();
    });

    it('should navigate to QR scanner from tab bar', async () => {
      await element(by.id('qr-tab')).tap();

      await waitFor(element(by.id('qr-scanner-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.id('camera-view'))).toBeVisible();
    });

    it('should show manual entry option', async () => {
      await element(by.id('scan-qr-button')).tap();

      await waitFor(element(by.id('qr-scanner-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.id('manual-entry-button'))).toBeVisible();
    });
  });

  describe('Payment Confirmation', () => {
    beforeEach(async () => {
      // Navigate to scanner
      await element(by.id('scan-qr-button')).tap();
      await waitFor(element(by.id('qr-scanner-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Simulate QR code scan (mock)
      // In real test, you'd need to inject a QR code or use mock data
      await element(by.id('mock-scan-button')).tap(); // Test helper button
    });

    it('should show payment confirmation screen', async () => {
      await waitFor(element(by.id('payment-confirmation-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await takeScreenshot('payment-confirmation');

      // Verify merchant info displayed
      await expect(element(by.id('merchant-name'))).toBeVisible();
      await expect(element(by.id('payment-amount'))).toBeVisible();
    });

    it('should process payment successfully', async () => {
      await waitFor(element(by.id('payment-confirmation-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify balance is sufficient
      await expect(element(by.id('current-balance'))).toBeVisible();

      // Enter PIN (if required)
      const pinInput = element(by.id('pin-input'));
      const isPinVisible = await pinInput.isVisible();

      if (isPinVisible) {
        await pinInput.typeText('123456');
      }

      // Confirm payment
      await element(by.id('confirm-payment-button')).tap();

      // Wait for success screen
      await waitFor(element(by.id('payment-success-screen')))
        .toBeVisible()
        .withTimeout(10000);

      await takeScreenshot('payment-success');

      // Verify success message
      await expect(element(by.text(/pembayaran berhasil/i))).toBeVisible();
      await expect(element(by.id('transaction-id'))).toBeVisible();
    });

    it('should allow canceling payment', async () => {
      await waitFor(element(by.id('payment-confirmation-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('cancel-payment-button')).tap();

      // Should return to scanner or dashboard
      await waitFor(
        element(by.id('qr-scanner-screen')).or(by.id('dashboard-screen'))
      )
        .toBeVisible()
        .withTimeout(5000);

      await takeScreenshot('payment-cancelled');
    });
  });

  describe('Payment Errors', () => {
    it('should handle insufficient balance', async () => {
      // Navigate to payment confirmation with amount > balance
      await element(by.id('scan-qr-button')).tap();
      await element(by.id('mock-scan-high-amount-button')).tap(); // Mock large amount

      await waitFor(element(by.id('payment-confirmation-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('confirm-payment-button')).tap();

      // Should show insufficient balance error
      await waitFor(element(by.text(/saldo tidak mencukupi/i)))
        .toBeVisible()
        .withTimeout(5000);

      await takeScreenshot('insufficient-balance');
    });

    it('should handle invalid QR code', async () => {
      await element(by.id('scan-qr-button')).tap();
      await element(by.id('mock-scan-invalid-button')).tap(); // Mock invalid QR

      // Should show error message
      await waitFor(element(by.text(/qr code tidak valid/i)))
        .toBeVisible()
        .withTimeout(5000);

      await takeScreenshot('invalid-qr');
    });

    it('should handle network error during payment', async () => {
      await element(by.id('scan-qr-button')).tap();
      await element(by.id('mock-scan-button')).tap();

      await waitFor(element(by.id('payment-confirmation-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Mock network error
      await device.setNetworkConnection('offline');
      await element(by.id('confirm-payment-button')).tap();

      // Should show offline error
      await waitFor(element(by.text(/tidak ada koneksi internet/i)))
        .toBeVisible()
        .withTimeout(5000);

      await takeScreenshot('payment-offline');

      // Restore connection
      await device.setNetworkConnection('wifi');
    });
  });

  describe('Payment Receipt', () => {
    beforeEach(async () => {
      // Complete a payment first
      await element(by.id('scan-qr-button')).tap();
      await element(by.id('mock-scan-button')).tap();
      await waitFor(element(by.id('payment-confirmation-screen')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('confirm-payment-button')).tap();
      await waitFor(element(by.id('payment-success-screen')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should display payment receipt', async () => {
      // Verify receipt details
      await expect(element(by.id('merchant-name'))).toBeVisible();
      await expect(element(by.id('transaction-id'))).toBeVisible();
      await expect(element(by.id('payment-amount'))).toBeVisible();
      await expect(element(by.id('payment-date'))).toBeVisible();
      await expect(element(by.id('payment-status'))).toBeVisible();

      await takeScreenshot('payment-receipt');
    });

    it('should allow sharing receipt', async () => {
      const shareButton = element(by.id('share-receipt-button'));
      await expect(shareButton).toBeVisible();

      await shareButton.tap();

      // Share sheet should appear (platform-specific)
      await takeScreenshot('share-receipt');
    });

    it('should return to dashboard from receipt', async () => {
      await element(by.id('done-button')).tap();

      await waitFor(element(by.id('dashboard-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Balance should be updated
      await expect(element(by.id('balance-amount'))).toBeVisible();
    });
  });

  describe('Transaction History', () => {
    it('should show payment in transaction history', async () => {
      // Navigate to transactions
      await element(by.id('profile-tab')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('transaction-history-button')).tap();

      await waitFor(element(by.id('transaction-history-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Latest transaction should be visible
      await expect(element(by.id('transaction-item-0'))).toBeVisible();

      await takeScreenshot('transaction-history');
    });

    it('should view transaction details from history', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('transaction-history-button')).tap();

      await waitFor(element(by.id('transaction-history-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Tap on first transaction
      await element(by.id('transaction-item-0')).tap();

      // Should show transaction details
      await waitFor(element(by.id('transaction-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.id('transaction-id'))).toBeVisible();
      await expect(element(by.id('merchant-name'))).toBeVisible();

      await takeScreenshot('transaction-detail');
    });
  });
});
