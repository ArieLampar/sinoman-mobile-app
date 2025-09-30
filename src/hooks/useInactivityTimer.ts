import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@store/authStore';
import { updateLastActivity, shouldTerminateSession } from '@services/auth';
import { SESSION } from '@utils/constants';
import { logger } from '@utils/logger';

/**
 * Hook to handle automatic logout after period of inactivity
 * @param timeoutMinutes - Minutes of inactivity before logout (default: 15)
 */
export function useInactivityTimer(timeoutMinutes: number = SESSION.TIMEOUT_MINUTES) {
  const { signOut, isAuthenticated } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  /**
   * Reset the inactivity timer
   */
  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update last activity timestamp
    updateLastActivity();

    // Set new timer
    timeoutRef.current = setTimeout(async () => {
      logger.warn('Session timeout due to inactivity');
      await signOut();
    }, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes, signOut]);

  /**
   * Check if session should be terminated
   */
  const checkSession = useCallback(async () => {
    if (!isAuthenticated) return;

    const shouldTerminate = await shouldTerminateSession();
    if (shouldTerminate) {
      logger.warn('Session terminated due to inactivity');
      await signOut();
    } else {
      resetTimer();
    }
  }, [isAuthenticated, signOut, resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize timer on mount
    resetTimer();

    // Listen to app state changes
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground, check if session should be terminated
        await checkSession();
      } else if (nextAppState === 'active') {
        // App is active, reset timer
        resetTimer();
      }

      appState.current = nextAppState;
    });

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      subscription.remove();
    };
  }, [isAuthenticated, resetTimer, checkSession]);

  return { resetTimer };
}