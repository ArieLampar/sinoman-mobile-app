/**
 * QR Service
 * Handles QR code scanning, payment processing, and QR generation
 */

import { supabase } from '@services/supabase';
import {
  QRCodeData,
  QRCodeType,
  QRScanResult,
  QRPaymentRequest,
  QRPaymentResponse,
  QRPaymentStatus,
  GenerateQRRequest,
  GenerateQRResponse,
  MerchantInfo,
} from '@types';

/**
 * Parse and validate QR code data
 */
export async function parseQRCode(qrDataString: string): Promise<QRScanResult> {
  try {
    // Parse QR data (assuming JSON format)
    let qrData: QRCodeData;

    try {
      qrData = JSON.parse(qrDataString);
    } catch {
      // If not JSON, try parsing as URL or custom format
      return {
        success: false,
        error: 'Format QR code tidak valid',
      };
    }

    // Validate QR code type
    if (!Object.values(QRCodeType).includes(qrData.type)) {
      return {
        success: false,
        error: 'Tipe QR code tidak dikenali',
      };
    }

    // Check if QR code is expired
    if (qrData.expiresAt && new Date(qrData.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'QR code sudah kadaluarsa',
      };
    }

    // Fetch merchant info if merchant payment
    let merchant: MerchantInfo | undefined;
    if (qrData.type === QRCodeType.MERCHANT_PAYMENT && qrData.merchantId) {
      merchant = await fetchMerchantInfo(qrData.merchantId);
      if (!merchant) {
        return {
          success: false,
          error: 'Merchant tidak ditemukan',
        };
      }
    }

    return {
      success: true,
      data: qrData,
      merchant,
    };
  } catch (error: any) {
    console.error('Error parsing QR code:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat memproses QR code',
    };
  }
}

/**
 * Fetch merchant information
 */
async function fetchMerchantInfo(merchantId: string): Promise<MerchantInfo | null> {
  try {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching merchant:', error);
    return null;
  }
}

/**
 * Process QR payment
 */
export async function processQRPayment(request: QRPaymentRequest): Promise<QRPaymentResponse> {
  try {
    const { qrData, amount, savingsType, notes } = request;

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: 'User tidak terautentikasi',
      };
    }

    // Check user balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (balanceError || !balanceData) {
      return {
        success: false,
        error: 'Gagal mengambil saldo',
      };
    }

    // Check if balance is sufficient
    const currentBalance = balanceData[savingsType] || 0;
    if (currentBalance < amount) {
      return {
        success: false,
        error: 'Saldo tidak mencukupi',
      };
    }

    // Create payment transaction
    const transactionData = {
      user_id: user.id,
      type: 'payment',
      savings_type: savingsType,
      amount: -amount, // Negative for deduction
      balance: currentBalance - amount,
      description: notes || `Pembayaran QR - ${qrData.merchantId || 'Peer to Peer'}`,
      status: QRPaymentStatus.SUCCESS,
      reference_id: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        qr_type: qrData.type,
        merchant_id: qrData.merchantId,
        peer_user_id: qrData.userId,
      },
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return {
        success: false,
        error: 'Gagal membuat transaksi',
      };
    }

    // Update balance
    const newBalance = currentBalance - amount;
    const { error: updateError } = await supabase
      .from('user_balances')
      .update({
        [savingsType]: newBalance,
        total: balanceData.total - amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Balance update error:', updateError);
      return {
        success: false,
        error: 'Gagal memperbarui saldo',
      };
    }

    // Generate receipt (mock URL)
    const receiptUrl = `https://sinoman.co.id/receipt/${transaction.id}`;

    return {
      success: true,
      transactionId: transaction.id,
      receiptUrl,
      newBalance,
      message: 'Pembayaran berhasil',
    };
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat memproses pembayaran',
    };
  }
}

/**
 * Generate personal QR code for receiving payments
 */
export async function generatePersonalQR(request: GenerateQRRequest): Promise<GenerateQRResponse> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: 'User tidak terautentikasi',
      };
    }

    const expiresAt = request.expiresInMinutes
      ? new Date(Date.now() + request.expiresInMinutes * 60 * 1000).toISOString()
      : undefined;

    const qrData: QRCodeData = {
      type: request.type,
      userId: user.id,
      amount: request.amount,
      description: request.description,
      expiresAt,
    };

    const qrDataString = JSON.stringify(qrData);

    // In a real implementation, generate actual QR code image using a library
    // For now, return the data string that can be used to generate QR on frontend
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      qrDataString
    )}`;

    return {
      success: true,
      qrCodeUrl,
      qrData: qrDataString,
      expiresAt,
    };
  } catch (error: any) {
    console.error('QR generation error:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat membuat QR code',
    };
  }
}

/**
 * Fetch QR payment history
 */
export async function fetchQRPaymentHistory(limit: number = 20, offset: number = 0) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User tidak terautentikasi');
    }

    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('type', 'payment')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  } catch (error: any) {
    console.error('Error fetching QR payment history:', error);
    throw error;
  }
}
