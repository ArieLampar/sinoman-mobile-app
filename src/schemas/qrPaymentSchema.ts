/**
 * Zod Validation Schemas for QR Payments
 * Provides type-safe validation for QR payment payloads
 */

import { z } from 'zod';

/**
 * Savings type enum
 */
export const SavingsTypeSchema = z.enum(['regular', 'emergency', 'investment']);

/**
 * QR Payment Request Schema
 */
export const QRPaymentRequestSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .max(100000000, 'Amount exceeds maximum limit') // 100 million rupiah
    .refine((val) => Number.isFinite(val), 'Amount must be a valid number'),

  merchantId: z
    .string()
    .uuid('Invalid merchant ID format')
    .nonempty('Merchant ID is required'),

  savingsType: SavingsTypeSchema.optional(),

  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .regex(/^[a-zA-Z0-9\s.,!?-]*$/, 'Notes contain invalid characters')
    .optional()
    .transform((val) => val?.trim()),

  metadata: z.record(z.any()).optional(),
});

/**
 * QR Payment Response Schema
 */
export const QRPaymentResponseSchema = z.object({
  success: z.boolean(),
  transactionId: z.string().uuid().optional(),
  newBalance: z.number().nonnegative().optional(),
  errorMessage: z.string().optional(),
});

/**
 * QR Code Data Schema
 */
export const QRCodeDataSchema = z.object({
  merchantId: z.string().uuid(),
  merchantName: z.string().min(1).max(200),
  amount: z.number().positive().optional(),
  timestamp: z.number().positive(),
  signature: z.string().optional(), // HMAC signature for verification
});

/**
 * Transaction History Query Schema
 */
export const TransactionHistoryQuerySchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  transactionType: z.enum(['qr_payment', 'top_up', 'withdrawal', 'transfer']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Type inference from schemas
 */
export type QRPaymentRequest = z.infer<typeof QRPaymentRequestSchema>;
export type QRPaymentResponse = z.infer<typeof QRPaymentResponseSchema>;
export type QRCodeData = z.infer<typeof QRCodeDataSchema>;
export type TransactionHistoryQuery = z.infer<typeof TransactionHistoryQuerySchema>;
export type SavingsType = z.infer<typeof SavingsTypeSchema>;

/**
 * Validate and sanitize QR payment request
 * @param data - Raw payment data
 * @returns Validated payment request
 * @throws ZodError if validation fails
 */
export function validateQRPaymentRequest(data: unknown): QRPaymentRequest {
  return QRPaymentRequestSchema.parse(data);
}

/**
 * Validate QR code data
 * @param data - Raw QR code data
 * @returns Validated QR code data
 * @throws ZodError if validation fails
 */
export function validateQRCodeData(data: unknown): QRCodeData {
  return QRCodeDataSchema.parse(data);
}

/**
 * Validate transaction history query
 * @param data - Raw query data
 * @returns Validated query parameters
 */
export function validateTransactionQuery(data: unknown): TransactionHistoryQuery {
  return TransactionHistoryQuerySchema.parse(data);
}

/**
 * Safe parse with detailed error messages
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Result with success flag and data or errors
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });

  return { success: false, errors };
}
