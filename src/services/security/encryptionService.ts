/**
 * Encryption Service
 * Provides AES-256-GCM encryption, HMAC generation and cryptographic key generation
 */

import * as Crypto from 'expo-crypto';
import { logger } from '@utils/logger';
import { SECURITY } from '@utils/constants';

// Import crypto polyfill for AES encryption and HMAC
import { createCipheriv, createDecipheriv, randomBytes, createHmac } from 'react-native-quick-crypto';

/**
 * Generate HMAC-SHA256 signature
 * Uses proper HMAC-SHA256 algorithm with cryptographic secret key
 * @param message - Message to sign
 * @param secret - Hex-encoded secret key for HMAC
 * @returns Hex-encoded HMAC signature
 */
export function generateHMAC(message: string, secret: string): string {
  try {
    // Convert hex secret to Buffer
    const secretBuffer = Buffer.from(secret, 'hex');

    // Create HMAC-SHA256
    const hmac = createHmac('sha256', secretBuffer);
    hmac.update(message, 'utf8');

    // Return hex-encoded signature
    return hmac.digest('hex');
  } catch (error: any) {
    logger.error('HMAC generation error:', error);
    throw error;
  }
}

/**
 * Generate cryptographically secure random salt
 * @returns 256-bit hex-encoded salt
 */
export async function generateSalt(): Promise<string> {
  try {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error: any) {
    logger.error('Salt generation error:', error);
    throw error;
  }
}

/**
 * Generate encryption key
 * @returns 256-bit hex-encoded encryption key
 */
export async function generateEncryptionKey(): Promise<string> {
  try {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error: any) {
    logger.error('Encryption key generation error:', error);
    throw error;
  }
}

/**
 * Generate nonce for request signing
 * @returns 128-bit hex-encoded nonce
 */
export async function generateNonce(): Promise<string> {
  try {
    const randomBytesArray = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytesArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error: any) {
    logger.error('Nonce generation error:', error);
    throw error;
  }
}

/**
 * Encrypted data structure
 */
interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string; // Base64 encoded initialization vector
  authTag: string; // Base64 encoded authentication tag
}

/**
 * Encrypt data using AES-256-GCM
 * @param plaintext - Data to encrypt
 * @param key - 256-bit hex-encoded encryption key
 * @returns Encrypted data with IV and auth tag
 */
export function encryptAES256GCM(plaintext: string, key: string): EncryptedData {
  try {
    // Convert hex key to Buffer
    const keyBuffer = Buffer.from(key, 'hex');

    // Generate random IV (12 bytes recommended for GCM)
    const iv = randomBytes(12);

    // Create cipher
    const cipher = createCipheriv('aes-256-gcm', keyBuffer, iv);

    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Return encrypted data with metadata
    return {
      ciphertext: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  } catch (error: any) {
    logger.error('AES-256-GCM encryption error:', error);
    throw error;
  }
}

/**
 * Decrypt data using AES-256-GCM
 * @param encryptedData - Encrypted data with IV and auth tag
 * @param key - 256-bit hex-encoded encryption key
 * @returns Decrypted plaintext
 */
export function decryptAES256GCM(encryptedData: EncryptedData, key: string): string {
  try {
    // Convert hex key to Buffer
    const keyBuffer = Buffer.from(key, 'hex');

    // Convert encrypted data from base64
    const ciphertext = Buffer.from(encryptedData.ciphertext, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');

    // Create decipher
    const decipher = createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error: any) {
    logger.error('AES-256-GCM decryption error:', error);
    throw error;
  }
}

/**
 * Encrypt JSON object using AES-256-GCM
 * @param data - Object to encrypt
 * @param key - 256-bit hex-encoded encryption key
 * @returns Encrypted data string (JSON serialized)
 */
export function encryptJSON(data: any, key: string): string {
  const plaintext = JSON.stringify(data);
  const encrypted = encryptAES256GCM(plaintext, key);
  return JSON.stringify(encrypted);
}

/**
 * Decrypt JSON object using AES-256-GCM
 * @param encryptedString - Encrypted data string (JSON serialized)
 * @param key - 256-bit hex-encoded encryption key
 * @returns Decrypted object
 */
export function decryptJSON<T = any>(encryptedString: string, key: string): T {
  const encryptedData = JSON.parse(encryptedString) as EncryptedData;
  const plaintext = decryptAES256GCM(encryptedData, key);
  return JSON.parse(plaintext) as T;
}
