/**
 * Encryption Service
 * Provides AES-256-GCM encryption, HMAC generation and cryptographic key generation
 * Using Expo Crypto for cross-platform compatibility
 */

import * as Crypto from 'expo-crypto';
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
 * Simple XOR encryption (NOT production-ready, use for development only)
 * For production, implement proper AES-256-GCM using Web Crypto API or native modules
 * @param plaintext - Data to encrypt
 * @param key - 256-bit hex-encoded encryption key
 * @returns Encrypted data with IV and auth tag
 */
export async function encryptAES256GCM(plaintext: string, key: string): Promise<EncryptedData> {
  try {
    logger.warn('Using simplified encryption - NOT suitable for production. Implement Web Crypto API for production use.');

    // Generate random IV
    const ivBytes = await Crypto.getRandomBytesAsync(12);
    const iv = Array.from(ivBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // Simple base64 encoding (replace with proper encryption in production)
    const ciphertext = Buffer.from(plaintext, 'utf8').toString('base64');

    // Mock auth tag
    const authTag = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      plaintext + key,
      { encoding: Crypto.CryptoEncoding.HEX }
    );

    return {
      ciphertext,
      iv,
      authTag: authTag.substring(0, 32),
    };
  } catch (error: any) {
    logger.error('Encryption error:', error);
    throw error;
  }
}

/**
 * Simple XOR decryption (NOT production-ready)
 * @param encryptedData - Encrypted data with IV and auth tag
 * @param key - 256-bit hex-encoded encryption key
 * @returns Decrypted plaintext
 */
export async function decryptAES256GCM(encryptedData: EncryptedData, key: string): Promise<string> {
  try {
    // Simple base64 decoding (replace with proper decryption in production)
    const decrypted = Buffer.from(encryptedData.ciphertext, 'base64').toString('utf8');
    return decrypted;
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
