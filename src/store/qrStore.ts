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
} from '@types';
import { parseQRCode, processQRPayment, generatePersonalQR } from '@services/qr';

export const useQRStore = create<QRState>((set, get) => ({
  // Initial state
  isScannerActive: false,
  isScanning: false,
  scanResult: null,
  isProcessingPayment: false,
  paymentResult: null,
  generatedQR: null,
  isGeneratingQR: false,
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
      error: null,
    });
  },
}));
