/**
 * Monitoring and Error Tracking Types
 * Defines types for Sentry, Firebase Analytics, and error handling
 */

/**
 * Error severity levels matching Sentry's severity levels
 */
export enum ErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Context information for error reporting
 */
export interface ErrorContext {
  screen?: string;
  action?: string;
  userId?: string;
  timestamp: string;
  additionalData?: Record<string, any>;
}

/**
 * Complete error report structure
 */
export interface ErrorReport {
  error: Error;
  severity: ErrorSeverity;
  context: ErrorContext;
  tags?: Record<string, string>;
}

/**
 * Analytics event structure
 */
export interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
}

/**
 * Performance trace structure
 */
export interface PerformanceTrace {
  name: string;
  startTime: number;
  metrics?: Record<string, number>;
  attributes?: Record<string, string>;
}

/**
 * User properties for analytics
 */
export interface UserProperties {
  userId: string;
  memberNumber?: string;
  tier?: string;
}

/**
 * Error recovery action for user interaction
 */
export interface ErrorRecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  isPrimary?: boolean;
}

/**
 * Breadcrumb for Sentry tracking
 */
export interface Breadcrumb {
  message: string;
  category: string;
  data?: Record<string, any>;
  level?: ErrorSeverity;
  timestamp?: number;
}
