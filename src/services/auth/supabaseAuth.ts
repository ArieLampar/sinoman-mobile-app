import { Session } from '@supabase/supabase-js';
import { supabase } from '@services/supabase';
import { logger } from '@utils/logger';
import { OtpResponse } from '@types';
import { sendOtpViaFontte, verifyOtpViaFontte } from './fonteOtpService';

/**
 * Send OTP to phone number via FONTTE WhatsApp API
 * Uses custom OTP flow with Supabase Edge Functions instead of Supabase built-in SMS OTP
 * @param phone - Phone number (without +62 prefix)
 * @returns Response with success status and optional error
 */
export async function sendOtp(phone: string): Promise<OtpResponse> {
  try {
    logger.info('Sending OTP via FONTTE WhatsApp');

    const result = await sendOtpViaFontte(phone);

    if (!result.success) {
      logger.error('Send OTP error:', result.error);
      return {
        success: false,
        error: result.error || 'Gagal mengirim kode OTP',
      };
    }

    logger.info('OTP sent successfully via FONTTE');
    return { success: true };
  } catch (error: any) {
    logger.error('Send OTP exception:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat mengirim OTP',
    };
  }
}

/**
 * Verify OTP code via FONTTE custom flow
 * Uses custom OTP verification with Supabase Edge Functions instead of Supabase built-in SMS OTP
 * @param phone - Phone number (without +62 prefix)
 * @param token - 6-digit OTP code
 * @returns Response with session data, isProfileComplete flag, or error
 */
export async function verifyOtp(
  phone: string,
  token: string
): Promise<{ session: Session | null; error?: string; isProfileComplete?: boolean }> {
  try {
    logger.info('Verifying OTP via FONTTE');

    const result = await verifyOtpViaFontte(phone, token);

    if (result.error || !result.session) {
      logger.error('Verify OTP error:', result.error);
      return {
        session: null,
        error: result.error || 'Kode OTP tidak valid',
      };
    }

    logger.info('OTP verified successfully via FONTTE');
    return {
      session: result.session,
      isProfileComplete: result.isProfileComplete,
    };
  } catch (error: any) {
    logger.error('Verify OTP exception:', error);
    return {
      session: null,
      error: error.message || 'Terjadi kesalahan saat verifikasi OTP',
    };
  }
}

/**
 * Sign out current user
 * @returns Response with success status and optional error
 */
export async function signOut(): Promise<OtpResponse> {
  try {
    logger.info('Signing out user');

    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Sign out error:', error.message);
      return {
        success: false,
        error: error.message || 'Gagal logout',
      };
    }

    logger.info('User signed out successfully');
    return { success: true };
  } catch (error: any) {
    logger.error('Sign out exception:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat logout',
    };
  }
}

/**
 * Get current session
 * @returns Current session or null
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      logger.error('Get session error:', error.message);
      return null;
    }

    return data.session;
  } catch (error: any) {
    logger.error('Get session exception:', error);
    return null;
  }
}

/**
 * Refresh session token
 * @returns New session or null
 */
export async function refreshSession(): Promise<Session | null> {
  try {
    logger.info('Refreshing session');

    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      logger.error('Refresh session error:', error.message);
      return null;
    }

    if (!data.session) {
      logger.error('Refresh session: No session returned');
      return null;
    }

    logger.info('Session refreshed successfully');
    return data.session;
  } catch (error: any) {
    logger.error('Refresh session exception:', error);
    return null;
  }
}

/**
 * Subscribe to auth state changes
 * @param callback - Callback function called when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (session: Session | null) => void
): { unsubscribe: () => void } {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    logger.info('Auth state changed:', event);
    callback(session);
  });

  return {
    unsubscribe: () => {
      data.subscription.unsubscribe();
    },
  };
}