/**
 * Sentry Error Tracking Service
 * Handles error reporting, breadcrumbs, and user context for Sentry
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { sanitizeObject, sanitizeError } from '@services/security/dataSanitizer';
import type { ErrorContext, ErrorSeverity } from '@types';

/**
 * Initialize Sentry SDK
 * Should be called once at app startup
 */
export function initializeSentry(): void {
  const sentryDsn = Constants.expoConfig?.extra?.sentryDsn;

  // Skip initialization if no DSN configured
  if (!sentryDsn) {
    if (__DEV__) {
      console.log('[Sentry] No DSN configured, skipping initialization');
    }
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: Constants.expoConfig?.extra?.sentryEnvironment || 'development',
    release: `sinoman-mobile-app@${Constants.expoConfig?.extra?.sentryRelease || '1.0.0'}`,

    // Session tracking
    enableAutoSessionTracking: true,

    // Stack traces
    attachStacktrace: true,

    // Performance monitoring
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,

    // Data sanitization before sending to Sentry
    beforeSend: (event) => {
      // Sanitize user data
      if (event.user) {
        event.user = sanitizeObject(event.user) as any;
      }

      // Sanitize extra context
      if (event.extra) {
        event.extra = sanitizeObject(event.extra);
      }

      // Don't send events in development
      if (__DEV__) {
        console.log('[Sentry] Event captured (not sent in dev):', event);
        return null;
      }

      return event;
    },
  });

  if (__DEV__) {
    console.log('[Sentry] Initialized successfully');
  }
}

/**
 * Capture an error and send to Sentry
 * @param error - Error object to capture
 * @param context - Additional context information
 * @param severity - Severity level (defaults to ERROR)
 */
export function captureError(
  error: Error,
  context?: ErrorContext,
  severity: ErrorSeverity = 'error' as ErrorSeverity
): void {
  // Add context as Sentry context
  if (context) {
    Sentry.setContext('error_context', sanitizeObject(context));
  }

  // Capture the exception
  Sentry.captureException(error, {
    level: severity as Sentry.SeverityLevel,
    tags: {
      screen: context?.screen || 'unknown',
      action: context?.action || 'unknown',
    },
  });

  if (__DEV__) {
    console.log(`[Sentry] Error captured: ${error.message}`, { context, severity });
  }
}

/**
 * Add a breadcrumb for tracking user actions
 * @param message - Breadcrumb message
 * @param category - Category (e.g., 'navigation', 'user-action', 'api')
 * @param data - Additional data
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data: data ? sanitizeObject(data) : undefined,
    timestamp: Date.now() / 1000,
  });

  if (__DEV__) {
    console.log(`[Sentry] Breadcrumb: [${category}] ${message}`, data);
  }
}

/**
 * Set user context for Sentry
 * @param userId - User ID
 * @param userData - Additional user data
 */
export function setUser(userId: string, userData?: Record<string, any>): void {
  const sanitizedData = userData ? sanitizeObject(userData) : {};

  Sentry.setUser({
    id: userId,
    ...sanitizedData,
  });

  if (__DEV__) {
    console.log(`[Sentry] User set: ${userId}`, sanitizedData);
  }
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUser(): void {
  Sentry.setUser(null);

  if (__DEV__) {
    console.log('[Sentry] User cleared');
  }
}

/**
 * Add custom tags to Sentry events
 * @param tags - Key-value pairs of tags
 */
export function setTags(tags: Record<string, string>): void {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });

  if (__DEV__) {
    console.log('[Sentry] Tags set:', tags);
  }
}

/**
 * Add custom context to Sentry events
 * @param key - Context key
 * @param data - Context data
 */
export function setContext(key: string, data: Record<string, any>): void {
  Sentry.setContext(key, sanitizeObject(data));

  if (__DEV__) {
    console.log(`[Sentry] Context set: ${key}`, data);
  }
}
