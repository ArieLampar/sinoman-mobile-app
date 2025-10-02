import { device, element, by, waitFor } from 'detox';

/**
 * E2E Test Setup Helpers
 */

export const loginUser = async (phone: string, otp: string = '123456') => {
  try {
    // Wait for phone input screen
    await waitFor(element(by.id('phone-input')))
      .toBeVisible()
      .withTimeout(10000);

    // Enter phone number
    await element(by.id('phone-input')).typeText(phone);
    await element(by.id('send-otp-button')).tap();

    // Wait for OTP screen
    await waitFor(element(by.id('otp-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Enter OTP
    await element(by.id('otp-input')).typeText(otp);
    await element(by.id('verify-otp-button')).tap();

    // Wait for dashboard or registration
    await waitFor(element(by.id('dashboard-screen')).or(by.id('registration-screen')))
      .toBeVisible()
      .withTimeout(15000);
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Navigate to profile
    await element(by.id('profile-tab')).tap();
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Scroll to logout button
    await element(by.id('profile-scroll-view')).scrollTo('bottom');

    // Tap logout
    await element(by.id('logout-button')).tap();

    // Confirm logout if modal appears
    await waitFor(element(by.text('Keluar')))
      .toBeVisible()
      .withTimeout(2000);
    await element(by.text('Ya, Keluar')).tap();

    // Wait for login screen
    await waitFor(element(by.id('phone-input')))
      .toBeVisible()
      .withTimeout(5000);
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export const skipOnboarding = async () => {
  try {
    const skipButton = element(by.id('skip-onboarding-button'));
    const isVisible = await skipButton.isVisible();

    if (isVisible) {
      await skipButton.tap();
    }
  } catch (error) {
    // Onboarding might not be present, continue
    console.log('No onboarding to skip');
  }
};

export const clearAppData = async () => {
  // Clear device data for fresh start
  await device.uninstallApp();
  await device.installApp();
  await device.launchApp({ newInstance: true });
};

export const takeScreenshot = async (name: string) => {
  try {
    await device.takeScreenshot(name);
  } catch (error) {
    console.warn(`Failed to take screenshot ${name}:`, error);
  }
};

export const waitForElement = async (
  elementMatcher: any,
  timeout: number = 10000
) => {
  await waitFor(element(elementMatcher))
    .toBeVisible()
    .withTimeout(timeout);
};

export const scrollToElement = async (
  scrollViewId: string,
  elementMatcher: any,
  direction: 'up' | 'down' = 'down'
) => {
  await waitFor(element(elementMatcher))
    .toBeVisible()
    .whileElement(by.id(scrollViewId))
    .scroll(200, direction);
};

export const expectElementToBeVisible = async (elementMatcher: any) => {
  await expect(element(elementMatcher)).toBeVisible();
};

export const expectElementToHaveText = async (
  elementMatcher: any,
  text: string
) => {
  await expect(element(elementMatcher)).toHaveText(text);
};
