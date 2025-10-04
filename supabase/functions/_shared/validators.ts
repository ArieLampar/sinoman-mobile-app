// Input validation utilities for Edge Functions

interface PhoneValidationResult {
  valid: boolean;
  normalized?: string;
  error?: string;
}

interface OtpValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates and normalizes Indonesian phone numbers
 * Converts to E.164 format (+62xxx)
 */
export function validatePhoneNumber(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Nomor telepon tidak valid' };
  }

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Remove leading 0 if present
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Remove country code 62 if present (will be added back)
  if (cleaned.startsWith('62')) {
    cleaned = cleaned.substring(2);
  }

  // Validate length (Indonesian mobile: 9-12 digits after removing prefix)
  if (cleaned.length < 9 || cleaned.length > 12) {
    return {
      valid: false,
      error: 'Nomor telepon harus 10-13 digit'
    };
  }

  // Validate first digit must be 8 (Indonesian mobile numbers start with 08xx)
  if (!cleaned.startsWith('8')) {
    return {
      valid: false,
      error: 'Nomor telepon harus dimulai dengan 08'
    };
  }

  // Return normalized E.164 format
  return {
    valid: true,
    normalized: `+62${cleaned}`
  };
}

/**
 * Validates OTP code format (6 digits)
 */
export function validateOtpCode(otp: string): OtpValidationResult {
  if (!otp || typeof otp !== 'string') {
    return { valid: false, error: 'Kode OTP tidak valid' };
  }

  // Check if exactly 6 digits
  if (!/^\d{6}$/.test(otp)) {
    return {
      valid: false,
      error: 'Kode OTP harus 6 digit angka'
    };
  }

  return { valid: true };
}

/**
 * Sanitizes phone number for logging (masks middle digits)
 * Example: +6281234567890 -> +6281****7890
 */
export function sanitizePhoneForLog(phone: string): string {
  if (!phone || phone.length < 8) {
    return '****';
  }

  const start = phone.substring(0, 5);
  const end = phone.substring(phone.length - 4);
  return `${start}****${end}`;
}
