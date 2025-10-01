/**
 * Logger Utility
 * Provides sanitized logging to prevent sensitive data leaks
 */

import { sanitizeString, sanitizeObject, sanitizeError } from '@services/security/dataSanitizer';
import { captureError, addBreadcrumb } from '@services/monitoring';
import { ErrorSeverity } from '@types';

interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  breadcrumb: (message: string, category: string, data?: Record<string, any>) => void;
}

/**
 * Determine if log level should be output
 */
const shouldLog = (level: 'debug' | 'info' | 'warn' | 'error'): boolean => {
  // In production, only log warnings and errors
  if (!__DEV__) {
    return level === 'warn' || level === 'error';
  }
  // In development, log everything
  return true;
};

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

/**
 * Sanitize log arguments to remove sensitive data
 */
const sanitizeArgs = (args: any[]): any[] => {
  // Skip sanitization in development for easier debugging
  if (__DEV__) {
    return args;
  }

  // Sanitize each argument in production
  return args.map(arg => {
    if (typeof arg === 'string') {
      return sanitizeString(arg);
    }
    if (arg instanceof Error) {
      return sanitizeError(arg);
    }
    if (typeof arg === 'object') {
      return sanitizeObject(arg);
    }
    return arg;
  });
};

/**
 * Secure logger with automatic data sanitization
 */
export const logger: Logger = {
  debug: (message: string, ...args: any[]): void => {
    if (!shouldLog('debug')) return;

    console.log(
      formatMessage('DEBUG', sanitizeString(message)),
      ...sanitizeArgs(args)
    );
  },

  info: (message: string, ...args: any[]): void => {
    if (!shouldLog('info')) return;

    console.info(
      formatMessage('INFO', sanitizeString(message)),
      ...sanitizeArgs(args)
    );
  },

  warn: (message: string, ...args: any[]): void => {
    if (!shouldLog('warn')) return;

    console.warn(
      formatMessage('WARN', sanitizeString(message)),
      ...sanitizeArgs(args)
    );
  },

  error: (message: string, ...args: any[]): void => {
    if (!shouldLog('error')) return;

    const sanitizedArgs = args.map(arg =>
      arg instanceof Error ? sanitizeError(arg) : sanitizeObject(arg)
    );

    console.error(
      formatMessage('ERROR', sanitizeString(message)),
      ...sanitizedArgs
    );

    // Send to Sentry in production
    if (!__DEV__) {
      const errorObj = args.find(arg => arg instanceof Error);
      if (errorObj) {
        captureError(errorObj, {
          screen: 'unknown',
          action: message,
          timestamp: new Date().toISOString(),
        }, ErrorSeverity.ERROR);
      }
    }
  },

  breadcrumb: (message: string, category: string, data?: Record<string, any>): void => {
    addBreadcrumb(message, category, data);
    if (__DEV__) {
      logger.debug(`[BREADCRUMB] [${category}] ${message}`, data);
    }
  },
};