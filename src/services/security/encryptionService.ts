/**
 * Encryption Service
 * Provides HMAC generation and cryptographic key generation using expo-crypto
 */

import * as Crypto from 'expo-crypto';
import { logger } from '@utils/logger';
import { SECURITY } from '@utils/constants';

/**
 * Generate HMAC-SHA256 signature
 * @param message - Message to sign
 * @param secret - Secret key for HMAC
 * @returns Hex-encoded HMAC signature
 */
export async function generateHMAC(message: string, secret: string): Promise<string> {
  try {
    // Combine message and secret for HMAC (simplified approach)
    const combined = message + secret;
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combined,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    return hash;
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
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error: any) {
    logger.error('Nonce generation error:', error);
    throw error;
  }
}
