import { VALIDATION } from './constants';

/**
 * Validate Indonesian phone number
 * Format: 8XXXXXXXXXX (10-13 digits, starts with 8)
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Remove leading 0 if present (Indonesian numbers often start with 08)
  const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;

  // Test against regex (must start with 8, 10-13 digits total)
  return VALIDATION.PHONE_REGEX.test(withoutLeadingZero);
}

/**
 * Get phone validation error message
 * @param phone - Phone number to validate
 * @returns Error message or null if valid
 */
export function getPhoneValidationError(phone: string): string | null {
  if (!phone) {
    return 'Nomor telepon harus diisi';
  }

  const cleaned = phone.replace(/\D/g, '');
  const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;

  if (!withoutLeadingZero.startsWith('8')) {
    return 'Nomor telepon harus dimulai dengan 08';
  }

  if (withoutLeadingZero.length < 10) {
    return 'Nomor telepon terlalu pendek';
  }

  if (withoutLeadingZero.length > 13) {
    return 'Nomor telepon terlalu panjang';
  }

  if (!VALIDATION.PHONE_REGEX.test(withoutLeadingZero)) {
    return 'Format nomor telepon tidak valid';
  }

  return null;
}

/**
 * Validate OTP code
 * Format: 6 digits
 * @param otp - OTP code to validate
 * @returns True if valid
 */
export function validateOtp(otp: string): boolean {
  if (!otp) return false;

  // Remove all non-digit characters
  const cleaned = otp.replace(/\D/g, '');

  // Must be exactly 6 digits
  return cleaned.length === VALIDATION.OTP_LENGTH;
}

/**
 * Get OTP validation error message
 * @param otp - OTP code to validate
 * @returns Error message or null if valid
 */
export function getOtpValidationError(otp: string): string | null {
  if (!otp) {
    return 'Kode OTP harus diisi';
  }

  const cleaned = otp.replace(/\D/g, '');

  if (cleaned.length < VALIDATION.OTP_LENGTH) {
    return 'Kode OTP harus 6 digit';
  }

  if (cleaned.length > VALIDATION.OTP_LENGTH) {
    return 'Kode OTP terlalu panjang';
  }

  if (!/^\d+$/.test(cleaned)) {
    return 'Kode OTP harus berupa angka';
  }

  return null;
}

/**
 * Validate email address
 * @param email - Email to validate
 * @returns True if valid
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate top-up amount
 * @param amount - Amount to validate
 * @returns True if valid
 */
export function validateTopUpAmount(amount: number): boolean {
  return (
    amount >= VALIDATION.MIN_TOP_UP_AMOUNT &&
    amount <= VALIDATION.MAX_TOP_UP_AMOUNT
  );
}

/**
 * Get top-up amount validation error
 * @param amount - Amount to validate
 * @returns Error message or null if valid
 */
export function getTopUpAmountError(amount: number): string | null {
  if (amount < VALIDATION.MIN_TOP_UP_AMOUNT) {
    return `Minimal top-up Rp ${VALIDATION.MIN_TOP_UP_AMOUNT.toLocaleString('id-ID')}`;
  }

  if (amount > VALIDATION.MAX_TOP_UP_AMOUNT) {
    return `Maksimal top-up Rp ${VALIDATION.MAX_TOP_UP_AMOUNT.toLocaleString('id-ID')}`;
  }

  return null;
}