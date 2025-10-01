/**
 * Fit Challenge Store
 *
 * Zustand store for Fit Challenge state management
 */

import { create } from 'zustand';
import { logger } from '@utils/logger';
import {
  FitChallengeState,
  FitChallenge,
  FitChallengeProgress,
  FitChallengeLeaderboard,
  CheckInRequest,
  CheckInResponse,
  JoinChallengeResponse,
} from '@/types';
import {
  fetchCurrentChallenge as fetchCurrentChallengeService,
  fetchMyProgress as fetchMyProgressService,
  fetchLeaderboard as fetchLeaderboardService,
  checkIn as checkInService,
  joinChallenge as joinChallengeService,
} from '@/services/fitChallenge';

/**
 * Fit Challenge Zustand Store
 */
export const useFitChallengeStore = create<FitChallengeState>((set, get) => ({
  // ============================================================================
  // State
  // ============================================================================

  currentChallenge: null,
  myProgress: null,
  leaderboard: null,

  isLoadingChallenge: false,
  isLoadingProgress: false,
  isLoadingLeaderboard: false,
  isCheckingIn: false,
  isJoining: false,
  error: null,

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Fetch current active challenge
   */
  fetchCurrentChallenge: async () => {
    set({ isLoadingChallenge: true, error: null });

    try {
      const challenge = await fetchCurrentChallengeService();
      set({ currentChallenge: challenge, isLoadingChallenge: false });
    } catch (error) {
      logger.error('Error fetching current challenge:', error);
      set({
        error: 'Gagal memuat data challenge',
        isLoadingChallenge: false,
      });
    }
  },

  /**
   * Fetch user's progress in current challenge
   */
  fetchMyProgress: async () => {
    const { currentChallenge } = get();
    if (!currentChallenge) {
      set({ error: 'No active challenge' });
      return;
    }

    set({ isLoadingProgress: true, error: null });

    try {
      const progress = await fetchMyProgressService(currentChallenge.id);
      set({ myProgress: progress, isLoadingProgress: false });
    } catch (error) {
      logger.error('Error fetching my progress:', error);
      set({
        error: 'Gagal memuat data progress',
        isLoadingProgress: false,
      });
    }
  },

  /**
   * Fetch leaderboard for current challenge
   */
  fetchLeaderboard: async () => {
    const { currentChallenge } = get();
    if (!currentChallenge) {
      set({ error: 'No active challenge' });
      return;
    }

    set({ isLoadingLeaderboard: true, error: null });

    try {
      const leaderboard = await fetchLeaderboardService(currentChallenge.id, 10);
      set({ leaderboard, isLoadingLeaderboard: false });
    } catch (error) {
      logger.error('Error fetching leaderboard:', error);
      set({
        error: 'Gagal memuat data leaderboard',
        isLoadingLeaderboard: false,
      });
    }
  },

  /**
   * Submit a check-in
   */
  checkIn: async (request: CheckInRequest): Promise<CheckInResponse> => {
    set({ isCheckingIn: true, error: null });

    try {
      const response = await checkInService(request);

      if (response.success) {
        // Update progress with new check-in data
        if (response.progress) {
          set({ myProgress: response.progress });
        }

        // Refresh leaderboard to show updated rank
        await get().fetchLeaderboard();
      } else {
        set({ error: response.error ?? 'Check-in gagal' });
      }

      set({ isCheckingIn: false });
      return response;
    } catch (error) {
      logger.error('Error checking in:', error);
      set({
        error: 'Terjadi kesalahan saat check-in',
        isCheckingIn: false,
      });

      return {
        success: false,
        error: 'Check-in failed',
        message: 'Terjadi kesalahan saat check-in',
      };
    }
  },

  /**
   * Join a challenge
   */
  joinChallenge: async (challengeId: string): Promise<JoinChallengeResponse> => {
    set({ isJoining: true, error: null });

    try {
      const response = await joinChallengeService(challengeId);

      if (response.success) {
        // Fetch progress after joining
        await get().fetchMyProgress();
        await get().fetchLeaderboard();
      } else {
        set({ error: response.error ?? 'Gagal bergabung' });
      }

      set({ isJoining: false });
      return response;
    } catch (error) {
      logger.error('Error joining challenge:', error);
      set({
        error: 'Terjadi kesalahan saat bergabung',
        isJoining: false,
      });

      return {
        success: false,
        error: 'Join failed',
        message: 'Gagal bergabung dengan challenge',
      };
    }
  },

  /**
   * Refresh all data (fetch challenge first, then progress and leaderboard)
   */
  refreshData: async () => {
    const { fetchCurrentChallenge, fetchMyProgress, fetchLeaderboard } = get();

    try {
      // Fetch challenge first to ensure currentChallenge is set
      await fetchCurrentChallenge();

      // Then fetch progress and leaderboard in parallel
      await Promise.all([
        fetchMyProgress(),
        fetchLeaderboard(),
      ]);
    } catch (error) {
      logger.error('Error refreshing data:', error);
      set({ error: 'Gagal memuat data' });
    }
  },

  // ============================================================================
  // Setters
  // ============================================================================

  setCurrentChallenge: (challenge: FitChallenge | null) => {
    set({ currentChallenge: challenge });
  },

  setMyProgress: (progress: FitChallengeProgress | null) => {
    set({ myProgress: progress });
  },

  setLeaderboard: (leaderboard: FitChallengeLeaderboard | null) => {
    set({ leaderboard });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set({
      currentChallenge: null,
      myProgress: null,
      leaderboard: null,
      isLoadingChallenge: false,
      isLoadingProgress: false,
      isLoadingLeaderboard: false,
      isCheckingIn: false,
      isJoining: false,
      error: null,
    });
  },
}));
