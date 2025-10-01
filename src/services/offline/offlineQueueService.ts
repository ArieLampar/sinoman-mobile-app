/**
 * Offline Queue Service
 * Manages offline transaction queue using MMKV storage with dynamic encryption
 */

import { MMKV } from 'react-native-mmkv';
import { QueuedTransaction, QRPaymentRequest, SyncResult } from '@types';
import { processQRPayment } from '@services/qr';
import { logger } from '@utils/logger';
import { STORAGE_KEYS, SECURITY } from '@utils/constants';
import {
  getSecureItem,
  setSecureItem,
  generateEncryptionKey,
  encryptJSON,
  decryptJSON
} from '@services/security';

// Storage instance (will be initialized lazily with dynamic key)
let storage: MMKV | null = null;
let aesEncryptionKey: string | null = null;

/**
 * Get or create encryption key for MMKV storage
 * @returns Encryption key from secure storage
 */
async function getOrCreateEncryptionKey(): Promise<string> {
  try {
    let key = await getSecureItem(SECURITY.SECURE_KEYS.MMKV_OFFLINE_KEY);

    if (!key) {
      // Generate new 256-bit encryption key
      key = await generateEncryptionKey();
      await setSecureItem(SECURITY.SECURE_KEYS.MMKV_OFFLINE_KEY, key);
      logger.info('MMKV offline queue encryption key generated');
    }

    return key;
  } catch (error: any) {
    logger.error('Get MMKV encryption key error:', error);
    throw error;
  }
}

/**
 * Get or create AES-256-GCM encryption key for data encryption
 * @returns AES encryption key from secure storage
 */
async function getOrCreateAESKey(): Promise<string> {
  if (aesEncryptionKey) return aesEncryptionKey;

  try {
    let key = await getSecureItem(SECURITY.SECURE_KEYS.AES_DATA_KEY);

    if (!key) {
      // Generate new 256-bit AES encryption key
      key = await generateEncryptionKey();
      await setSecureItem(SECURITY.SECURE_KEYS.AES_DATA_KEY, key);
      logger.info('AES-256-GCM offline queue encryption key generated');
    }

    aesEncryptionKey = key;
    return key;
  } catch (error: any) {
    logger.error('Get AES encryption key error:', error);
    throw error;
  }
}

/**
 * Get initialized MMKV storage instance
 * @returns MMKV storage instance with encryption
 */
async function getStorage(): Promise<MMKV> {
  if (storage) return storage;

  const encryptionKey = await getOrCreateEncryptionKey();
  storage = new MMKV({
    id: 'offline-queue',
    encryptionKey, // Dynamic encryption key from secure storage
  });

  return storage;
}

/**
 * Get all queued transactions from storage with AES-256-GCM decryption
 * @returns QueuedTransaction[] - Array of queued transactions
 */
export async function getQueue(): Promise<QueuedTransaction[]> {
  try {
    const store = await getStorage();
    const encryptedData = store.getString(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!encryptedData) return [];

    // Decrypt data using AES-256-GCM
    const aesKey = await getOrCreateAESKey();
    const queue = decryptJSON<QueuedTransaction[]>(encryptedData, aesKey);

    logger.info('Offline queue loaded and decrypted:', queue.length);
    return queue;
  } catch (error) {
    logger.error('Get queue error:', error);
    return [];
  }
}

/**
 * Save queue to storage with AES-256-GCM encryption
 * @param queue - Array of queued transactions to save
 */
async function saveQueue(queue: QueuedTransaction[]): Promise<void> {
  try {
    const store = await getStorage();

    // Encrypt data using AES-256-GCM
    const aesKey = await getOrCreateAESKey();
    const encryptedData = encryptJSON(queue, aesKey);

    store.set(STORAGE_KEYS.OFFLINE_QUEUE, encryptedData);
    logger.info('Offline queue encrypted and saved:', queue.length);
  } catch (error) {
    logger.error('Save queue error:', error);
  }
}

/**
 * Add transaction to offline queue
 * @param transaction - Transaction data to queue (without id, timestamp, retryCount, status)
 * @returns QueuedTransaction - The queued transaction with generated metadata
 */
export async function addToQueue(
  transaction: Omit<QueuedTransaction, 'id' | 'timestamp' | 'retryCount' | 'status'>
): Promise<QueuedTransaction> {
  const queue = await getQueue();

  const queuedTransaction: QueuedTransaction = {
    ...transaction,
    id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
  };

  queue.push(queuedTransaction);
  await saveQueue(queue);

  logger.info('Transaction added to offline queue:', queuedTransaction.id);
  return queuedTransaction;
}

/**
 * Remove transaction from queue by ID
 * @param id - Transaction ID to remove
 */
export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter((t) => t.id !== id);
  await saveQueue(filtered);
  logger.info('Transaction removed from queue:', id);
}

/**
 * Sync all queued transactions with server
 * @returns Promise<SyncResult> - Result of sync operation
 */
export async function syncQueue(): Promise<SyncResult> {
  let queue = await getQueue();

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
  await saveQueue(queue);

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
export async function clearQueue(): Promise<void> {
  const store = await getStorage();
  store.delete(STORAGE_KEYS.OFFLINE_QUEUE);
  logger.info('Offline queue cleared');
}

/**
 * Get count of queued transactions
 * @returns number - Count of transactions in queue
 */
export async function getQueueCount(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}
