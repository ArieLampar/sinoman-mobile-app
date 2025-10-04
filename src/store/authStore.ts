import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { AuthState, User, toUser } from '@types';
import {
  sendOtp as sendOtpService,
  verifyOtp as verifyOtpService,
  signOut as signOutService,
  getSession as getSessionService,
  onAuthStateChange,
  isBiometricAvailable,
  authenticateWithBiometric as authenticateBiometric,
  saveSession,
  clearSession,
  saveUserData,
  getStoredUserData,
  saveBiometricPreference,
  getBiometricPreference,
  completeRegistration as completeRegistrationService,
} from '@services/auth';
import { logger } from '@utils/logger';

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isBiometricEnabled: false,
  biometricAvailable: false,

  // Actions
  sendOtp: async (phone: string) => {
    try {
      set({ error: null });
      const result = await sendOtpService(phone);

      if (!result.success) {
        set({ error: result.error || 'Gagal mengirim OTP' });
        return result;
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  verifyOtp: async (phone: string, otp: string) => {
    try {
      set({ isLoading: true, error: null });
      logger.info('[authStore] Calling verifyOtpService with phone:', phone);
      const result = await verifyOtpService(phone, otp);

      logger.info('[authStore] verifyOtpService result:', JSON.stringify({
        hasError: !!result.error,
        hasSession: !!result.session,
        isProfileComplete: result.isProfileComplete,
      }));

      if (result.error || !result.session) {
        logger.error('[authStore] Verification failed:', result.error);
        set({ error: result.error || 'Verifikasi gagal', isLoading: false });
        return { success: false, error: result.error };
      }

      // Save session
      await saveSession(result.session);

      // Convert Supabase user to our User type
      const user = result.session.user ? toUser(result.session.user) : null;

      // Save user data
      if (user) {
        await saveUserData(user);
      }

      // Check if profile is complete - prioritize value from verify response over user object
      const isProfileComplete = result.isProfileComplete ?? user?.isProfileComplete ?? false;

      logger.info('[authStore] Setting state - isAuthenticated:', isProfileComplete, 'isProfileComplete:', isProfileComplete);

      // Update state - only set isAuthenticated to true if profile is complete
      set({
        session: result.session,
        user,
        isAuthenticated: isProfileComplete,
        isLoading: false,
        error: null,
      });

      logger.info('[authStore] User authenticated successfully', {
        isProfileComplete,
        userId: user?.id,
        phone: user?.phone,
      });
      return { success: true, isProfileComplete };
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan';
      logger.error('[authStore] verifyOtp error:', errorMessage);
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });

      // Sign out from Supabase
      await signOutService();

      // Clear all session data from SecureStore
      await clearSession();

      // Clear MMKV encrypted stores (if any sensitive data cached)
      const { clearAllEncryptedData } = await import('@services/security/secureStorageService');
      try {
        await clearAllEncryptedData();
      } catch (mmkvError) {
        logger.warn('Failed to clear MMKV data during logout:', mmkvError);
      }

      // TODO: Unregister push notification tokens server-side
      // This should be implemented when push notifications are configured

      // Reset Supabase client state
      const { supabase } = await import('@services/supabase/client');
      await supabase.auth.signOut({ scope: 'local' });

      // Reset state
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        biometricAvailable: false,
        isBiometricEnabled: false,
      });

      logger.info('User signed out successfully - all credentials cleared');
    } catch (error: any) {
      logger.error('Sign out error:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  checkSession: async () => {
    try {
      set({ isLoading: true });

      // Get session from Supabase
      const session = await getSessionService();

      if (session) {
        // Get stored user data
        const user = await getStoredUserData();

        // Check biometric availability
        const biometricAvailable = await isBiometricAvailable();
        const biometricEnabled = await getBiometricPreference();

        set({
          session,
          user,
          isAuthenticated: true,
          isLoading: false,
          biometricAvailable,
          isBiometricEnabled: biometricEnabled,
        });

        logger.info('Session restored');
      } else {
        set({
          session: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });

        logger.info('No active session');
      }
    } catch (error: any) {
      logger.error('Check session error:', error);
      set({
        isLoading: false,
        error: error.message,
        isAuthenticated: false,
      });
    }
  },

  enableBiometric: async (enabled: boolean) => {
    try {
      // Check if biometric is available
      const available = await isBiometricAvailable();

      if (!available && enabled) {
        set({ error: 'Biometric tidak tersedia di perangkat ini' });
        return;
      }

      // Save preference
      await saveBiometricPreference(enabled);

      set({
        isBiometricEnabled: enabled,
        error: null,
      });

      logger.info('Biometric preference updated:', enabled);
    } catch (error: any) {
      logger.error('Enable biometric error:', error);
      set({ error: error.message });
    }
  },

  authenticateWithBiometric: async () => {
    try {
      set({ isLoading: true, error: null });

      // Check if biometric is enabled
      if (!get().isBiometricEnabled) {
        set({ error: 'Biometric tidak diaktifkan', isLoading: false });
        return { success: false, error: 'Biometric tidak diaktifkan' };
      }

      // Authenticate
      const result = await authenticateBiometric();

      if (!result.success) {
        set({ error: result.error, isLoading: false });
        return result;
      }

      // Get session (should already be available)
      const session = await getSessionService();
      if (!session) {
        set({ error: 'Sesi tidak ditemukan', isLoading: false });
        return { success: false, error: 'Sesi tidak ditemukan' };
      }

      // Get user data
      const user = await getStoredUserData();

      set({
        session,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      logger.info('Biometric authentication successful');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  completeRegistration: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const currentUser = get().user;
      if (!currentUser) {
        set({ error: 'User tidak ditemukan', isLoading: false });
        return { success: false, error: 'User tidak ditemukan' };
      }

      const result = await completeRegistrationService({
        userId: currentUser.id,
        ...data,
      });

      if (!result.success) {
        set({ error: result.error || 'Gagal melengkapi registrasi', isLoading: false });
        return result;
      }

      // Update user state with completed profile and set isAuthenticated to true
      if (result.user) {
        await saveUserData(result.user);
        set({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }

      logger.info('Registration completed successfully');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // State Setters
  setUser: (user: User | null) => set({ user }),
  setSession: (session: Session | null) => set({ session }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setBiometricAvailable: (biometricAvailable: boolean) => set({ biometricAvailable }),
}));

// Subscribe to auth state changes
onAuthStateChange(async (session) => {
  const store = useAuthStore.getState();

  if (session) {
    const user = session.user ? toUser(session.user) : null;
    store.setSession(session);
    store.setUser(user);

    // Save session and user data
    if (session) await saveSession(session);
    if (user) await saveUserData(user);
  } else {
    // Session ended, clear state
    store.setSession(null);
    store.setUser(null);
    await clearSession();
  }
});