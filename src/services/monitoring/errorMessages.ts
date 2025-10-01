/**
 * Error Message Mapping & Recovery Actions
 * Provides user-friendly error messages in Indonesian and recovery strategies
 */

import type { ErrorRecoveryAction } from '@types';

/**
 * Map of error codes/messages to user-friendly Indonesian messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  'Network request failed': 'Koneksi internet bermasalah. Periksa koneksi Anda.',
  'NETWORK_ERROR': 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  'TIMEOUT': 'Permintaan memakan waktu terlalu lama. Silakan coba lagi.',
  'NO_INTERNET': 'Tidak ada koneksi internet. Periksa koneksi Anda.',

  // Authentication errors
  'OTP_EXPIRED': 'Kode OTP telah kadaluarsa. Minta kode baru.',
  'OTP_INVALID': 'Kode OTP tidak valid. Periksa kembali kode yang Anda masukkan.',
  'SESSION_EXPIRED': 'Sesi Anda telah berakhir. Silakan login kembali.',
  'UNAUTHORIZED': 'Akses ditolak. Silakan login kembali.',
  'INVALID_CREDENTIALS': 'Nomor HP atau PIN salah.',

  // Financial errors
  'INSUFFICIENT_BALANCE': 'Saldo tidak mencukupi.',
  'TRANSACTION_FAILED': 'Transaksi gagal. Silakan coba lagi.',
  'TRANSACTION_LIMIT_EXCEEDED': 'Transaksi melebihi batas harian.',
  'INVALID_AMOUNT': 'Jumlah tidak valid.',
  'MIN_AMOUNT_NOT_MET': 'Jumlah minimum tidak terpenuhi.',

  // QR Code errors
  'QR_INVALID': 'QR code tidak valid atau sudah kadaluarsa.',
  'QR_EXPIRED': 'QR code telah kadaluarsa. Minta kode baru.',
  'QR_SCAN_FAILED': 'Gagal memindai QR code. Coba lagi.',

  // Marketplace errors
  'PRODUCT_NOT_FOUND': 'Produk tidak ditemukan.',
  'OUT_OF_STOCK': 'Produk habis.',
  'ORDER_FAILED': 'Pesanan gagal. Silakan coba lagi.',

  // Server errors
  '500': 'Terjadi kesalahan server. Tim kami sedang menanganinya.',
  '503': 'Layanan sedang dalam pemeliharaan. Coba lagi nanti.',
  'SERVER_ERROR': 'Terjadi kesalahan server. Silakan coba lagi.',

  // Generic errors
  'UNKNOWN_ERROR': 'Terjadi kesalahan. Silakan coba lagi.',
  'VALIDATION_ERROR': 'Data tidak valid. Periksa kembali input Anda.',
  'PERMISSION_DENIED': 'Izin ditolak. Periksa pengaturan aplikasi Anda.',
};

/**
 * Get a user-friendly error message in Indonesian
 * @param error - Error object or error message string
 * @returns User-friendly message in Indonesian
 */
export function getUserFriendlyMessage(error: Error | string): string {
  const errorMessage = typeof error === 'string' ? error : error.message;

  // Check for exact match first
  if (ERROR_MESSAGES[errorMessage]) {
    return ERROR_MESSAGES[errorMessage];
  }

  // Check for partial match (case-insensitive)
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return message;
    }
  }

  // Return generic error message
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Get recovery actions for an error
 * @param error - Error object or error message string
 * @param context - Context with callback functions for recovery actions
 * @returns Array of recovery actions the user can take
 */
export function getRecoveryActions(
  error: Error | string,
  context?: {
    retry?: () => void | Promise<void>;
    goBack?: () => void;
    goHome?: () => void;
    login?: () => void;
  }
): ErrorRecoveryAction[] {
  const actions: ErrorRecoveryAction[] = [];
  const errorMessage = typeof error === 'string' ? error : error.message;
  const msg = errorMessage.toLowerCase();

  // Network errors - offer retry
  if ((msg.includes('network') || msg.includes('timeout') || msg.includes('internet')) && context?.retry) {
    actions.push({
      label: 'Coba Lagi',
      action: context.retry,
      isPrimary: true,
    });
  }

  // Session expired - offer login
  if ((msg.includes('session') || msg.includes('unauthorized')) && context?.login) {
    actions.push({
      label: 'Login Ulang',
      action: context.login,
      isPrimary: true,
    });
  }

  // Transaction errors - offer retry
  if (msg.includes('transaction') && context?.retry) {
    actions.push({
      label: 'Coba Lagi',
      action: context.retry,
      isPrimary: true,
    });
  }

  // QR errors - offer retry
  if (msg.includes('qr') && context?.retry) {
    actions.push({
      label: 'Pindai Ulang',
      action: context.retry,
      isPrimary: true,
    });
  }

  // Always offer go back if available
  if (context?.goBack) {
    actions.push({
      label: 'Kembali',
      action: context.goBack,
      isPrimary: false,
    });
  }

  // Offer go home as last resort
  if (context?.goHome && actions.length === 0) {
    actions.push({
      label: 'Ke Beranda',
      action: context.goHome,
      isPrimary: true,
    });
  }

  return actions;
}

/**
 * Determine if an error should be retried automatically
 * @param error - Error object or error message string
 * @returns True if the error is likely transient and worth retrying
 */
export function shouldRetry(error: Error | string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const msg = errorMessage.toLowerCase();

  // Retry network errors
  if (msg.includes('network') || msg.includes('timeout') || msg.includes('internet')) {
    return true;
  }

  // Retry server errors (500, 503)
  if (msg.includes('500') || msg.includes('503') || msg.includes('server error')) {
    return true;
  }

  // Retry timeouts
  if (msg.includes('timeout')) {
    return true;
  }

  // Don't retry authentication errors
  if (msg.includes('unauthorized') || msg.includes('session') || msg.includes('credentials')) {
    return false;
  }

  // Don't retry validation errors
  if (msg.includes('validation') || msg.includes('invalid')) {
    return false;
  }

  // Don't retry business logic errors
  if (msg.includes('insufficient') || msg.includes('out of stock') || msg.includes('limit exceeded')) {
    return false;
  }

  return false;
}

/**
 * Get retry delay in milliseconds based on attempt number
 * Uses exponential backoff strategy
 * @param attempt - Current attempt number (1-indexed)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 * @returns Delay in milliseconds
 */
export function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
  // Exponential backoff: baseDelay * 2^(attempt - 1)
  // attempt 1: 1000ms, attempt 2: 2000ms, attempt 3: 4000ms
  return Math.min(baseDelay * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
}
