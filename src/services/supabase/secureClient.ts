/**
 * Secure Supabase Client
 * Wraps Supabase client with HMAC-based request signing and SSL certificate pinning
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addSignatureHeaders, pinnedFetch, validateSSLPinningConfig } from '@services/security';
import { logger } from '@utils/logger';
import 'react-native-url-polyfill/auto';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file and app.config.ts');
}

// Validate SSL pinning configuration on module load
validateSSLPinningConfig();

/**
 * Create Supabase client with request signing and SSL pinning middleware
 */
export const secureClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {},
    fetch: async (url, options = {}) => {
      try {
        // Extract method and body from fetch options
        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body as string) : undefined;

        // Add HMAC signature headers
        const signedHeaders = await addSignatureHeaders(
          options.headers as Record<string, string> || {},
          method,
          url.toString(),
          body
        );

        // Perform SSL-pinned fetch with signed headers
        // This provides dual-layer security:
        // 1. HMAC signatures for request integrity
        // 2. SSL pinning for transport security against MITM
        const response = await pinnedFetch(url.toString(), {
          ...options,
          headers: signedHeaders,
        });

        logger.debug('Secure request sent with SSL pinning', {
          method,
          url: url.toString(),
          pinningEnabled: true
        });
        return response;
      } catch (error: any) {
        logger.error('Secure fetch error:', error);

        // Check if it's an SSL pinning error (critical security issue)
        if (error.message?.includes('SSL certificate')) {
          logger.error('CRITICAL: SSL pinning validation failed!');
          // Do NOT fallback for SSL errors - this could be a MITM attack
          throw error;
        }

        // For other errors, attempt fallback
        logger.warn('Falling back to standard fetch due to non-SSL error');
        return fetch(url, options);
      }
    },
  },
});

/**
 * Export as default for convenience
 */
export default secureClient;
