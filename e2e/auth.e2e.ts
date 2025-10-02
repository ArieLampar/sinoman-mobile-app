/**
 * E2E Test: Authentication Flow
 * Tests complete user registration and login flows
 */

import { device, element, by, waitFor } from 'detox';
import { clearAppData, takeScreenshot, loginUser, logoutUser } from './setup';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('New User Registration', () => {
    beforeEach(async () => {
      await clearAppData();
    });

    it('should complete registration flow successfully', async () => {
      // Step 1: Phone number entry
      await waitFor(element(by.id('phone-input')))
        .toBeVisible()
        .withTimeout(10000);

      await element(by.id('phone-input')).typeText('081234567890');
      await takeScreenshot('01-phone-entry');

      await element(by.id('send-otp-button')).tap();

      // Step 2: OTP verification
      await waitFor(element(by.id('otp-screen')))
        .toBeVisible()
        .withTimeout(10000);

      await element(by.id('otp-input')).typeText('123456');
      await takeScreenshot('02-otp-entry');

      await element(by.id('verify-otp-button')).tap();

      // Step 3: Profile registration (for new users)
      await waitFor(element(by.id('registration-screen')))
        .toBeVisible()
        .withTimeout(10000);

      await element(by.id('name-input')).typeText('Test User');
      await element(by.id('email-input')).typeText('test@example.com');
      await takeScreenshot('03-profile-entry');

      await element(by.id('submit-registration-button')).tap();

      // Step 4: Verify landed on dashboard
      await waitFor(element(by.id('dashboard-screen')))
        .toBeVisible()
        .withTimeout(15000);

      await takeScreenshot('04-dashboard');

      // Verify user name is displayed
      await expect(element(by.text(/Test User/i))).toBeVisible();
    });

    it('should show validation error for invalid phone', async () => {
      await waitFor(element(by.id('phone-input')))
        .toBeVisible()
        .withTimeout(10000);

      await element(by.id('phone-input')).typeText('123'); // Invalid phone
      await element(by.id('send-otp-button')).tap();

      // Should show error message
      await waitFor(element(by.text(/nomor telepon tidak valid/i)))
        .toBeVisible()
        .withTimeout(5000);

      await takeScreenshot('phone-validation-error');
    });

    it('should show error for invalid OTP', async () => {
      // Send OTP first
      await element(by.id('phone-input')).typeText('081234567890');
      await element(by.id('send-otp-button')).tap();

      await waitFor(element(by.id('otp-screen')))
        .toBeVisible()
        .withTimeout(10000);

      // Enter wrong OTP
      await element(by.id('otp-input')).typeText('000000');
      await element(by.id('verify-otp-button')).tap();

      // Should show error
      await waitFor(element(by.text(/kode otp tidak valid/i)))
        .toBeVisible()
        .withTimeout(5000);

      await takeScreenshot('otp-validation-error');
    });
  });

  describe('Existing User Login', () => {
    it('should login existing user successfully', async () => {
      // Assume user is already registered
      await waitFor(element(by.id('phone-input')))
        .toBeVisible()
        .withTimeout(10000);

      await element(by.id('phone-input')).typeText('081234567890');
      await element(by.id('send-otp-button')).tap();

      await waitFor(element(by.id('otp-screen')))
        .toBeVisible()
        .withTimeout(10000);

      await element(by.id('otp-input')).typeText('123456');
      await element(by.id('verify-otp-button')).tap();

      // Should go directly to dashboard (no registration screen)
      await waitFor(element(by.id('dashboard-screen')))
        .toBeVisible()
        .withTimeout(15000);

      await takeScreenshot('existing-user-dashboard');
    });

    it('should allow resending OTP', async () => {
      await element(by.id('phone-input')).typeText('081234567890');
      await element(by.id('send-otp-button')).tap();

      await waitFor(element(by.id('otp-screen')))
        .toBeVisible()
        .withTimeout(10000);

      // Wait for resend button to be enabled (usually after countdown)
      await waitFor(element(by.id('resend-otp-button')))
        .toBeVisible()
        .withTimeout(60000);

      await element(by.id('resend-otp-button')).tap();

      // Should show success message
      await waitFor(element(by.text(/kode otp telah dikirim/i)))
        .toBeVisible()
        .withTimeout(5000);

      await takeScreenshot('otp-resent');
    });
  });

  describe('Logout Flow', () => {
    beforeEach(async () => {
      // Login first
      await loginUser('081234567890');
    });

    it('should logout user successfully', async () => {
      // Navigate to profile
      await element(by.id('profile-tab')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Scroll to logout button
      await element(by.id('profile-scroll-view')).scrollTo('bottom');
      await takeScreenshot('profile-screen');

      // Tap logout
      await element(by.id('logout-button')).tap();

      // Confirm logout
      await waitFor(element(by.text(/yakin ingin keluar/i)))
        .toBeVisible()
        .withTimeout(3000);

      await element(by.text('Ya, Keluar')).tap();

      // Should return to login screen
      await waitFor(element(by.id('phone-input')))
        .toBeVisible()
        .withTimeout(10000);

      await takeScreenshot('logged-out');
    });

    it('should cancel logout when clicking cancel', async () => {
      await element(by.id('profile-tab')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('profile-scroll-view')).scrollTo('bottom');
      await element(by.id('logout-button')).tap();

      // Click cancel
      await waitFor(element(by.text('Batal')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.text('Batal')).tap();

      // Should stay on profile screen
      await expect(element(by.id('profile-screen'))).toBeVisible();
    });
  });

  describe('Session Persistence', () => {
    it('should maintain session after app restart', async () => {
      // Login
      await loginUser('081234567890');

      // Verify on dashboard
      await expect(element(by.id('dashboard-screen'))).toBeVisible();

      // Restart app
      await device.terminateApp();
      await device.launchApp({ newInstance: false });

      // Should still be logged in
      await waitFor(element(by.id('dashboard-screen')))
        .toBeVisible()
        .withTimeout(10000);

      await takeScreenshot('session-persisted');
    });
  });
});
