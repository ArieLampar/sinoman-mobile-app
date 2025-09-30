import * as LocalAuthentication from 'expo-local-authentication';
import { logger } from '@utils/logger';

/**
 * Check if biometric authentication is available on device
 * @returns True if biometric hardware exists and is enrolled
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      logger.info('Biometric: Hardware not available');
      return false;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      logger.info('Biometric: Not enrolled');
      return false;
    }

    logger.info('Biometric: Available and enrolled');
    return true;
  } catch (error: any) {
    logger.error('Biometric availability check error:', error);
    return false;
  }
}

/**
 * Get supported biometric types
 * @returns Array of supported authentication types
 */
export async function getSupportedBiometricTypes(): Promise<
  LocalAuthentication.AuthenticationType[]
> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    logger.info('Supported biometric types:', types);
    return types;
  } catch (error: any) {
    logger.error('Get biometric types error:', error);
    return [];
  }
}

/**
 * Get human-readable biometric type name
 * @param type - Authentication type
 * @returns Human-readable name
 */
export function getBiometricTypeName(type: LocalAuthentication.AuthenticationType): string {
  switch (type) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return 'Sidik Jari';
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
      return 'Face ID';
    case LocalAuthentication.AuthenticationType.IRIS:
      return 'Iris';
    default:
      return 'Biometric';
  }
}

/**
 * Authenticate user with biometric
 * @param promptMessage - Custom prompt message
 * @returns Response with success status and optional error
 */
export async function authenticateWithBiometric(
  promptMessage: string = 'Login ke Sinoman'
): Promise<{
  success: boolean;
  error?: string;
  biometricType?: string;
}> {
  try {
    // Check availability first
    const available = await isBiometricAvailable();
    if (!available) {
      return {
        success: false,
        error: 'Biometric tidak tersedia di perangkat ini',
      };
    }

    // Get biometric type for better messaging
    const types = await getSupportedBiometricTypes();
    const biometricType = types.length > 0 ? getBiometricTypeName(types[0]) : 'Biometric';

    logger.info('Authenticating with biometric:', biometricType);

    // Authenticate
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Batal',
      fallbackLabel: 'Gunakan Nomor Telepon',
      disableDeviceFallback: false,
    });

    if (result.success) {
      logger.info('Biometric authentication successful');
      return {
        success: true,
        biometricType,
      };
    }

    logger.warn('Biometric authentication failed:', result.error);
    return {
      success: false,
      error: result.error === 'user_cancel'
        ? 'Autentikasi dibatalkan'
        : 'Autentikasi gagal',
      biometricType,
    };
  } catch (error: any) {
    logger.error('Biometric authentication exception:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat autentikasi biometric',
    };
  }
}

/**
 * Check if device has biometric capability (even if not enrolled)
 * @returns True if device has biometric hardware
 */
export async function hasBiometricHardware(): Promise<boolean> {
  try {
    return await LocalAuthentication.hasHardwareAsync();
  } catch (error: any) {
    logger.error('Has biometric hardware check error:', error);
    return false;
  }
}