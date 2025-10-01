/**
 * Retry Helper Utility
 * Provides automatic retry logic with exponential backoff
 */

import { MONITORING } from './constants';
import { shouldRetry as shouldRetryError, getRetryDelay } from '@services/monitoring/errorMessages';
import { logger } from './logger';

/**
 * Options for retry behavior
 */
interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Execute an async operation with automatic retry logic
 * @param operation - Async function to execute
 * @param options - Retry configuration options
 * @returns Promise resolving to the operation result
 * @throws The last error if all retry attempts fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = MONITORING.MAX_RETRY_ATTEMPTS,
    delayMs = MONITORING.RETRY_DELAY_MS,
    backoffMultiplier = MONITORING.RETRY_BACKOFF_MULTIPLIER,
    shouldRetry = shouldRetryError,
    onRetry,
  } = options;

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Attempt the operation
      const result = await operation();

      // Success - return the result
      if (attempt > 1) {
        logger.info(`Operation succeeded on attempt ${attempt}`);
      }

      return result;
    } catch (error: any) {
      lastError = error;

      // Check if we should retry
      const isLastAttempt = attempt >= maxAttempts;
      const canRetry = shouldRetry(error);

      if (isLastAttempt || !canRetry) {
        // No more retries - throw the error
        if (attempt > 1) {
          logger.error(`Operation failed after ${attempt} attempts`, error);
        }
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = getRetryDelay(attempt, delayMs);

      logger.warn(
        `Operation failed on attempt ${attempt}, retrying in ${delay}ms`,
        { error: error.message }
      );

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Execute an operation with a single retry on failure
 * @param operation - Async function to execute
 * @param shouldRetry - Optional function to determine if retry should occur
 * @returns Promise resolving to the operation result
 */
export async function withSingleRetry<T>(
  operation: () => Promise<T>,
  shouldRetry?: (error: Error) => boolean
): Promise<T> {
  return withRetry(operation, {
    maxAttempts: 2,
    shouldRetry,
  });
}

/**
 * Execute multiple operations in parallel with retry logic
 * @param operations - Array of async functions to execute
 * @param options - Retry configuration options
 * @returns Promise resolving to array of results
 */
export async function withRetryParallel<T>(
  operations: (() => Promise<T>)[],
  options: RetryOptions = {}
): Promise<T[]> {
  const promises = operations.map((operation) => withRetry(operation, options));
  return Promise.all(promises);
}

/**
 * Execute an operation with a timeout and retry logic
 * @param operation - Async function to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param options - Retry configuration options
 * @returns Promise resolving to the operation result
 */
export async function withRetryAndTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  options: RetryOptions = {}
): Promise<T> {
  return withRetry(async () => {
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    // Race between operation and timeout
    return Promise.race([operation(), timeoutPromise]);
  }, options);
}
