/**
 * Centralized API Client
 * Provides consistent retry, timeout, and security for all API calls
 */

import { supabase } from './supabase/client';
import { withRetry, withRetryAndTimeout } from '@utils/retryHelper';
import { API_TIMEOUT, API_RETRY_ATTEMPTS } from '@utils/constants';
import { generateRequestSignature } from './security/apiSecurityService';
import { logger } from '@utils/logger';

/**
 * Options for API requests
 */
interface ApiRequestOptions {
  timeout?: number;
  retryAttempts?: number;
  withSignature?: boolean;
  abortSignal?: AbortSignal;
  headers?: Record<string, string>;
}

/**
 * Response from Edge Function invocation
 */
interface EdgeFunctionResponse<T = any> {
  data: T | null;
  error: Error | null;
}

/**
 * Invoke a Supabase Edge Function with retry and timeout
 * @param functionName - Name of the Edge Function
 * @param payload - Request payload
 * @param options - Request options
 * @returns Promise with response data
 */
export async function invokeEdgeFunction<TRequest = any, TResponse = any>(
  functionName: string,
  payload: TRequest,
  options: ApiRequestOptions = {}
): Promise<EdgeFunctionResponse<TResponse>> {
  const {
    timeout = API_TIMEOUT,
    retryAttempts = API_RETRY_ATTEMPTS,
    withSignature = true,
    abortSignal,
    headers: customHeaders = {},
  } = options;

  try {
    const result = await withRetryAndTimeout(
      async () => {
        // Generate request signature if enabled
        let headers = { ...customHeaders };

        if (withSignature) {
          try {
            const signature = await generateRequestSignature(JSON.stringify(payload));
            headers = {
              ...headers,
              ...signature,
            };
          } catch (signatureError) {
            logger.warn('Failed to generate request signature:', signatureError);
            // Continue without signature in case of error
          }
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const signal = abortSignal || controller.signal;

        // Set timeout
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, timeout);

        try {
          const { data, error } = await supabase.functions.invoke<TResponse>(functionName, {
            body: payload,
            headers,
          });

          clearTimeout(timeoutId);

          if (error) {
            throw error;
          }

          return { data, error: null };
        } catch (error: any) {
          clearTimeout(timeoutId);

          // Check if aborted
          if (signal.aborted) {
            throw new Error(`Request to ${functionName} timed out after ${timeout}ms`);
          }

          throw error;
        }
      },
      timeout,
      {
        maxAttempts: retryAttempts,
        shouldRetry: (error: Error) => {
          // Retry on network errors, timeouts, and 5xx errors
          const message = error.message.toLowerCase();
          return (
            message.includes('network') ||
            message.includes('timeout') ||
            message.includes('fetch') ||
            message.includes('500') ||
            message.includes('502') ||
            message.includes('503') ||
            message.includes('504')
          );
        },
      }
    );

    return result;
  } catch (error: any) {
    logger.error(`Edge function ${functionName} error:`, error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Query Supabase table with retry and timeout
 * @param tableName - Name of the table
 * @param queryBuilder - Function that builds the query
 * @param options - Request options
 * @returns Promise with query results
 */
export async function queryTable<T = any>(
  tableName: string,
  queryBuilder: (query: any) => any,
  options: ApiRequestOptions = {}
): Promise<{ data: T[] | null; error: Error | null }> {
  const {
    timeout = API_TIMEOUT,
    retryAttempts = API_RETRY_ATTEMPTS,
    abortSignal,
  } = options;

  try {
    const result = await withRetryAndTimeout(
      async () => {
        // Create abort controller for timeout
        const controller = new AbortController();
        const signal = abortSignal || controller.signal;

        // Set timeout
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, timeout);

        try {
          const query = supabase.from(tableName);
          const builtQuery = queryBuilder(query);
          const { data, error } = await builtQuery;

          clearTimeout(timeoutId);

          if (error) {
            throw error;
          }

          return { data, error: null };
        } catch (error: any) {
          clearTimeout(timeoutId);

          // Check if aborted
          if (signal.aborted) {
            throw new Error(`Query to ${tableName} timed out after ${timeout}ms`);
          }

          throw error;
        }
      },
      timeout,
      {
        maxAttempts: retryAttempts,
        shouldRetry: (error: Error) => {
          const message = error.message.toLowerCase();
          return (
            message.includes('network') ||
            message.includes('timeout') ||
            message.includes('fetch')
          );
        },
      }
    );

    return result;
  } catch (error: any) {
    logger.error(`Table query ${tableName} error:`, error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Execute Supabase RPC with retry and timeout
 * @param functionName - Name of the RPC function
 * @param params - RPC parameters
 * @param options - Request options
 * @returns Promise with RPC results
 */
export async function executeRpc<TParams = any, TResponse = any>(
  functionName: string,
  params: TParams,
  options: ApiRequestOptions = {}
): Promise<{ data: TResponse | null; error: Error | null }> {
  const {
    timeout = API_TIMEOUT,
    retryAttempts = API_RETRY_ATTEMPTS,
    abortSignal,
  } = options;

  try {
    const result = await withRetryAndTimeout(
      async () => {
        // Create abort controller for timeout
        const controller = new AbortController();
        const signal = abortSignal || controller.signal;

        // Set timeout
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, timeout);

        try {
          const { data, error } = await supabase.rpc<TResponse>(functionName, params);

          clearTimeout(timeoutId);

          if (error) {
            throw error;
          }

          return { data, error: null };
        } catch (error: any) {
          clearTimeout(timeoutId);

          // Check if aborted
          if (signal.aborted) {
            throw new Error(`RPC ${functionName} timed out after ${timeout}ms`);
          }

          throw error;
        }
      },
      timeout,
      {
        maxAttempts: retryAttempts,
        shouldRetry: (error: Error) => {
          const message = error.message.toLowerCase();
          return (
            message.includes('network') ||
            message.includes('timeout') ||
            message.includes('fetch')
          );
        },
      }
    );

    return result;
  } catch (error: any) {
    logger.error(`RPC ${functionName} error:`, error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Create an AbortController with timeout
 * @param timeoutMs - Timeout in milliseconds
 * @returns AbortController and cleanup function
 */
export function createAbortController(timeoutMs: number): {
  controller: AbortController;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return {
    controller,
    cleanup: () => clearTimeout(timeoutId),
  };
}
