import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { STORAGE_KEYS, SESSION } from '@utils/constants';
import { logger } from '@utils/logger';
import { User } from '@types';

/**
 * Save session to AsyncStorage
 * @param session - Supabase session to save
 */
export async function saveSession(session: Session): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(session));
    logger.info('Session saved to storage');
  } catch (error: any) {
    logger.error('Save session error:', error);
    throw error;
  }
}

/**
 * Get stored session from AsyncStorage
 * @returns Stored session or null
 */
export async function getStoredSession(): Promise<Session | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!stored) {
      logger.info('No stored session found');
      return null;
    }

    const session = JSON.parse(stored) as Session;
    logger.info('Session retrieved from storage');
    return session;
  } catch (error: any) {
    logger.error('Get stored session error:', error);
    return null;
  }
}

/**
 * Clear session from AsyncStorage
 */
export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.BIOMETRIC_ENABLED,
    ]);
    logger.info('Session cleared from storage');
  } catch (error: any) {
    logger.error('Clear session error:', error);
    throw error;
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
 * Save user data to AsyncStorage
 * @param user - User data to save
 */
export async function saveUserData(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    logger.info('User data saved to storage');
  } catch (error: any) {
    logger.error('Save user data error:', error);
    throw error;
  }
}

/**
 * Get stored user data from AsyncStorage
 * @returns Stored user data or null
 */
export async function getStoredUserData(): Promise<User | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as User;
  } catch (error: any) {
    logger.error('Get stored user data error:', error);
    return null;
  }
}

/**
 * Save biometric enabled preference
 * @param enabled - True if biometric is enabled
 */
export async function saveBiometricPreference(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, JSON.stringify(enabled));
    logger.info('Biometric preference saved:', enabled);
  } catch (error: any) {
    logger.error('Save biometric preference error:', error);
    throw error;
  }
}

/**
 * Get biometric enabled preference
 * @returns True if biometric is enabled
 */
export async function getBiometricPreference(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    if (!stored) {
      return false;
    }

    return JSON.parse(stored) as boolean;
  } catch (error: any) {
    logger.error('Get biometric preference error:', error);
    return false;
  }
}

/**
 * Update last activity timestamp
 */
export async function updateLastActivity(): Promise<void> {
  try {
    const timestamp = Date.now().toString();
    await AsyncStorage.setItem('@sinoman:last_activity', timestamp);
  } catch (error: any) {
    logger.error('Update last activity error:', error);
  }
}

/**
 * Get last activity timestamp
 * @returns Timestamp in milliseconds or null
 */
export async function getLastActivity(): Promise<number | null> {
  try {
    const stored = await AsyncStorage.getItem('@sinoman:last_activity');
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
    const inactiveMinutes = (now - lastActivity) / 1000 / 60;

    return inactiveMinutes >= SESSION.TIMEOUT_MINUTES;
  } catch (error: any) {
    logger.error('Should terminate session check error:', error);
    return false;
  }
}