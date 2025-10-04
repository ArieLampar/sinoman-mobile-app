import { Session } from '@supabase/supabase-js';
import { SESSION } from '@utils/constants';
import { logger } from '@utils/logger';
import { User } from '@types';
import * as secureSessionManager from './secureSessionManager';

/**
 * Save session to SecureStore (uses secure session manager)
 * @param session - Supabase session to save
 */
export async function saveSession(session: Session): Promise<void> {
  return secureSessionManager.saveSession(session);
}

/**
 * Get stored session from SecureStore (uses secure session manager)
 * @returns Stored session or null
 */
export async function getStoredSession(): Promise<Session | null> {
  return secureSessionManager.getStoredSession();
}

/**
 * Clear session from SecureStore (uses secure session manager)
 */
export async function clearSession(): Promise<void> {
  return secureSessionManager.clearSession();
}

/**
 * Check if session is valid (not expired)
 * @param session - Session to validate
 * @returns True if session is valid
 */
export function isSessionValid(session: Session | null): boolean {
  return secureSessionManager.isSessionValid(session);
}

/**
 * Save user data to SecureStore (uses secure session manager)
 * @param user - User data to save
 */
export async function saveUserData(user: User): Promise<void> {
  return secureSessionManager.saveUserData(user);
}

/**
 * Get stored user data from SecureStore (uses secure session manager)
 * @returns Stored user data or null
 */
export async function getStoredUserData(): Promise<User | null> {
  return secureSessionManager.getStoredUserData();
}

/**
 * Save biometric enabled preference to SecureStore
 * @param enabled - True if biometric is enabled
 */
export async function saveBiometricPreference(enabled: boolean): Promise<void> {
  return secureSessionManager.saveBiometricPreference(enabled);
}

/**
 * Get biometric enabled preference from SecureStore
 * @returns True if biometric is enabled
 */
export async function getBiometricPreference(): Promise<boolean> {
  return secureSessionManager.getBiometricPreference();
}

/**
 * Update last activity timestamp in SecureStore
 */
export async function updateLastActivity(): Promise<void> {
  return secureSessionManager.updateLastActivity();
}

/**
 * Get last activity timestamp from SecureStore
 * @returns Timestamp in milliseconds or null
 */
export async function getLastActivity(): Promise<number | null> {
  return secureSessionManager.getLastActivity();
}

/**
 * Check if session should be terminated due to inactivity
 * @returns True if session should be terminated
 */
export async function shouldTerminateSession(): Promise<boolean> {
  return secureSessionManager.shouldTerminateSession();
}

/**
 * Migrate data from AsyncStorage to SecureStore
 * Should be called on app start
 * @returns Success boolean
 */
export async function migrateFromAsyncStorage(): Promise<boolean> {
  return secureSessionManager.migrateFromAsyncStorage();
}