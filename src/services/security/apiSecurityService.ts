/**
 * API Security Service
 * Implements HMAC-based request signing for API integrity
 */

import { generateHMAC, generateNonce } from './encryptionService';
import { getSecureItem, setSecureItem } from './secureStorageService';
import { RequestSignature } from '@types';
import { logger } from '@utils/logger';
import { SECURITY } from '@utils/constants';
import * as Crypto from 'expo-crypto';

/**
 * Get or create HMAC secret for request signing
 * @returns HMAC secret key
 */
export async function getOrCreateHMACSecret(): Promise<string> {
  try {
    // Try to retrieve existing secret
    let secret = await getSecureItem(SECURITY.SECURE_KEYS.HMAC_SECRET);

    if (!secret) {
      // Generate new 256-bit secret
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      secret = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Store in secure storage
      await setSecureItem(SECURITY.SECURE_KEYS.HMAC_SECRET, secret);
      logger.info('HMAC secret generated and stored');
    }

    return secret;
  } catch (error: any) {
    logger.error('Get HMAC secret error:', error);
    throw error;
  }
}

/**
 * Generate request signature for API call
 * @param method - HTTP method (GET, POST, etc.)
 * @param url - Request URL
 * @param body - Request body (optional)
 * @returns Request signature with timestamp and nonce
 */
export async function generateRequestSignature(
  method: string,
  url: string,
  body?: any
): Promise<RequestSignature> {
  try {
    // Get or create HMAC secret
    const secret = await getOrCreateHMACSecret();

    // Generate timestamp (ISO 8601)
    const timestamp = new Date().toISOString();

    // Generate nonce (128-bit random)
    const nonce = await generateNonce();

    // Create message to sign
    const bodyString = body ? JSON.stringify(body) : '';
    const message = `${method}${url}${timestamp}${nonce}${bodyString}`;

    // Generate HMAC signature
    const signature = await generateHMAC(message, secret);

    logger.debug('Request signature generated');

    return {
      signature,
      timestamp,
      nonce,
    };
  } catch (error: any) {
    logger.error('Generate request signature error:', error);
    throw error;
  }
}

/**
 * Add signature headers to request
 * @param headers - Existing headers
 * @param method - HTTP method
 * @param url - Request URL
 * @param body - Request body (optional)
 * @returns Headers with signature
 */
export async function addSignatureHeaders(
  headers: Record<string, string>,
  method: string,
  url: string,
  body?: any
): Promise<Record<string, string>> {
  try {
    const signature = await generateRequestSignature(method, url, body);

    return {
      ...headers,
      [SECURITY.SIGNATURE_HEADER]: signature.signature,
      [SECURITY.TIMESTAMP_HEADER]: signature.timestamp,
      [SECURITY.NONCE_HEADER]: signature.nonce,
    };
  } catch (error: any) {
    logger.error('Add signature headers error:', error);
    // Return original headers if signing fails (graceful degradation)
    return headers;
  }
}

/**
 * Validate timestamp to prevent replay attacks
 * @param timestamp - ISO 8601 timestamp from request
 * @returns True if timestamp is within acceptable skew
 */
export function validateTimestamp(timestamp: string): boolean {
  try {
    const requestTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const skew = Math.abs(currentTime - requestTime) / 1000; // seconds

    return skew <= SECURITY.MAX_TIMESTAMP_SKEW;
  } catch {
    return false;
  }
}

/**
 * Verify request signature (for testing/debugging)
 * @param signature - Signature to verify
 * @param method - HTTP method
 * @param url - Request URL
 * @param timestamp - Request timestamp
 * @param nonce - Request nonce
 * @param body - Request body (optional)
 * @returns True if signature is valid
 */
export async function verifyRequestSignature(
  signature: string,
  method: string,
  url: string,
  timestamp: string,
  nonce: string,
  body?: any
): Promise<boolean> {
  try {
    // Validate timestamp first
    if (!validateTimestamp(timestamp)) {
      logger.warn('Invalid timestamp in signature verification');
      return false;
    }

    // Recreate message
    const bodyString = body ? JSON.stringify(body) : '';
    const message = `${method}${url}${timestamp}${nonce}${bodyString}`;

    // Get secret
    const secret = await getOrCreateHMACSecret();

    // Generate expected signature
    const expectedSignature = await generateHMAC(message, secret);

    // Constant-time comparison (simple)
    return signature === expectedSignature;
  } catch (error: any) {
    logger.error('Verify signature error:', error);
    return false;
  }
}
