/**
 * Integration Test: Complete Authentication Flow
 * Tests the full auth flow from OTP send to session management
 */

import { sendOtp, verifyOtp, getSession, signOut } from '@services/auth/supabaseAuth';
import { supabase } from '@services/supabase';

jest.mock('@services/supabase');
jest.mock('@utils/formatters', () => ({
  formatPhoneForSupabase: (phone: string) => `+62${phone.replace(/^0/, '')}`,
}));

describe('Authentication Flow Integration', () => {
  const testPhone = '081234567890';
  const testOtp = '123456';
  const mockSession = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    user: {
      id: 'user-123',
      phone: '+6281234567890',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2025-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path: New User Registration', () => {
    it('should complete full registration flow', async () => {
      // Step 1: Send OTP
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      const sendResult = await sendOtp(testPhone);
      expect(sendResult.success).toBe(true);

      // Step 2: Verify OTP
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const verifyResult = await verifyOtp(testPhone, testOtp);
      expect(verifyResult.session).toEqual(mockSession);
      expect(verifyResult.error).toBeUndefined();

      // Step 3: Verify session is active
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const session = await getSession();
      expect(session).toEqual(mockSession);
      expect(session?.user.id).toBe('user-123');
    });
  });

  describe('Happy Path: Existing User Login', () => {
    it('should complete full login flow', async () => {
      // Step 1: Send OTP
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      const sendResult = await sendOtp(testPhone);
      expect(sendResult.success).toBe(true);

      // Step 2: Verify OTP and get session
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const verifyResult = await verifyOtp(testPhone, testOtp);
      expect(verifyResult.session?.access_token).toBe('test-access-token');
    });
  });

  describe('Error Path: Invalid OTP', () => {
    it('should handle invalid OTP during verification', async () => {
      // Send OTP successfully
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      await sendOtp(testPhone);

      // Verify with wrong OTP
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
        data: {},
        error: { message: 'Invalid OTP code' },
      });

      const verifyResult = await verifyOtp(testPhone, '000000');
      expect(verifyResult.session).toBeNull();
      expect(verifyResult.error).toBe('Invalid OTP code');
    });
  });

  describe('Error Path: Expired OTP', () => {
    it('should handle expired OTP', async () => {
      // Send OTP successfully
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      await sendOtp(testPhone);

      // Verify with expired OTP
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
        data: {},
        error: { message: 'OTP expired' },
      });

      const verifyResult = await verifyOtp(testPhone, testOtp);
      expect(verifyResult.session).toBeNull();
      expect(verifyResult.error).toBe('OTP expired');
    });
  });

  describe('Complete Session Lifecycle', () => {
    it('should handle login, session check, and logout', async () => {
      // 1. Login
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      await sendOtp(testPhone);
      const loginResult = await verifyOtp(testPhone, testOtp);
      expect(loginResult.session).toBeTruthy();

      // 2. Check session
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const session = await getSession();
      expect(session).toEqual(mockSession);

      // 3. Logout
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const logoutResult = await signOut();
      expect(logoutResult.success).toBe(true);

      // 4. Verify session is cleared
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const clearedSession = await getSession();
      expect(clearedSession).toBeNull();
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors during OTP send', async () => {
      (supabase.auth.signInWithOtp as jest.Mock).mockRejectedValue(
        new Error('Network request failed')
      );

      const result = await sendOtp(testPhone);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network request failed');
    });

    it('should handle network errors during OTP verify', async () => {
      (supabase.auth.verifyOtp as jest.Mock).mockRejectedValue(
        new Error('Network request failed')
      );

      const result = await verifyOtp(testPhone, testOtp);
      expect(result.session).toBeNull();
      expect(result.error).toContain('Network request failed');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limit errors', async () => {
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: { message: 'Too many requests. Please try again later.' },
      });

      const result = await sendOtp(testPhone);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many requests');
    });
  });

  describe('Phone Number Formatting', () => {
    it('should handle different phone formats', async () => {
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      // Test with leading 0
      await sendOtp('081234567890');
      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        phone: '+6281234567890',
        options: { channel: 'sms' },
      });

      // Test without leading 0
      await sendOtp('81234567890');
      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        phone: '+6281234567890',
        options: { channel: 'sms' },
      });
    });
  });
});
