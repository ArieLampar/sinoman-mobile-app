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

// Spacing System
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

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
    AES_DATA_KEY: 'sinoman_aes_data_encryption_key',
    AES_CART_KEY: 'sinoman_aes_cart_encryption_key',
  } as const,

  // Device security policy
  BLOCK_ON_JAILBREAK: false, // Set true to block jailbroken devices
  BLOCK_ON_ROOT: false, // Set true to block rooted devices
  WARN_ON_COMPROMISED: true, // Show warning modal

  // SSL Certificate Pinning
  // Public key hashes for Supabase API (SHA-256)
  // NOTE: Replace these with actual public key hashes from your Supabase project
  // To get the hashes, use: openssl s_client -servername <domain> -connect <domain>:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
  SSL_PINNING_ENABLED: !__DEV__, // Disable in development for easier testing
  SSL_PUBLIC_KEY_HASHES: [
    // Supabase primary certificate (example - MUST BE REPLACED)
    'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    // Supabase backup certificate (example - MUST BE REPLACED)
    'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
    // Let's Encrypt root CA (common backup)
    'sha256/Y9mvm0exBk1JoQ57f9Vm28jKo5lFm/woKcVxrYxu80o=',
  ] as const,
} as const;

// Monitoring Configuration
export const MONITORING = {
  // Sentry configuration
  SENTRY_ENABLED: !__DEV__,
  SENTRY_TRACES_SAMPLE_RATE: __DEV__ ? 1.0 : 0.1,

  // Retry configuration
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  RETRY_BACKOFF_MULTIPLIER: 2,

  // Firebase configuration
  FIREBASE_ANALYTICS_ENABLED: true,
  FIREBASE_PERFORMANCE_ENABLED: true,

  // Error reporting
  ERROR_REPORT_ENABLED: !__DEV__,
  BREADCRUMB_MAX_SIZE: 50,
} as const;