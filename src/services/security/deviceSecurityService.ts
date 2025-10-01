/**
 * Device Security Service
 * Detects jailbroken/rooted devices and security threats using jail-monkey
 */

import JailMonkey from 'jail-monkey';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { DeviceSecurityStatus } from '@types';
import { logger } from '@utils/logger';
import { SECURITY } from '@utils/constants';

/**
 * Perform comprehensive device security check
 * @returns Device security status with warnings
 */
export async function checkDeviceSecurity(): Promise<DeviceSecurityStatus> {
  try {
    const warnings: string[] = [];

    // Check for jailbreak (iOS) or root (Android)
    const isJailbroken = JailMonkey.isJailBroken();
    if (isJailbroken) {
      if (Platform.OS === 'ios') {
        warnings.push('Device is jailbroken');
      } else {
        warnings.push('Device is rooted');
      }
    }

    // Platform-specific checks
    const isRooted = Platform.OS === 'android' && JailMonkey.isJailBroken();

    // Check if running on emulator
    const isEmulator = !Device.isDevice;
    if (isEmulator && !__DEV__) {
      warnings.push('Running on emulator');
    }

    // Check for hooking frameworks (Frida, Cydia Substrate, etc.)
    const hasHooks = JailMonkey.hookDetected();
    if (hasHooks) {
      warnings.push('Hooking framework detected');
    }

    // Overall compromise status
    const isCompromised = isJailbroken || isRooted || hasHooks;

    if (isCompromised) {
      logger.warn('Device security compromised:', warnings);
    }

    return {
      isJailbroken: Platform.OS === 'ios' && isJailbroken,
      isRooted: Platform.OS === 'android' && isRooted,
      isEmulator,
      hasHooks,
      isCompromised,
      warnings,
    };
  } catch (error: any) {
    logger.error('Device security check error:', error);
    return {
      isJailbroken: false,
      isRooted: false,
      isEmulator: false,
      hasHooks: false,
      isCompromised: false,
      warnings: ['Security check failed'],
    };
  }
}

/**
 * Determine if app should be blocked based on security status
 * @param status - Device security status
 * @returns True if app should be blocked
 */
export function shouldBlockApp(status: DeviceSecurityStatus): boolean {
  // Check configuration flags
  if (status.isJailbroken && SECURITY.BLOCK_ON_JAILBREAK) {
    return true;
  }

  if (status.isRooted && SECURITY.BLOCK_ON_ROOT) {
    return true;
  }

  // Never block in development
  if (__DEV__) {
    return false;
  }

  return false;
}

/**
 * Get localized security warning message
 * @param status - Device security status
 * @returns Indonesian warning message
 */
export function getSecurityWarningMessage(status: DeviceSecurityStatus): string {
  if (status.isJailbroken) {
    return 'Perangkat Anda terdeteksi jailbroken. Aplikasi mungkin tidak aman dan data Anda berisiko.';
  }

  if (status.isRooted) {
    return 'Perangkat Anda terdeteksi rooted. Aplikasi mungkin tidak aman dan data Anda berisiko.';
  }

  if (status.hasHooks) {
    return 'Terdeteksi aplikasi berbahaya yang dapat mencuri data Anda.';
  }

  return 'Peringatan keamanan terdeteksi pada perangkat Anda.';
}

/**
 * Get security warning title
 * @param status - Device security status
 * @returns Indonesian title
 */
export function getSecurityWarningTitle(status: DeviceSecurityStatus): string {
  if (status.isJailbroken) {
    return 'Perangkat Jailbroken';
  }

  if (status.isRooted) {
    return 'Perangkat Rooted';
  }

  if (status.hasHooks) {
    return 'Ancaman Keamanan';
  }

  return 'Peringatan Keamanan';
}
