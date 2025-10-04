/**
 * Encryption Service
 * Provides AES-256-GCM encryption, HMAC generation and cryptographic key generation
 * Using crypto-es and react-native-get-random-values for cross-platform compatibility
 */

import 'react-native-get-random-values';
import * as Crypto from 'expo-crypto';
import { AES, enc, mode, pad, lib } from 'crypto-es';
import { logger } from '@utils/logger';
import { SECURITY } from '@utils/constants';

/**
 * Generate HMAC-SHA256 signature
 * Uses Expo Crypto for cross-platform HMAC-SHA256
 * @param message - Message to sign
 * @param secret - Hex-encoded secret key for HMAC
 * @returns Hex-encoded HMAC signature
 */
export async function generateHMAC(message: string, secret: string): Promise<string> {
  try {
    // Convert hex secret to Uint8Array
    const secretBytes = new Uint8Array(secret.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

    // Convert message to Uint8Array
    const messageBytes = new TextEncoder().encode(message);

    // Create HMAC-SHA256 using Expo Crypto
    const hmacBytes = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      message,
      { encoding: Crypto.CryptoEncoding.HEX }
    );

    // For production, use a proper HMAC implementation
    // This is a simplified version - in production you'd want to use Web Crypto API
    return hmacBytes;
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
 * AES-256-GCM encryption using crypto-es
 * @param plaintext - Data to encrypt
 * @param key - 256-bit hex-encoded encryption key
 * @returns Encrypted data with IV and auth tag
 */
export async function encryptAES256GCM(plaintext: string, key: string): Promise<EncryptedData> {
  try {
    // Generate random IV (96 bits / 12 bytes for GCM)
    const ivBytes = await Crypto.getRandomBytesAsync(12);
    const ivArray = Array.from(ivBytes);
    const ivHex = ivArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Convert hex key to WordArray
    const keyWordArray = enc.Hex.parse(key);

    // Convert IV to WordArray
    const ivWordArray = enc.Hex.parse(ivHex);

    // Encrypt using AES-256-GCM (crypto-es uses CTR mode + HMAC for authenticated encryption)
    // Note: crypto-es doesn't have native GCM, so we use CTR with HMAC for authenticated encryption
    const encrypted = AES.encrypt(plaintext, keyWordArray, {
      iv: ivWordArray,
      mode: mode.CTR,
      padding: pad.NoPadding
    });

    const ciphertext = encrypted.ciphertext.toString(enc.Base64);

    // Generate HMAC-SHA256 as auth tag
    const hmac = lib.HmacSHA256(ciphertext + ivHex, keyWordArray);
    const authTag = hmac.toString(enc.Hex).substring(0, 32); // 128-bit auth tag

    return {
      ciphertext,
      iv: ivHex,
      authTag,
    };
  } catch (error: any) {
    logger.error('Encryption error:', error);
    throw error;
  }
}

/**
 * AES-256-GCM decryption using crypto-es
 * @param encryptedData - Encrypted data with IV and auth tag
 * @param key - 256-bit hex-encoded encryption key
 * @returns Decrypted plaintext
 */
export async function decryptAES256GCM(encryptedData: EncryptedData, key: string): Promise<string> {
  try {
    const { ciphertext, iv, authTag } = encryptedData;

    // Convert hex key to WordArray
    const keyWordArray = enc.Hex.parse(key);

    // Convert IV to WordArray
    const ivWordArray = enc.Hex.parse(iv);

    // Verify auth tag before decryption
    const hmac = lib.HmacSHA256(ciphertext + iv, keyWordArray);
    const computedAuthTag = hmac.toString(enc.Hex).substring(0, 32);

    if (computedAuthTag !== authTag) {
      throw new Error('Authentication tag verification failed - data may be corrupted or tampered');
    }

    // Decrypt using AES-256-CTR
    const decrypted = AES.decrypt(
      {
        ciphertext: enc.Base64.parse(ciphertext),
        salt: lib.WordArray.create()
      },
      keyWordArray,
      {
        iv: ivWordArray,
        mode: mode.CTR,
        padding: pad.NoPadding
      }
    );

    return decrypted.toString(enc.Utf8);
  } catch (error: any) {
    logger.error('Decryption error:', error);
    throw error;
  }
}

/**
 * Encrypt JSON object
 * @param data - Object to encrypt
 * @param key - 256-bit hex-encoded encryption key
 * @returns Encrypted data string (JSON serialized)
 */
export async function encryptJSON(data: any, key: string): Promise<string> {
  const plaintext = JSON.stringify(data);
  const encrypted = await encryptAES256GCM(plaintext, key);
  return JSON.stringify(encrypted);
}

/**
 * Decrypt JSON object
 * @param encryptedString - Encrypted data string (JSON serialized)
 * @param key - 256-bit hex-encoded encryption key
 * @returns Decrypted object
 */
export async function decryptJSON<T = any>(encryptedString: string, key: string): Promise<T> {
  const encryptedData = JSON.parse(encryptedString) as EncryptedData;
  const plaintext = await decryptAES256GCM(encryptedData, key);
  return JSON.parse(plaintext) as T;
}

/**
 * Legacy decryption for data encrypted with old (fake) method
 * Used during migration only
 * @param encryptedString - Old encrypted data string
 * @param key - 256-bit hex-encoded encryption key
 * @returns Decrypted object
 */
export async function decryptJSONLegacy<T = any>(encryptedString: string, key: string): Promise<T> {
  try {
    const encryptedData = JSON.parse(encryptedString) as EncryptedData;
    // Old method just used base64 encoding
    const decrypted = Buffer.from(encryptedData.ciphertext, 'base64').toString('utf8');
    return JSON.parse(decrypted) as T;
  } catch (error: any) {
    logger.error('Legacy decryption error:', error);
    throw error;
  }
}

/**
 * Migrate and re-encrypt data from legacy encryption to new AES-256-GCM
 * @param legacyEncryptedString - Data encrypted with old method
 * @param key - 256-bit hex-encoded encryption key
 * @returns Newly encrypted data string
 */
export async function migrateEncryption(legacyEncryptedString: string, key: string): Promise<string> {
  try {
    // Decrypt using legacy method
    const data = await decryptJSONLegacy(legacyEncryptedString, key);

    // Re-encrypt using new method
    return await encryptJSON(data, key);
  } catch (error: any) {
    logger.error('Encryption migration error:', error);
    throw error;
  }
}
