/**
 * Logging Helper for Edge Functions
 * Provides PII redaction and environment-aware logging
 */

// Get log level from environment
const LOG_LEVEL = Deno.env.get('LOG_LEVEL') || 'info';
const IS_PRODUCTION = Deno.env.get('ENVIRONMENT') === 'production';

// Log levels
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// Map string to log level
const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
  none: LogLevel.NONE,
};

const currentLogLevel = LOG_LEVEL_MAP[LOG_LEVEL.toLowerCase()] || LogLevel.INFO;

/**
 * PII patterns to redact
 */
const PII_PATTERNS = [
  // Phone numbers (Indonesian format)
  { pattern: /(\+?62|0)?8[0-9]{9,12}/g, replacement: '[PHONE]' },
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL]' },
  // Credit card numbers (various formats)
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '[CARD]' },
  // Indonesian ID numbers (NIK - 16 digits)
  { pattern: /\b\d{16}\b/g, replacement: '[NIK]' },
  // OTP codes (6 digits)
  { pattern: /\b\d{6}\b/g, replacement: '[OTP]' },
  // API keys / tokens (long alphanumeric strings)
  { pattern: /\b[A-Za-z0-9]{32,}\b/g, replacement: '[TOKEN]' },
];

/**
 * Redact PII from a string
 * @param text - Text that may contain PII
 * @returns Sanitized text
 */
function redactPII(text: string): string {
  let sanitized = text;

  for (const { pattern, replacement } of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
}

/**
 * Sanitize an object by redacting PII
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return redactPII(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      // Redact known sensitive fields
      if (['password', 'token', 'secret', 'apiKey', 'otp', 'otp_code'].includes(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Format log message
 * @param level - Log level
 * @param message - Log message
 * @param meta - Additional metadata
 * @returns Formatted log string
 */
function formatLog(level: string, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();
  const sanitizedMessage = redactPII(message);
  const sanitizedMeta = meta ? sanitizeObject(meta) : undefined;

  const logEntry = {
    timestamp,
    level,
    message: sanitizedMessage,
    ...(sanitizedMeta && { meta: sanitizedMeta }),
  };

  return JSON.stringify(logEntry);
}

/**
 * Log at DEBUG level
 * @param message - Log message
 * @param meta - Additional metadata
 */
export function debug(message: string, meta?: any): void {
  if (currentLogLevel <= LogLevel.DEBUG && !IS_PRODUCTION) {
    console.log(formatLog('DEBUG', message, meta));
  }
}

/**
 * Log at INFO level
 * @param message - Log message
 * @param meta - Additional metadata
 */
export function info(message: string, meta?: any): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(formatLog('INFO', message, meta));
  }
}

/**
 * Log at WARN level
 * @param message - Log message
 * @param meta - Additional metadata
 */
export function warn(message: string, meta?: any): void {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(formatLog('WARN', message, meta));
  }
}

/**
 * Log at ERROR level
 * @param message - Log message
 * @param meta - Additional metadata
 */
export function error(message: string, meta?: any): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(formatLog('ERROR', message, meta));
  }
}

/**
 * Sanitize phone number for logging
 * @param phone - Phone number
 * @returns Masked phone (e.g., 8123***890)
 */
export function sanitizePhone(phone: string): string {
  if (!phone || phone.length < 8) {
    return '[PHONE]';
  }

  const start = phone.substring(0, 4);
  const end = phone.substring(phone.length - 3);
  return `${start}***${end}`;
}

/**
 * Default export
 */
export default {
  debug,
  info,
  warn,
  error,
  sanitizePhone,
};
