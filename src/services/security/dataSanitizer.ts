/**
 * Data Sanitizer Service
 * Removes sensitive information from logs and error messages
 */

import { SanitizationRule } from '@types';

/**
 * Sanitization rules for sensitive data
 */
const SANITIZATION_RULES: SanitizationRule[] = [
  // Indonesian phone numbers (+62 or 0 followed by 8-11 digits)
  {
    pattern: /\b(\+?62|0)8[0-9]{8,11}\b/g,
    replacement: '***PHONE***',
    description: 'Phone number',
  },
  // Email addresses
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '***EMAIL***',
    description: 'Email address',
  },
  // JWT tokens (Bearer format)
  {
    pattern: /Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/gi,
    replacement: 'Bearer ***TOKEN***',
    description: 'JWT token',
  },
  // Generic authorization header
  {
    pattern: /Authorization:\s*[^\s,]+/gi,
    replacement: 'Authorization: ***REDACTED***',
    description: 'Authorization header',
  },
  // 6-digit OTP codes
  {
    pattern: /\b[0-9]{6}\b/g,
    replacement: '***OTP***',
    description: 'OTP code',
  },
  // Large numbers (potential amounts/balances)
  {
    pattern: /\b[0-9]{5,}\b/g,
    replacement: '***AMOUNT***',
    description: 'Numeric amount',
  },
  // Credit card numbers (13-19 digits with optional spaces/dashes)
  {
    pattern: /\b[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{3,7}\b/g,
    replacement: '***CARD***',
    description: 'Credit card',
  },
];

/**
 * Sanitize a string by replacing sensitive patterns
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return input;
  }

  let sanitized = input;
  for (const rule of SANITIZATION_RULES) {
    sanitized = sanitized.replace(rule.pattern, rule.replacement);
  }

  return sanitized;
}

/**
 * Recursively sanitize an object
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject(obj: any): any {
  // Handle null/undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle strings
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  // Handle primitives
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  // Handle objects
  if (typeof obj === 'object') {
    const sanitized: any = {};

    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      // Redact sensitive keys entirely
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('key') ||
        lowerKey.includes('auth') ||
        lowerKey.includes('pin') ||
        lowerKey.includes('otp')
      ) {
        sanitized[key] = '***REDACTED***';
      } else {
        // Recursively sanitize value
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }

    return sanitized;
  }

  return obj;
}

/**
 * Sanitize error objects
 * @param error - Error to sanitize
 * @returns Sanitized error object
 */
export function sanitizeError(error: Error | any): any {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: sanitizeString(error.message),
      stack: __DEV__ ? error.stack : undefined,
    };
  }

  return sanitizeObject(error);
}

/**
 * Sanitize array of arguments (for logging)
 * @param args - Arguments array
 * @returns Sanitized arguments
 */
export function sanitizeArgs(args: any[]): any[] {
  if (!Array.isArray(args)) {
    return args;
  }

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
}

/**
 * Check if a string contains sensitive data
 * @param input - String to check
 * @returns True if sensitive data detected
 */
export function hasSensitiveData(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  for (const rule of SANITIZATION_RULES) {
    if (rule.pattern.test(input)) {
      return true;
    }
  }

  return false;
}
