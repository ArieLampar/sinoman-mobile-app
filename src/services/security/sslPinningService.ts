/**
 * SSL Pinning Service
 * Implements certificate pinning for enhanced security against MITM attacks
 */

import { fetch as sslFetch } from 'react-native-ssl-pinning';
import { logger } from '@utils/logger';
import { SECURITY } from '@utils/constants';

/**
 * SSL Pinning Options
 */
interface SSLPinningOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutInterval?: number;
  sslPinning?: {
    certs?: string[];
    disableAllSecurity?: boolean;
  };
  pkPinning?: string[];
}

/**
 * Pinned fetch wrapper with SSL certificate pinning
 * @param url - URL to fetch
 * @param options - Fetch options (compatible with standard fetch)
 * @returns Response object
 */
export async function pinnedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Skip pinning in development or if disabled
  if (!SECURITY.SSL_PINNING_ENABLED) {
    logger.debug('SSL pinning disabled, using standard fetch');
    return fetch(url, options);
  }

  try {
    // Convert standard fetch options to SSL pinning format
    const sslOptions: SSLPinningOptions = {
      method: (options.method || 'GET').toUpperCase(),
      headers: options.headers as Record<string, string> || {},
      body: options.body as string,
      timeoutInterval: 30000, // 30 seconds timeout
      pkPinning: SECURITY.SSL_PUBLIC_KEY_HASHES as unknown as string[], // Public key pinning
    };

    logger.debug('Performing SSL pinned request', { method: sslOptions.method, url });

    // Perform SSL-pinned fetch
    const response = await sslFetch(url, sslOptions);

    // Convert response to standard Response object format
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText || '',
      headers: new Headers(response.headers),
      url: url,
      redirected: false,
      type: 'default' as ResponseType,
      body: null,
      bodyUsed: false,
      clone: () => {
        throw new Error('Response.clone() not supported in pinned fetch');
      },
      arrayBuffer: async () => {
        throw new Error('arrayBuffer() not supported in pinned fetch');
      },
      blob: async () => {
        throw new Error('blob() not supported in pinned fetch');
      },
      formData: async () => {
        throw new Error('formData() not supported in pinned fetch');
      },
      json: async () => {
        if (response.bodyString) {
          return JSON.parse(response.bodyString);
        }
        throw new Error('No response body');
      },
      text: async () => {
        return response.bodyString || '';
      },
    } as Response;
  } catch (error: any) {
    logger.error('SSL pinned fetch error:', error);

    // Check if it's a pinning validation error
    if (error.message?.includes('certificate') || error.message?.includes('SSL')) {
      logger.error('CRITICAL: SSL certificate validation failed - possible MITM attack!');
      throw new Error('SSL certificate validation failed. Connection is not secure.');
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Validate SSL pinning configuration
 * @returns True if SSL pinning is properly configured
 */
export function validateSSLPinningConfig(): boolean {
  if (!SECURITY.SSL_PINNING_ENABLED) {
    logger.warn('SSL pinning is disabled');
    return true; // Not an error if intentionally disabled
  }

  const hashes = SECURITY.SSL_PUBLIC_KEY_HASHES;

  // Check if we have placeholder values
  const hasPlaceholders = hashes.some(hash =>
    hash.includes('AAAAAAA') || hash.includes('BBBBBBB')
  );

  if (hasPlaceholders) {
    logger.error(
      'SSL pinning enabled but using placeholder certificate hashes! ' +
      'Please update SECURITY.SSL_PUBLIC_KEY_HASHES in constants.ts with actual certificate hashes.'
    );
    return false;
  }

  if (hashes.length < 2) {
    logger.warn('SSL pinning has fewer than 2 backup certificates - consider adding more for redundancy');
  }

  logger.info('SSL pinning configuration validated', { hashCount: hashes.length });
  return true;
}

/**
 * Get instructions for obtaining SSL certificate hashes
 * @param domain - Domain to get certificates for (e.g., 'api.supabase.co')
 * @returns Instructions string
 */
export function getSSLHashInstructions(domain: string): string {
  return `
To get SSL certificate public key hashes for ${domain}:

1. Using OpenSSL (Linux/Mac):
   openssl s_client -servername ${domain} -connect ${domain}:443 < /dev/null | \\
   openssl x509 -pubkey -noout | \\
   openssl pkey -pubin -outform der | \\
   openssl dgst -sha256 -binary | \\
   openssl enc -base64

2. Using online tools:
   - Visit: https://www.ssllabs.com/ssltest/analyze.html?d=${domain}
   - Look for "Public Key Pinning" or "Certificate" section
   - Copy the SHA-256 hash of the public key

3. Important:
   - Pin at least 2-3 certificates (primary + backups)
   - Include root CA certificate as backup
   - Update hashes before certificates expire
   - Test thoroughly in development before enabling in production

4. Add the hashes to src/utils/constants.ts:
   SSL_PUBLIC_KEY_HASHES: [
     'sha256/YOUR_PRIMARY_HASH_HERE=',
     'sha256/YOUR_BACKUP_HASH_HERE=',
     'sha256/ROOT_CA_HASH_HERE=',
   ]
  `.trim();
}
