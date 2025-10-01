/**
 * Offline Queue Service
 * Manages offline transaction queue using MMKV storage
 */

import { MMKV } from 'react-native-mmkv';
import { QueuedTransaction, QRPaymentRequest, SyncResult } from '@types';
import { processQRPayment } from '@services/qr';
import { logger } from '@utils/logger';
import { STORAGE_KEYS } from '@utils/constants';

// Initialize MMKV storage for offline queue
const storage = new MMKV({
  id: 'offline-queue',
  encryptionKey: 'sinoman-offline-queue-key', // Basic encryption
});

/**
 * Get all queued transactions from storage
 * @returns QueuedTransaction[] - Array of queued transactions
 */
export function getQueue(): QueuedTransaction[] {
  try {
    const queueJson = storage.getString(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!queueJson) return [];

    const queue = JSON.parse(queueJson) as QueuedTransaction[];
    logger.info('Offline queue loaded:', queue.length);
    return queue;
  } catch (error) {
    logger.error('Get queue error:', error);
    return [];
  }
}

/**
 * Save queue to storage
 * @param queue - Array of queued transactions to save
 */
function saveQueue(queue: QueuedTransaction[]): void {
  try {
    storage.set(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    logger.info('Offline queue saved:', queue.length);
  } catch (error) {
    logger.error('Save queue error:', error);
  }
}

/**
 * Add transaction to offline queue
 * @param transaction - Transaction data to queue (without id, timestamp, retryCount, status)
 * @returns QueuedTransaction - The queued transaction with generated metadata
 */
export function addToQueue(
  transaction: Omit<QueuedTransaction, 'id' | 'timestamp' | 'retryCount' | 'status'>
): QueuedTransaction {
  const queue = getQueue();

  const queuedTransaction: QueuedTransaction = {
    ...transaction,
    id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
  };

  queue.push(queuedTransaction);
  saveQueue(queue);

  logger.info('Transaction added to offline queue:', queuedTransaction.id);
  return queuedTransaction;
}

/**
 * Remove transaction from queue by ID
 * @param id - Transaction ID to remove
 */
export function removeFromQueue(id: string): void {
  const queue = getQueue();
  const filtered = queue.filter((t) => t.id !== id);
  saveQueue(filtered);
  logger.info('Transaction removed from queue:', id);
}

/**
 * Sync all queued transactions with server
 * @returns Promise<SyncResult> - Result of sync operation
 */
export async function syncQueue(): Promise<SyncResult> {
  let queue = getQueue();

  if (queue.length === 0) {
    return { success: true, syncedCount: 0, failedCount: 0 };
  }

  logger.info('Starting queue sync:', queue.length);

  let syncedCount = 0;
  let failedCount = 0;
  const errors: Array<{ id: string; error: string }> = [];
  const successfulIds: string[] = [];

  // Process each queued transaction
  for (const transaction of queue) {
    try {
      // Update status to syncing
      transaction.status = 'syncing';

      // Attempt to process payment
      const result = await processQRPayment({
        qrData: transaction.qrData,
        amount: transaction.amount,
        savingsType: transaction.savingsType,
        notes: transaction.notes,
      });

      if (result.success) {
        // Track successful transaction for removal
        successfulIds.push(transaction.id);
        syncedCount++;
        logger.info('Transaction synced successfully:', transaction.id);
      } else {
        // Mark as failed
        transaction.status = 'failed';
        transaction.retryCount++;
        transaction.error = result.error;
        failedCount++;
        errors.push({ id: transaction.id, error: result.error || 'Unknown error' });
        logger.error('Transaction sync failed:', transaction.id, result.error);
      }
    } catch (error: any) {
      transaction.status = 'failed';
      transaction.retryCount++;
      transaction.error = error.message;
      failedCount++;
      errors.push({ id: transaction.id, error: error.message });
      logger.error('Transaction sync exception:', transaction.id, error);
    }
  }

  // Remove successful transactions from queue
  queue = queue.filter((t) => !successfulIds.includes(t.id));

  // Save updated queue (only failed transactions remain)
  saveQueue(queue);

  logger.info('Queue sync completed:', { syncedCount, failedCount });

  return {
    success: failedCount === 0,
    syncedCount,
    failedCount,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Clear all transactions from queue
 */
export function clearQueue(): void {
  storage.delete(STORAGE_KEYS.OFFLINE_QUEUE);
  logger.info('Offline queue cleared');
}

/**
 * Get count of queued transactions
 * @returns number - Count of transactions in queue
 */
export function getQueueCount(): number {
  return getQueue().length;
}
