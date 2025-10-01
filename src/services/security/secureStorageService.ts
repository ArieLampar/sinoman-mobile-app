/**
 * Secure Storage Service
 * Wrapper around expo-secure-store for encrypted Keychain/Keystore access
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { logger } from '@utils/logger';
import { SecureStorageOptions } from '@types';

/**
 * Default options for secure storage
 */
const DEFAULT_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: 'id.sinomanapp.mobile',
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

/**
 * Store encrypted item in Keychain/Keystore
 * @param key - Storage key
 * @param value - String value to store
 * @param options - Optional storage options
 * @returns Success boolean
 */
export async function setSecureItem(
  key: string,
  value: string,
  options?: SecureStorageOptions
): Promise<boolean> {
  try {
    const storeOptions = { ...DEFAULT_OPTIONS, ...options };
    await SecureStore.setItemAsync(key, value, storeOptions);
    logger.info('Secure item stored:', key);
    return true;
  } catch (error: any) {
    logger.error('Set secure item error:', key, error.message);
    return false;
  }
}

/**
 * Retrieve encrypted item from Keychain/Keystore
 * @param key - Storage key
 * @param options - Optional storage options
 * @returns Decrypted string value or null
 */
export async function getSecureItem(
  key: string,
  options?: SecureStorageOptions
): Promise<string | null> {
  try {
    const storeOptions = { ...DEFAULT_OPTIONS, ...options };
    return await SecureStore.getItemAsync(key, storeOptions);
  } catch (error: any) {
    logger.error('Get secure item error:', key, error.message);
    return null;
  }
}

/**
 * Store JSON object in encrypted storage
 * @param key - Storage key
 * @param value - Object to serialize and store
 * @param options - Optional storage options
 * @returns Success boolean
 */
export async function setSecureJSON<T = any>(
  key: string,
  value: T,
  options?: SecureStorageOptions
): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(value);
    return await setSecureItem(key, jsonString, options);
  } catch (error: any) {
    logger.error('Set secure JSON error:', key, error.message);
    return false;
  }
}

/**
 * Retrieve and parse JSON from encrypted storage
 * @param key - Storage key
 * @param options - Optional storage options
 * @returns Parsed object or null
 */
export async function getSecureJSON<T = any>(
  key: string,
  options?: SecureStorageOptions
): Promise<T | null> {
  try {
    const jsonString = await getSecureItem(key, options);
    return jsonString ? JSON.parse(jsonString) : null;
  } catch (error: any) {
    logger.error('Get secure JSON error:', key, error.message);
    return null;
  }
}

/**
 * Delete item from encrypted storage
 * @param key - Storage key
 * @param options - Optional storage options
 * @returns Success boolean
 */
export async function deleteSecureItem(
  key: string,
  options?: SecureStorageOptions
): Promise<boolean> {
  try {
    const storeOptions = { ...DEFAULT_OPTIONS, ...options };
    await SecureStore.deleteItemAsync(key, storeOptions);
    logger.info('Secure item deleted:', key);
    return true;
  } catch (error: any) {
    logger.error('Delete secure item error:', key, error.message);
    return false;
  }
}

/**
 * Check if secure storage is available on this device
 * @returns Availability boolean
 */
export async function isSecureStoreAvailable(): Promise<boolean> {
  try {
    // expo-secure-store is available on iOS and Android
    return Platform.OS === 'ios' || Platform.OS === 'android';
  } catch {
    return false;
  }
}
