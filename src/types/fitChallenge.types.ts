/**
 * Fit Challenge Types
 *
 * Type definitions for the 8-week health challenge program
 * including check-ins, progress tracking, and leaderboard functionality
 */

// ============================================================================
// Core Entities
// ============================================================================

/**
 * Represents a Fit Challenge program (8 weeks)
 */
export interface FitChallenge {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
  durationWeeks: number; // 8
  totalDays: number;     // 56
  pointsPerCheckIn: number; // 10
  participantCount: number;
  rules: string[]; // Array of challenge rules
  isActive: boolean;
  registrationFee: number; // Rp 600,000
  createdAt: string;
}

/**
 * Represents a participant in a Fit Challenge
 */
export interface FitChallengeParticipant {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  totalCheckIns: number;
  currentStreak: number; // Consecutive days
  longestStreak: number; // Best streak record
  totalPoints: number;
  rank: number;
  isActive: boolean;
  joinedAt: string;
}

/**
 * Represents a single check-in record
 */
export interface FitChallengeCheckIn {
  id: string;
  userId: string;
  challengeId: string;
  checkInDate: string; // YYYY-MM-DD
  timestamp: string;   // ISO 8601 full timestamp
  points: number;      // 10 base + streak bonus
  notes?: string;      // Optional user notes
  photoUrl?: string;   // Optional check-in photo
}

/**
 * Represents weekly progress breakdown
 */
export interface WeeklyProgress {
  weekNumber: number; // 1-8
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
  checkInCount: number;
  targetCheckIns: number; // 7 days
  points: number;
  isCompleted: boolean;
  completionPercentage: number;
}

/**
 * Represents a user's complete progress in a challenge
 */
export interface FitChallengeProgress {
  participant: FitChallengeParticipant;
  checkIns: FitChallengeCheckIn[];
  weeklyProgress: WeeklyProgress[];
  completedDays: number;
  totalDays: number;
  completionPercentage: number;
  nextCheckInAvailable: boolean; // True if can check-in today
  lastCheckInDate?: string; // YYYY-MM-DD
}

/**
 * Represents the leaderboard with top participants
 */
export interface FitChallengeLeaderboard {
  challengeId: string;
  participants: FitChallengeParticipant[];
  myRank: number;
  totalParticipants: number;
  lastUpdated: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request payload for check-in submission
 */
export interface CheckInRequest {
  challengeId: string;
  notes?: string;
  photoUri?: string; // Local file URI
}

/**
 * Response from check-in submission
 */
export interface CheckInResponse {
  success: boolean;
  checkIn?: FitChallengeCheckIn;
  progress?: FitChallengeProgress;
  error?: string;
  message?: string;
}

/**
 * Request payload for joining a challenge
 */
export interface JoinChallengeRequest {
  challengeId: string;
  userId: string;
}

/**
 * Response from joining a challenge
 */
export interface JoinChallengeResponse {
  success: boolean;
  participant?: FitChallengeParticipant;
  error?: string;
  message?: string;
}

// ============================================================================
// Store State Types
// ============================================================================

/**
 * Zustand store state for Fit Challenge
 */
export interface FitChallengeState {
  // Data
  currentChallenge: FitChallenge | null;
  myProgress: FitChallengeProgress | null;
  leaderboard: FitChallengeLeaderboard | null;

  // Loading states
  isLoadingChallenge: boolean;
  isLoadingProgress: boolean;
  isLoadingLeaderboard: boolean;
  isCheckingIn: boolean;
  isJoining: boolean;
  error: string | null;

  // Actions
  fetchCurrentChallenge: () => Promise<void>;
  fetchMyProgress: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  checkIn: (request: CheckInRequest) => Promise<CheckInResponse>;
  joinChallenge: (challengeId: string) => Promise<JoinChallengeResponse>;
  refreshData: () => Promise<void>; // Fetch all in parallel

  // Setters
  setCurrentChallenge: (challenge: FitChallenge | null) => void;
  setMyProgress: (progress: FitChallengeProgress | null) => void;
  setLeaderboard: (leaderboard: FitChallengeLeaderboard | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
