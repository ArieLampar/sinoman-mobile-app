/**
 * QR Store
 * Zustand store for QR code scanning and payment management
 */

import { create } from 'zustand';
import {
  QRState,
  QRScanResult,
  QRPaymentRequest,
  QRPaymentResponse,
  GenerateQRRequest,
  GenerateQRResponse,
  QueuedTransaction,
  SyncResult,
} from '@types';
import { parseQRCode, processQRPayment, generatePersonalQR } from '@services/qr';
import { isOnline, addToQueue, syncQueue, getQueue, removeFromQueue, getQueueCount } from '@services/offline';
import { logger } from '@utils/logger';

export const useQRStore = create<QRState>((set, get) => ({
  // Initial state
  isScannerActive: false,
  isScanning: false,
  scanResult: null,
  isProcessingPayment: false,
  paymentResult: null,
  generatedQR: null,
  isGeneratingQR: false,
  offlineQueue: getQueue(), // Load offline queue from storage on init
  isSyncingQueue: false,
  error: null,

  // Start QR scanner
  startScanner: () => {
    set({
      isScannerActive: true,
      scanResult: null,
      error: null,
    });
  },

  // Stop QR scanner
  stopScanner: () => {
    set({
      isScannerActive: false,
      isScanning: false,
    });
  },

  // Scan QR code
  scanQRCode: async (qrData: string): Promise<QRScanResult> => {
    set({ isScanning: true, error: null });

    try {
      const result = await parseQRCode(qrData);

      set({
        isScanning: false,
        scanResult: result,
        isScannerActive: !result.success, // Stop scanner if successful
        error: result.success ? null : result.error || null,
      });

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan saat memindai QR code';
      set({
        isScanning: false,
        scanResult: { success: false, error: errorMessage },
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Process payment
  processPayment: async (request: QRPaymentRequest): Promise<QRPaymentResponse> => {
    set({ isProcessingPayment: true, error: null });

    try {
      // Check if online
      const online = await isOnline();

      if (!online) {
        // Add to offline queue
        logger.info('Offline detected, queueing transaction');

        const queuedTransaction = addToQueue({
          qrData: request.qrData,
          amount: request.amount,
          savingsType: request.savingsType,
          notes: request.notes,
        });

        // Update store with new queue
        const updatedQueue = getQueue();
        set({
          isProcessingPayment: false,
          offlineQueue: updatedQueue,
        });

        return {
          success: true,
          message: 'Transaksi disimpan. Akan diproses saat online.',
          transactionId: queuedTransaction.id,
        };
      }

      // Process online
      const result = await processQRPayment(request);

      set({
        isProcessingPayment: false,
        paymentResult: result,
        error: result.success ? null : result.error || null,
      });

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan saat memproses pembayaran';
      set({
        isProcessingPayment: false,
        paymentResult: { success: false, error: errorMessage },
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Generate QR code
  generateQRCode: async (request: GenerateQRRequest): Promise<GenerateQRResponse> => {
    set({ isGeneratingQR: true, error: null });

    try {
      const result = await generatePersonalQR(request);

      set({
        isGeneratingQR: false,
        generatedQR: result,
        error: result.success ? null : result.error || null,
      });

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan saat membuat QR code';
      set({
        isGeneratingQR: false,
        generatedQR: { success: false, error: errorMessage },
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Clear scan result
  clearScanResult: () => {
    set({ scanResult: null });
  },

  // Clear payment result
  clearPaymentResult: () => {
    set({ paymentResult: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      isScannerActive: false,
      isScanning: false,
      scanResult: null,
      isProcessingPayment: false,
      paymentResult: null,
      generatedQR: null,
      isGeneratingQR: false,
      offlineQueue: getQueue(), // Keep queue on reset
      isSyncingQueue: false,
      error: null,
    });
  },

  // Sync offline queue
  syncOfflineQueue: async (): Promise<SyncResult> => {
    set({ isSyncingQueue: true });

    try {
      logger.info('Starting offline queue sync');
      const result = await syncQueue();

      // Update queue after sync
      const updatedQueue = getQueue();
      set({
        isSyncingQueue: false,
        offlineQueue: updatedQueue,
      });

      logger.info('Offline queue sync completed:', result);
      return result;
    } catch (error: any) {
      logger.error('Offline queue sync error:', error);
      set({ isSyncingQueue: false });
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: [{ id: 'sync', error: error.message }],
      };
    }
  },

  // Add to offline queue
  addToOfflineQueue: (transaction) => {
    const queued = addToQueue(transaction);
    const updatedQueue = getQueue();
    set({ offlineQueue: updatedQueue });
    logger.info('Transaction added to offline queue:', queued.id);
  },

  // Remove from offline queue
  removeFromOfflineQueue: (id: string) => {
    removeFromQueue(id);
    const updatedQueue = getQueue();
    set({ offlineQueue: updatedQueue });
    logger.info('Transaction removed from offline queue:', id);
  },

  // Clear offline queue
  clearOfflineQueue: () => {
    const { clearQueue } = require('@services/offline');
    clearQueue();
    set({ offlineQueue: [] });
    logger.info('Offline queue cleared');
  },

  // Get queued transactions count
  getQueuedTransactionsCount: () => {
    return getQueueCount();
  },
}));
