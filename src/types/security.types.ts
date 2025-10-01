/**
 * Security Type Definitions
 * Defines interfaces for encryption, device security, and request signing
 */

/**
 * Result of encryption operation
 */
export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  success: boolean;
  error?: string;
}

/**
 * Device security status from jailbreak/root detection
 */
export interface DeviceSecurityStatus {
  isJailbroken: boolean;
  isRooted: boolean;
  isEmulator: boolean;
  hasHooks: boolean;
  isCompromised: boolean;
  warnings: string[];
}

/**
 * Request signature for HMAC-based API security
 */
export interface RequestSignature {
  signature: string;
  timestamp: string;
  nonce: string;
}

/**
 * Options for secure storage operations
 */
export interface SecureStorageOptions {
  keychainService?: string;
  requireAuthentication?: boolean;
}

/**
 * Data sanitization rule
 */
export interface SanitizationRule {
  pattern: RegExp;
  replacement: string;
  description: string;
}
