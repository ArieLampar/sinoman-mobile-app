/**
 * Firebase Analytics & Performance Service
 * Handles user analytics tracking and performance monitoring
 */

import analytics from '@react-native-firebase/analytics';
import perf from '@react-native-firebase/perf';
import { sanitizeObject } from '@services/security/dataSanitizer';
import type { UserProperties } from '@types';

/**
 * Initialize Firebase Analytics and Performance monitoring
 */
export async function initializeFirebase(): Promise<void> {
  try {
    // Enable analytics collection
    await analytics().setAnalyticsCollectionEnabled(true);

    // Enable performance monitoring
    await perf().setPerformanceCollectionEnabled(true);

    if (__DEV__) {
      console.log('[Firebase] Analytics and Performance initialized');
    }
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
  }
}

/**
 * Log a custom analytics event
 * @param eventName - Name of the event
 * @param params - Event parameters (will be sanitized)
 */
export async function logEvent(
  eventName: string,
  params?: Record<string, any>
): Promise<void> {
  try {
    const sanitized = params ? sanitizeObject(params) : undefined;
    await analytics().logEvent(eventName, sanitized);

    if (__DEV__) {
      console.log(`[Firebase Analytics] Event: ${eventName}`, sanitized);
    }
  } catch (error) {
    console.error(`[Firebase Analytics] Failed to log event: ${eventName}`, error);
  }
}

/**
 * Log a screen view event
 * @param screenName - Name of the screen
 */
export async function logScreenView(screenName: string): Promise<void> {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });

    if (__DEV__) {
      console.log(`[Firebase Analytics] Screen view: ${screenName}`);
    }
  } catch (error) {
    console.error(`[Firebase Analytics] Failed to log screen view: ${screenName}`, error);
  }
}

/**
 * Set user properties for analytics
 * @param properties - User properties to set
 */
export async function setUserProperties(
  properties: Partial<UserProperties>
): Promise<void> {
  try {
    const sanitized = sanitizeObject(properties);

    // Set user ID if provided
    if (properties.userId) {
      await analytics().setUserId(properties.userId);
    }

    // Set other user properties
    for (const [key, value] of Object.entries(sanitized)) {
      if (key !== 'userId') {
        await analytics().setUserProperty(key, String(value));
      }
    }

    if (__DEV__) {
      console.log('[Firebase Analytics] User properties set:', sanitized);
    }
  } catch (error) {
    console.error('[Firebase Analytics] Failed to set user properties:', error);
  }
}

/**
 * Start a performance trace
 * @param traceName - Name of the trace
 * @returns Trace object to be stopped later
 */
export async function startTrace(traceName: string): Promise<any> {
  try {
    const trace = await perf().startTrace(traceName);

    if (__DEV__) {
      console.log(`[Firebase Performance] Trace started: ${traceName}`);
    }

    return trace;
  } catch (error) {
    console.error(`[Firebase Performance] Failed to start trace: ${traceName}`, error);
    return null;
  }
}

/**
 * Stop a performance trace
 * @param trace - Trace object returned by startTrace
 * @param metrics - Custom metrics to attach
 * @param attributes - Custom attributes to attach
 */
export async function stopTrace(
  trace: any,
  metrics?: Record<string, number>,
  attributes?: Record<string, string>
): Promise<void> {
  if (!trace) return;

  try {
    // Add custom metrics
    if (metrics) {
      for (const [key, value] of Object.entries(metrics)) {
        trace.putMetric(key, value);
      }
    }

    // Add custom attributes
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        trace.putAttribute(key, value);
      }
    }

    await trace.stop();

    if (__DEV__) {
      console.log(`[Firebase Performance] Trace stopped`, { metrics, attributes });
    }
  } catch (error) {
    console.error('[Firebase Performance] Failed to stop trace:', error);
  }
}

/**
 * Standard analytics event names
 * Use these constants for consistency across the app
 */
export const AnalyticsEvents = {
  // Authentication
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  REGISTER_SUCCESS: 'register_success',
  REGISTER_FAILED: 'register_failed',

  // Financial
  TOP_UP_INITIATED: 'top_up_initiated',
  TOP_UP_SUCCESS: 'top_up_success',
  TOP_UP_FAILED: 'top_up_failed',
  QR_PAYMENT_SUCCESS: 'qr_payment_success',
  QR_PAYMENT_FAILED: 'qr_payment_failed',
  TRANSFER_SUCCESS: 'transfer_success',
  TRANSFER_FAILED: 'transfer_failed',

  // Marketplace
  PRODUCT_VIEWED: 'product_viewed',
  PRODUCT_ADDED_TO_CART: 'product_added_to_cart',
  ORDER_PLACED: 'order_placed',
  ORDER_COMPLETED: 'order_completed',

  // Health & Fitness
  STEP_GOAL_SET: 'step_goal_set',
  STEP_GOAL_ACHIEVED: 'step_goal_achieved',
  CHALLENGE_JOINED: 'challenge_joined',
  CHALLENGE_COMPLETED: 'challenge_completed',

  // App Events
  APP_OPEN: 'app_open',
  APP_BACKGROUND: 'app_background',
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_OPENED: 'notification_opened',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  NETWORK_ERROR: 'network_error',
} as const;

/**
 * Standard performance trace names
 */
export const PerformanceTraces = {
  APP_START: 'app_start',
  LOGIN_FLOW: 'login_flow',
  TOP_UP_TRANSACTION: 'top_up_transaction',
  QR_SCAN: 'qr_scan',
  PRODUCT_LOAD: 'product_load',
  ORDER_CHECKOUT: 'order_checkout',
  API_REQUEST: 'api_request',
} as const;
