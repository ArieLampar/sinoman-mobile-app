import {
  validatePhoneNumber,
  getPhoneValidationError,
  validateOtp,
  getOtpValidationError,
  validateEmail,
  getEmailValidationError,
  validateName,
  getNameValidationError,
  validateAddress,
  getAddressValidationError,
  validateTopUpAmount,
  getTopUpAmountError,
} from '../validators';

// Mock constants
jest.mock('../constants', () => ({
  VALIDATION: {
    PHONE_REGEX: /^8\d{9,12}$/,
    OTP_LENGTH: 6,
    MIN_TOP_UP_AMOUNT: 10000,
    MAX_TOP_UP_AMOUNT: 10000000,
  },
}));

describe('validators', () => {
  describe('validatePhoneNumber', () => {
    it('should validate correct Indonesian phone number', () => {
      expect(validatePhoneNumber('81234567890')).toBe(true);
    });

    it('should validate phone number with leading zero', () => {
      expect(validatePhoneNumber('081234567890')).toBe(true);
    });

    it('should reject phone number not starting with 8', () => {
      expect(validatePhoneNumber('71234567890')).toBe(false);
    });

    it('should reject phone number too short', () => {
      expect(validatePhoneNumber('812345')).toBe(false);
    });

    it('should reject phone number too long', () => {
      expect(validatePhoneNumber('81234567890123456')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validatePhoneNumber('')).toBe(false);
    });

    it('should handle phone number with special characters', () => {
      expect(validatePhoneNumber('0812-3456-7890')).toBe(true);
    });
  });

  describe('getPhoneValidationError', () => {
    it('should return null for valid phone number', () => {
      expect(getPhoneValidationError('81234567890')).toBeNull();
    });

    it('should return error for empty phone number', () => {
      expect(getPhoneValidationError('')).toBe('Nomor telepon harus diisi');
    });

    it('should return error for phone not starting with 8', () => {
      expect(getPhoneValidationError('71234567890')).toBe('Nomor telepon harus dimulai dengan 08');
    });

    it('should return error for short phone number', () => {
      expect(getPhoneValidationError('812345')).toBe('Nomor telepon terlalu pendek');
    });

    it('should return error for long phone number', () => {
      expect(getPhoneValidationError('81234567890123456')).toBe('Nomor telepon terlalu panjang');
    });
  });

  describe('validateOtp', () => {
    it('should validate correct 6-digit OTP', () => {
      expect(validateOtp('123456')).toBe(true);
    });

    it('should reject OTP with less than 6 digits', () => {
      expect(validateOtp('12345')).toBe(false);
    });

    it('should reject OTP with more than 6 digits', () => {
      expect(validateOtp('1234567')).toBe(false);
    });

    it('should reject empty OTP', () => {
      expect(validateOtp('')).toBe(false);
    });

    it('should handle OTP with non-digit characters', () => {
      expect(validateOtp('12-34-56')).toBe(true);
    });
  });

  describe('getOtpValidationError', () => {
    it('should return null for valid OTP', () => {
      expect(getOtpValidationError('123456')).toBeNull();
    });

    it('should return error for empty OTP', () => {
      expect(getOtpValidationError('')).toBe('Kode OTP harus diisi');
    });

    it('should return error for short OTP', () => {
      expect(getOtpValidationError('12345')).toBe('Kode OTP harus 6 digit');
    });

    it('should return error for long OTP', () => {
      expect(getOtpValidationError('1234567')).toBe('Kode OTP terlalu panjang');
    });

    it('should return error for non-numeric OTP', () => {
      expect(getOtpValidationError('abcdef')).toBe('Kode OTP harus berupa angka');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should validate email with subdomain', () => {
      expect(validateEmail('test@mail.example.com')).toBe(true);
    });

    it('should reject email without @', () => {
      expect(validateEmail('testexample.com')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(validateEmail('test@')).toBe(false);
    });

    it('should reject email without TLD', () => {
      expect(validateEmail('test@example')).toBe(false);
    });

    it('should reject empty email', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('should reject email with spaces', () => {
      expect(validateEmail('test @example.com')).toBe(false);
    });
  });

  describe('getEmailValidationError', () => {
    it('should return null for valid email', () => {
      expect(getEmailValidationError('test@example.com')).toBeNull();
    });

    it('should return null for empty email (optional field)', () => {
      expect(getEmailValidationError('')).toBeNull();
    });

    it('should return error for invalid email format', () => {
      expect(getEmailValidationError('invalid-email')).toBe('Format email tidak valid');
    });
  });

  describe('validateName', () => {
    it('should validate correct name', () => {
      expect(validateName('John Doe')).toBe(true);
    });

    it('should validate single word name', () => {
      expect(validateName('John')).toBe(true);
    });

    it('should reject name too short', () => {
      expect(validateName('J')).toBe(false);
    });

    it('should reject name too long', () => {
      expect(validateName('a'.repeat(101))).toBe(false);
    });

    it('should reject empty name', () => {
      expect(validateName('')).toBe(false);
    });

    it('should reject name with only spaces', () => {
      expect(validateName('   ')).toBe(false);
    });

    it('should trim spaces and validate', () => {
      expect(validateName('  John Doe  ')).toBe(true);
    });
  });

  describe('getNameValidationError', () => {
    it('should return null for valid name', () => {
      expect(getNameValidationError('John Doe')).toBeNull();
    });

    it('should return error for empty name', () => {
      expect(getNameValidationError('')).toBe('Nama harus diisi');
    });

    it('should return error for short name', () => {
      expect(getNameValidationError('J')).toBe('Nama terlalu pendek (minimal 2 karakter)');
    });

    it('should return error for long name', () => {
      expect(getNameValidationError('a'.repeat(101))).toBe('Nama terlalu panjang (maksimal 100 karakter)');
    });
  });

  describe('validateAddress', () => {
    it('should validate correct address', () => {
      expect(validateAddress('Jl. Example No. 123, Jakarta')).toBe(true);
    });

    it('should accept empty address (optional)', () => {
      expect(validateAddress('')).toBe(true);
    });

    it('should reject address too short', () => {
      expect(validateAddress('Jl.')).toBe(false);
    });

    it('should reject address too long', () => {
      expect(validateAddress('a'.repeat(501))).toBe(false);
    });

    it('should trim and validate address', () => {
      expect(validateAddress('  Jl. Example No. 123  ')).toBe(true);
    });
  });

  describe('getAddressValidationError', () => {
    it('should return null for valid address', () => {
      expect(getAddressValidationError('Jl. Example No. 123, Jakarta')).toBeNull();
    });

    it('should return null for empty address (optional)', () => {
      expect(getAddressValidationError('')).toBeNull();
    });

    it('should return error for short address', () => {
      expect(getAddressValidationError('Jl.')).toBe('Alamat terlalu pendek (minimal 5 karakter)');
    });

    it('should return error for long address', () => {
      expect(getAddressValidationError('a'.repeat(501))).toBe('Alamat terlalu panjang (maksimal 500 karakter)');
    });
  });

  describe('validateTopUpAmount', () => {
    it('should validate amount within range', () => {
      expect(validateTopUpAmount(50000)).toBe(true);
    });

    it('should validate minimum amount', () => {
      expect(validateTopUpAmount(10000)).toBe(true);
    });

    it('should validate maximum amount', () => {
      expect(validateTopUpAmount(10000000)).toBe(true);
    });

    it('should reject amount below minimum', () => {
      expect(validateTopUpAmount(9999)).toBe(false);
    });

    it('should reject amount above maximum', () => {
      expect(validateTopUpAmount(10000001)).toBe(false);
    });

    it('should reject zero amount', () => {
      expect(validateTopUpAmount(0)).toBe(false);
    });
  });

  describe('getTopUpAmountError', () => {
    it('should return null for valid amount', () => {
      expect(getTopUpAmountError(50000)).toBeNull();
    });

    it('should return error for amount below minimum', () => {
      expect(getTopUpAmountError(9999)).toBe('Minimal top-up Rp 10.000');
    });

    it('should return error for amount above maximum', () => {
      expect(getTopUpAmountError(10000001)).toBe('Maksimal top-up Rp 10.000.000');
    });
  });
});
