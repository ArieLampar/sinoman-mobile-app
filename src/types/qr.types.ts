/**
 * QR Code and Payment Types
 * Handles QR scanning, payment processing, and merchant interactions
 */

export enum QRCodeType {
  MERCHANT_PAYMENT = 'merchant_payment',
  PEER_TO_PEER = 'peer_to_peer',
  TOP_UP = 'top_up',
  INVALID = 'invalid',
}

export enum QRPaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface MerchantInfo {
  id: string;
  name: string;
  category: string;
  address: string;
  phoneNumber: string;
  logoUrl?: string;
  isVerified: boolean;
  rating?: number;
  totalTransactions?: number;
}

export interface QRCodeData {
  type: QRCodeType;
  merchantId?: string;
  userId?: string;
  amount?: number;
  description?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface QRPaymentRequest {
  qrData: QRCodeData;
  amount: number;
  savingsType: string; // 'pokok' | 'wajib' | 'sukarela'
  notes?: string;
}

export interface QRPaymentResponse {
  success: boolean;
  transactionId?: string;
  receiptUrl?: string;
  message?: string;
  error?: string;
  newBalance?: number;
}

export interface QRScanResult {
  success: boolean;
  data?: QRCodeData;
  merchant?: MerchantInfo;
  error?: string;
}

export interface GenerateQRRequest {
  type: QRCodeType;
  amount?: number;
  expiresInMinutes?: number;
  description?: string;
}

export interface GenerateQRResponse {
  success: boolean;
  qrCodeUrl?: string;
  qrData?: string;
  expiresAt?: string;
  error?: string;
}

// Zustand Store State
export interface QRState {
  // Scan state
  isScannerActive: boolean;
  isScanning: boolean;
  scanResult: QRScanResult | null;

  // Payment state
  isProcessingPayment: boolean;
  paymentResult: QRPaymentResponse | null;

  // Generated QR state
  generatedQR: GenerateQRResponse | null;
  isGeneratingQR: boolean;

  // Offline queue state
  offlineQueue: QueuedTransaction[];
  isSyncingQueue: boolean;

  // Error state
  error: string | null;

  // Actions
  startScanner: () => void;
  stopScanner: () => void;
  scanQRCode: (qrData: string) => Promise<QRScanResult>;
  processPayment: (request: QRPaymentRequest) => Promise<QRPaymentResponse>;
  generateQRCode: (request: GenerateQRRequest) => Promise<GenerateQRResponse>;
  clearScanResult: () => void;
  clearPaymentResult: () => void;
  clearError: () => void;
  reset: () => void;

  // Offline queue actions
  addToOfflineQueue: (transaction: Omit<QueuedTransaction, 'id' | 'timestamp' | 'retryCount' | 'status'>) => void;
  removeFromOfflineQueue: (id: string) => void;
  syncOfflineQueue: () => Promise<SyncResult>;
  clearOfflineQueue: () => void;
  getQueuedTransactionsCount: () => number;
}

export interface QRPaymentHistory {
  id: string;
  transactionId: string;
  merchantId?: string;
  merchantName: string;
  amount: number;
  savingsType: string;
  status: QRPaymentStatus;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
}

// Offline Queue Types
export interface QueuedTransaction {
  id: string; // Unique ID for queue item
  qrData: QRCodeData;
  amount: number;
  savingsType: string;
  notes?: string;
  timestamp: string; // When queued
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
}

export interface OfflineQueueState {
  queue: QueuedTransaction[];
  isSyncing: boolean;
  lastSyncAttempt?: string;
  failedCount: number;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors?: Array<{ id: string; error: string }>;
}
