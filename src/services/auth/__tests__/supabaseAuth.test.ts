import {
  sendOtp,
  verifyOtp,
  signOut,
  getSession,
  refreshSession,
  onAuthStateChange,
} from '../supabaseAuth';
import { supabase } from '@services/supabase';

jest.mock('@services/supabase');
jest.mock('@utils/logger');
jest.mock('@utils/formatters');

describe('supabaseAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('should send OTP successfully', async () => {
      const mockSignInWithOtp = jest.fn().mockResolvedValue({ error: null });
      (supabase.auth.signInWithOtp as jest.Mock) = mockSignInWithOtp;

      // Mock formatter
      const formatters = require('@utils/formatters');
      formatters.formatPhoneForSupabase = jest.fn().mockReturnValue('+6281234567890');

      const result = await sendOtp('081234567890');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        phone: '+6281234567890',
        options: {
          channel: 'sms',
        },
      });
    });

    it('should handle OTP send error', async () => {
      const mockSignInWithOtp = jest.fn().mockResolvedValue({
        error: { message: 'Failed to send OTP' },
      });
      (supabase.auth.signInWithOtp as jest.Mock) = mockSignInWithOtp;

      const formatters = require('@utils/formatters');
      formatters.formatPhoneForSupabase = jest.fn().mockReturnValue('+6281234567890');

      const result = await sendOtp('081234567890');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send OTP');
    });

    it('should handle exception during OTP send', async () => {
      const mockSignInWithOtp = jest.fn().mockRejectedValue(new Error('Network error'));
      (supabase.auth.signInWithOtp as jest.Mock) = mockSignInWithOtp;

      const formatters = require('@utils/formatters');
      formatters.formatPhoneForSupabase = jest.fn().mockReturnValue('+6281234567890');

      const result = await sendOtp('081234567890');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('verifyOtp', () => {
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      user: {
        id: 'user-123',
        phone: '+6281234567890',
      },
    };

    it('should verify OTP successfully', async () => {
      const mockVerifyOtp = jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (supabase.auth.verifyOtp as jest.Mock) = mockVerifyOtp;

      const formatters = require('@utils/formatters');
      formatters.formatPhoneForSupabase = jest.fn().mockReturnValue('+6281234567890');

      const result = await verifyOtp('081234567890', '123456');

      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeUndefined();
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        phone: '+6281234567890',
        token: '123456',
        type: 'sms',
      });
    });

    it('should handle invalid OTP error', async () => {
      const mockVerifyOtp = jest.fn().mockResolvedValue({
        data: {},
        error: { message: 'Invalid OTP' },
      });
      (supabase.auth.verifyOtp as jest.Mock) = mockVerifyOtp;

      const formatters = require('@utils/formatters');
      formatters.formatPhoneForSupabase = jest.fn().mockReturnValue('+6281234567890');

      const result = await verifyOtp('081234567890', '123456');

      expect(result.session).toBeNull();
      expect(result.error).toBe('Invalid OTP');
    });

    it('should handle no session returned', async () => {
      const mockVerifyOtp = jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      });
      (supabase.auth.verifyOtp as jest.Mock) = mockVerifyOtp;

      const formatters = require('@utils/formatters');
      formatters.formatPhoneForSupabase = jest.fn().mockReturnValue('+6281234567890');

      const result = await verifyOtp('081234567890', '123456');

      expect(result.session).toBeNull();
      expect(result.error).toBe('Gagal membuat sesi');
    });

    it('should handle exception during OTP verification', async () => {
      const mockVerifyOtp = jest.fn().mockRejectedValue(new Error('Network error'));
      (supabase.auth.verifyOtp as jest.Mock) = mockVerifyOtp;

      const formatters = require('@utils/formatters');
      formatters.formatPhoneForSupabase = jest.fn().mockReturnValue('+6281234567890');

      const result = await verifyOtp('081234567890', '123456');

      expect(result.session).toBeNull();
      expect(result.error).toContain('Network error');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const mockSignOut = jest.fn().mockResolvedValue({ error: null });
      (supabase.auth.signOut as jest.Mock) = mockSignOut;

      const result = await signOut();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      const mockSignOut = jest.fn().mockResolvedValue({
        error: { message: 'Sign out failed' },
      });
      (supabase.auth.signOut as jest.Mock) = mockSignOut;

      const result = await signOut();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign out failed');
    });

    it('should handle exception during sign out', async () => {
      const mockSignOut = jest.fn().mockRejectedValue(new Error('Network error'));
      (supabase.auth.signOut as jest.Mock) = mockSignOut;

      const result = await signOut();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('getSession', () => {
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      user: {
        id: 'user-123',
        phone: '+6281234567890',
      },
    };

    it('should get session successfully', async () => {
      const mockGetSession = jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (supabase.auth.getSession as jest.Mock) = mockGetSession;

      const result = await getSession();

      expect(result).toEqual(mockSession);
      expect(mockGetSession).toHaveBeenCalled();
    });

    it('should return null if session error', async () => {
      const mockGetSession = jest.fn().mockResolvedValue({
        data: {},
        error: { message: 'Session error' },
      });
      (supabase.auth.getSession as jest.Mock) = mockGetSession;

      const result = await getSession();

      expect(result).toBeNull();
    });

    it('should handle exception during get session', async () => {
      const mockGetSession = jest.fn().mockRejectedValue(new Error('Network error'));
      (supabase.auth.getSession as jest.Mock) = mockGetSession;

      const result = await getSession();

      expect(result).toBeNull();
    });
  });

  describe('refreshSession', () => {
    const mockSession = {
      access_token: 'new-token',
      refresh_token: 'new-refresh',
      user: {
        id: 'user-123',
        phone: '+6281234567890',
      },
    };

    it('should refresh session successfully', async () => {
      const mockRefreshSession = jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (supabase.auth.refreshSession as jest.Mock) = mockRefreshSession;

      const result = await refreshSession();

      expect(result).toEqual(mockSession);
      expect(mockRefreshSession).toHaveBeenCalled();
    });

    it('should return null if refresh error', async () => {
      const mockRefreshSession = jest.fn().mockResolvedValue({
        data: {},
        error: { message: 'Refresh failed' },
      });
      (supabase.auth.refreshSession as jest.Mock) = mockRefreshSession;

      const result = await refreshSession();

      expect(result).toBeNull();
    });

    it('should return null if no session returned', async () => {
      const mockRefreshSession = jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      });
      (supabase.auth.refreshSession as jest.Mock) = mockRefreshSession;

      const result = await refreshSession();

      expect(result).toBeNull();
    });

    it('should handle exception during refresh', async () => {
      const mockRefreshSession = jest.fn().mockRejectedValue(new Error('Network error'));
      (supabase.auth.refreshSession as jest.Mock) = mockRefreshSession;

      const result = await refreshSession();

      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    const mockSession = {
      access_token: 'mock-token',
      user: { id: 'user-123' },
    };

    it('should subscribe to auth state changes', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      const mockOnAuthStateChange = jest.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      });
      (supabase.auth.onAuthStateChange as jest.Mock) = mockOnAuthStateChange;

      const subscription = onAuthStateChange(mockCallback);

      expect(mockOnAuthStateChange).toHaveBeenCalled();
      expect(subscription.unsubscribe).toBe(mockUnsubscribe);
    });

    it('should call callback on auth state change', () => {
      const mockCallback = jest.fn();
      let authCallback: any;
      const mockOnAuthStateChange = jest.fn().mockImplementation((callback) => {
        authCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      });
      (supabase.auth.onAuthStateChange as jest.Mock) = mockOnAuthStateChange;

      onAuthStateChange(mockCallback);

      // Simulate auth state change
      authCallback('SIGNED_IN', mockSession);

      expect(mockCallback).toHaveBeenCalledWith(mockSession);
    });

    it('should handle sign out event', () => {
      const mockCallback = jest.fn();
      let authCallback: any;
      const mockOnAuthStateChange = jest.fn().mockImplementation((callback) => {
        authCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      });
      (supabase.auth.onAuthStateChange as jest.Mock) = mockOnAuthStateChange;

      onAuthStateChange(mockCallback);

      // Simulate sign out
      authCallback('SIGNED_OUT', null);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });
  });
});
