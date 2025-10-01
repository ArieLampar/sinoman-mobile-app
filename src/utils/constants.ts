export const APP_NAME = 'Sinoman Mobile App';
export const APP_VERSION = '1.0.0';
export const APP_BUNDLE_ID = 'id.sinomanapp.mobile';

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
  CART: '@sinoman:cart',
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

// Security Configuration
export const SECURITY = {
  // Encryption algorithms
  ENCRYPTION_ALGORITHM: 'AES-256-GCM' as const,
  SIGNATURE_ALGORITHM: 'HMAC-SHA256' as const,

  // Request signing headers
  SIGNATURE_HEADER: 'X-Sinoman-Signature',
  TIMESTAMP_HEADER: 'X-Sinoman-Timestamp',
  NONCE_HEADER: 'X-Sinoman-Nonce',

  // Security constraints
  MAX_TIMESTAMP_SKEW: 300, // 5 minutes in seconds

  // Secure storage keys (encrypted via Keychain/Keystore)
  SECURE_KEYS: {
    AUTH_TOKEN: 'sinoman_secure_auth_token',
    REFRESH_TOKEN: 'sinoman_secure_refresh_token',
    USER_DATA: 'sinoman_secure_user_data',
    HMAC_SECRET: 'sinoman_secure_hmac_secret',
    MMKV_OFFLINE_KEY: 'sinoman_mmkv_offline_queue_key',
    MMKV_CART_KEY: 'sinoman_mmkv_cart_key',
  } as const,

  // Device security policy
  BLOCK_ON_JAILBREAK: false, // Set true to block jailbroken devices
  BLOCK_ON_ROOT: false, // Set true to block rooted devices
  WARN_ON_COMPROMISED: true, // Show warning modal
} as const;