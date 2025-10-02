import {
  formatPhoneNumber,
  maskPhoneNumber,
  formatPhoneForSupabase,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTimeRemaining,
} from '../formatters';

describe('formatters', () => {
  describe('formatPhoneNumber', () => {
    it('should format phone number with +62 prefix', () => {
      expect(formatPhoneNumber('81234567890')).toBe('+62 812-3456-7890');
    });

    it('should handle phone number with leading zero', () => {
      expect(formatPhoneNumber('081234567890')).toBe('+62 812-3456-7890');
    });

    it('should handle phone number with special characters', () => {
      expect(formatPhoneNumber('0812-3456-7890')).toBe('+62 812-3456-7890');
    });

    it('should handle empty string', () => {
      expect(formatPhoneNumber('')).toBe('');
    });

    it('should handle short phone numbers', () => {
      expect(formatPhoneNumber('812345')).toBe('+62 812345');
    });

    it('should format longer phone numbers', () => {
      expect(formatPhoneNumber('8123456789012')).toBe('+62 812-3456-789012');
    });
  });

  describe('maskPhoneNumber', () => {
    it('should mask middle digits of phone number', () => {
      expect(maskPhoneNumber('81234567890')).toBe('+62 812*****890');
    });

    it('should handle phone number with leading zero', () => {
      expect(maskPhoneNumber('081234567890')).toBe('+62 812*****890');
    });

    it('should handle short phone numbers', () => {
      expect(maskPhoneNumber('812345')).toBe('+62 812345');
    });

    it('should handle empty string', () => {
      expect(maskPhoneNumber('')).toBe('');
    });
  });

  describe('formatPhoneForSupabase', () => {
    it('should format phone number for Supabase', () => {
      expect(formatPhoneForSupabase('81234567890')).toBe('+6281234567890');
    });

    it('should handle phone number with leading zero', () => {
      expect(formatPhoneForSupabase('081234567890')).toBe('+6281234567890');
    });

    it('should remove all non-digit characters', () => {
      expect(formatPhoneForSupabase('0812-3456-7890')).toBe('+6281234567890');
    });

    it('should handle empty string', () => {
      expect(formatPhoneForSupabase('')).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with thousands separator', () => {
      expect(formatCurrency(1000000)).toBe('Rp 1.000.000');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('Rp 0');
    });

    it('should format negative numbers', () => {
      expect(formatCurrency(-50000)).toBe('Rp -50.000');
    });

    it('should handle decimal numbers', () => {
      expect(formatCurrency(1500.75)).toBe('Rp 1.500,75');
    });

    it('should handle NaN', () => {
      expect(formatCurrency(NaN)).toBe('Rp 0');
    });

    it('should handle non-number types', () => {
      expect(formatCurrency('test' as any)).toBe('Rp 0');
    });
  });

  describe('formatDate', () => {
    it('should format date string to DD/MM/YYYY', () => {
      expect(formatDate('2025-01-25')).toBe('25/01/2025');
    });

    it('should format Date object', () => {
      const date = new Date('2025-01-25');
      expect(formatDate(date)).toBe('25/01/2025');
    });

    it('should handle empty string', () => {
      expect(formatDate('')).toBe('');
    });

    it('should handle invalid date', () => {
      expect(formatDate('invalid')).toBe('');
    });

    it('should pad single-digit day and month', () => {
      expect(formatDate('2025-03-05')).toBe('05/03/2025');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2025-01-25T14:30:00');
      const result = formatDateTime(date);
      expect(result).toMatch(/25\/01\/2025 \d{2}:\d{2}/);
    });

    it('should handle string date', () => {
      const result = formatDateTime('2025-01-25T14:30:00');
      expect(result).toMatch(/25\/01\/2025 \d{2}:\d{2}/);
    });

    it('should handle empty string', () => {
      expect(formatDateTime('')).toBe('');
    });

    it('should handle invalid date', () => {
      expect(formatDateTime('invalid')).toBe('');
    });

    it('should pad hours and minutes', () => {
      const date = new Date('2025-01-25T09:05:00');
      const result = formatDateTime(date);
      expect(result).toMatch(/25\/01\/2025 09:05/);
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatTimeRemaining(272)).toBe('04:32');
    });

    it('should handle zero seconds', () => {
      expect(formatTimeRemaining(0)).toBe('00:00');
    });

    it('should handle negative seconds', () => {
      expect(formatTimeRemaining(-10)).toBe('00:00');
    });

    it('should pad single-digit minutes and seconds', () => {
      expect(formatTimeRemaining(65)).toBe('01:05');
    });

    it('should handle large values', () => {
      expect(formatTimeRemaining(3661)).toBe('61:01'); // 61 minutes and 1 second
    });

    it('should handle exactly 60 seconds', () => {
      expect(formatTimeRemaining(60)).toBe('01:00');
    });
  });
});
