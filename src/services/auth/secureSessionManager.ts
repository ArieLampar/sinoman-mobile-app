/**
 * Secure Session Manager
 * Manages authentication sessions with encrypted storage and migration from AsyncStorage
 */

import { Session } from '@supabase/supabase-js';
import { User } from '@types';
import { setSecureJSON, getSecureJSON, deleteSecureItem, setSecureItem } from '@services/security';
import { logger } from '@utils/logger';
import { SECURITY } from '@utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save session to secure storage
 * @param session - Supabase session object
 */
export async function saveSession(session: Session): Promise<void> {
  try {
    // Store complete session object
    await setSecureJSON(SECURITY.SECURE_KEYS.AUTH_TOKEN, session);

    // Store refresh token separately for easy access
    if (session.refresh_token) {
      await setSecureItem(SECURITY.SECURE_KEYS.REFRESH_TOKEN, session.refresh_token);
    }

    logger.info('Session saved to secure storage');
  } catch (error: any) {
    logger.error('Save session error:', error);
    throw error;
  }
}

/**
 * Retrieve session from secure storage
 * @returns Stored session or null
 */
export async function getStoredSession(): Promise<Session | null> {
  try {
    return await getSecureJSON<Session>(SECURITY.SECURE_KEYS.AUTH_TOKEN);
  } catch (error: any) {
    logger.error('Get stored session error:', error);
    return null;
  }
}

/**
 * Clear all session data from secure storage
 */
export async function clearSession(): Promise<void> {
  try {
    await Promise.all([
      deleteSecureItem(SECURITY.SECURE_KEYS.AUTH_TOKEN),
      deleteSecureItem(SECURITY.SECURE_KEYS.REFRESH_TOKEN),
      deleteSecureItem(SECURITY.SECURE_KEYS.USER_DATA),
    ]);

    logger.info('Session cleared from secure storage');
  } catch (error: any) {
    logger.error('Clear session error:', error);
    throw error;
  }
}

/**
 * Save user data to secure storage
 * @param user - User object
 */
export async function saveUserData(user: User): Promise<void> {
  try {
    await setSecureJSON(SECURITY.SECURE_KEYS.USER_DATA, user);
    logger.info('User data saved to secure storage');
  } catch (error: any) {
    logger.error('Save user data error:', error);
    throw error;
  }
}

/**
 * Retrieve user data from secure storage
 * @returns Stored user data or null
 */
export async function getStoredUserData(): Promise<User | null> {
  try {
    return await getSecureJSON<User>(SECURITY.SECURE_KEYS.USER_DATA);
  } catch (error: any) {
    logger.error('Get stored user data error:', error);
    return null;
  }
}

/**
 * Migrate data from AsyncStorage to SecureStore
 * This ensures backward compatibility and secure upgrade path
 * @returns Success boolean
 */
export async function migrateFromAsyncStorage(): Promise<boolean> {
  try {
    logger.info('Starting migration from AsyncStorage to SecureStore');

    // Check if migration already done
    const migrationFlag = await AsyncStorage.getItem('@sinoman:migrated_to_secure');
    if (migrationFlag === 'true') {
      logger.info('Migration already completed');
      return true;
    }

    // Migrate session/auth token
    const oldSession = await AsyncStorage.getItem('@sinoman:auth_token');
    if (oldSession) {
      try {
        const sessionObj = JSON.parse(oldSession);
        await saveSession(sessionObj);
        await AsyncStorage.removeItem('@sinoman:auth_token');
        logger.info('Auth token migrated');
      } catch (error: any) {
        logger.error('Auth token migration error:', error);
      }
    }

    // Migrate user data
    const oldUserData = await AsyncStorage.getItem('@sinoman:user_data');
    if (oldUserData) {
      try {
        const userData = JSON.parse(oldUserData);
        await saveUserData(userData);
        await AsyncStorage.removeItem('@sinoman:user_data');
        logger.info('User data migrated');
      } catch (error: any) {
        logger.error('User data migration error:', error);
      }
    }

    // Migrate biometric preference
    const oldBiometric = await AsyncStorage.getItem('@sinoman:biometric_enabled');
    if (oldBiometric) {
      try {
        await setSecureItem('sinoman_biometric_enabled', oldBiometric);
        await AsyncStorage.removeItem('@sinoman:biometric_enabled');
        logger.info('Biometric preference migrated');
      } catch (error: any) {
        logger.error('Biometric migration error:', error);
      }
    }

    // Mark migration as complete
    await AsyncStorage.setItem('@sinoman:migrated_to_secure', 'true');
    logger.info('Migration completed successfully');

    return true;
  } catch (error: any) {
    logger.error('Migration from AsyncStorage error:', error);
    return false;
  }
}

/**
 * Check if user has active session
 * @returns True if session exists and is valid
 */
export async function hasActiveSession(): Promise<boolean> {
  try {
    const session = await getStoredSession();
    if (!session) return false;

    // Check if session is expired
    if (session.expires_at) {
      const expiresAt = session.expires_at * 1000; // Convert to milliseconds
      return Date.now() < expiresAt;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Check if session is valid (not expired)
 * @param session - Session to validate
 * @returns True if session is valid
 */
export function isSessionValid(session: Session | null): boolean {
  if (!session || !session.expires_at) {
    return false;
  }

  const expiresAt = new Date(session.expires_at * 1000); // Convert seconds to milliseconds
  const now = new Date();
  const isValid = expiresAt > now;

  if (!isValid) {
    logger.warn('Session expired');
  }

  return isValid;
}

/**
 * Save biometric enabled preference to secure storage
 * @param enabled - True if biometric is enabled
 */
export async function saveBiometricPreference(enabled: boolean): Promise<void> {
  try {
    await setSecureItem('sinoman_biometric_enabled', JSON.stringify(enabled));
    logger.info('Biometric preference saved:', enabled);
  } catch (error: any) {
    logger.error('Save biometric preference error:', error);
    throw error;
  }
}

/**
 * Get biometric enabled preference from secure storage
 * @returns True if biometric is enabled
 */
export async function getBiometricPreference(): Promise<boolean> {
  try {
    const stored = await getSecureJSON<boolean>('sinoman_biometric_enabled');
    return stored ?? false;
  } catch (error: any) {
    logger.error('Get biometric preference error:', error);
    return false;
  }
}

/**
 * Update last activity timestamp in secure storage
 */
export async function updateLastActivity(): Promise<void> {
  try {
    const timestamp = Date.now().toString();
    await setSecureItem('sinoman_last_activity', timestamp);
  } catch (error: any) {
    logger.error('Update last activity error:', error);
  }
}

/**
 * Get last activity timestamp from secure storage
 * @returns Timestamp in milliseconds or null
 */
export async function getLastActivity(): Promise<number | null> {
  try {
    const stored = await getSecureJSON<string>('sinoman_last_activity');
    if (!stored) {
      return null;
    }

    return parseInt(stored, 10);
  } catch (error: any) {
    logger.error('Get last activity error:', error);
    return null;
  }
}

/**
 * Check if session should be terminated due to inactivity
 * @returns True if session should be terminated
 */
export async function shouldTerminateSession(): Promise<boolean> {
  try {
    const lastActivity = await getLastActivity();
    if (!lastActivity) {
      return false;
    }

    const now = Date.now();
    const SESSION_TIMEOUT_MINUTES = 30; // From constants
    const inactiveMinutes = (now - lastActivity) / 1000 / 60;

    return inactiveMinutes >= SESSION_TIMEOUT_MINUTES;
  } catch (error: any) {
    logger.error('Should terminate session check error:', error);
    return false;
  }
}
