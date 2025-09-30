export const APP_NAME = 'Sinoman Mobile App';
export const APP_VERSION = '1.0.0';
export const APP_BUNDLE_ID = 'id.co.sinoman.mobile';

// API Configuration
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000; // 1 second

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@sinoman:auth_token',
  USER_DATA: '@sinoman:user_data',
  BIOMETRIC_ENABLED: '@sinoman:biometric_enabled',
  OFFLINE_QUEUE: '@sinoman:offline_queue',
} as const;

// Validation Rules
export const VALIDATION = {
  PHONE_REGEX: /^8[0-9]{9,12}$/, // Indonesian phone format without +62
  MIN_TOP_UP_AMOUNT: 10000, // Rp 10,000
  MAX_TOP_UP_AMOUNT: 10000000, // Rp 10,000,000
  OTP_LENGTH: 6,
  OTP_EXPIRY_SECONDS: 300, // 5 minutes
};

// UI Constants
export const UI = {
  BOTTOM_TAB_HEIGHT: 60,
  HEADER_HEIGHT: 56,
  MIN_TOUCH_TARGET: 44, // Accessibility requirement
};

// Session Configuration
export const SESSION = {
  TIMEOUT_MINUTES: 15,
  TOKEN_EXPIRY_HOURS: 1,
};