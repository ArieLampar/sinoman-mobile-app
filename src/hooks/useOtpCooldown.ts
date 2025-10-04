/**
 * OTP Cooldown Hook
 * Manages OTP resend cooldown with UI feedback
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Constants from 'expo-constants';

const OTP_RESEND_COOLDOWN = parseInt(
  Constants.expoConfig?.extra?.otpResendCooldown || '60',
  10
);

interface UseOtpCooldownResult {
  /** Whether cooldown is active */
  isCooldownActive: boolean;
  /** Remaining seconds in cooldown */
  remainingSeconds: number;
  /** Start the cooldown timer */
  startCooldown: () => void;
  /** Reset/cancel the cooldown */
  resetCooldown: () => void;
  /** Check if can send OTP */
  canSend: boolean;
}

/**
 * Hook for managing OTP resend cooldown
 * Prevents spam by enforcing a cooldown period between OTP sends
 *
 * @param initialCooldown - Initial cooldown duration in seconds (default from env)
 * @returns Cooldown state and controls
 */
export function useOtpCooldown(
  initialCooldown: number = OTP_RESEND_COOLDOWN
): UseOtpCooldownResult {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownDuration = useRef(initialCooldown);

  const isCooldownActive = remainingSeconds > 0;
  const canSend = !isCooldownActive;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [remainingSeconds]);

  const startCooldown = useCallback(() => {
    setRemainingSeconds(cooldownDuration.current);
  }, []);

  const resetCooldown = useCallback(() => {
    setRemainingSeconds(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    isCooldownActive,
    remainingSeconds,
    startCooldown,
    resetCooldown,
    canSend,
  };
}

/**
 * Debounce hook for preventing rapid button taps
 * @param callback - Function to debounce
 * @param delay - Debounce delay in milliseconds
 */
export function useDebounce(callback: (...args: any[]) => void, delay: number = 1000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      if (isDebouncing) {
        return;
      }

      setIsDebouncing(true);
      callback(...args);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsDebouncing(false);
        timeoutRef.current = null;
      }, delay);
    },
    [callback, delay, isDebouncing]
  );

  return { debouncedCallback, isDebouncing };
}
