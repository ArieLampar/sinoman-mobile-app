/**
 * Fit Challenge Service
 *
 * Service layer for Fit Challenge operations
 * Currently using mock data - Supabase migration path prepared with TODO comments
 */

import { logger } from '@utils/logger';
import {
  FitChallenge,
  FitChallengeProgress,
  FitChallengeLeaderboard,
  FitChallengeParticipant,
  FitChallengeCheckIn,
  WeeklyProgress,
  CheckInRequest,
  CheckInResponse,
  JoinChallengeRequest,
  JoinChallengeResponse,
} from '@/types';
// TODO: Import supabase client when ready
// import { supabase } from '@/config/supabase';

// ============================================================================
// Mock Data (Replace with Supabase queries)
// ============================================================================

const CURRENT_USER_ID = 'user-123'; // TODO: Get from auth store

const MOCK_CHALLENGE: FitChallenge = {
  id: 'challenge-2024-q4',
  name: 'Fit Challenge Q4 2024',
  description: 'Program kesehatan 8 minggu dengan check-in harian, tracking progress, dan kompetisi leaderboard',
  startDate: '2024-10-01',
  endDate: '2024-11-25',
  durationWeeks: 8,
  totalDays: 56,
  pointsPerCheckIn: 10,
  participantCount: 1250,
  isActive: true,
  registrationFee: 600000,
  rules: [
    'Check-in setiap hari untuk mendapatkan poin',
    'Maksimal 1 check-in per hari',
    'Streak bonus: +2 poin per hari berturut-turut (mulai hari ke-3)',
    'Minimal 40 check-in (71%) untuk menyelesaikan challenge',
    'Top 10 leaderboard mendapat hadiah',
    'Check-in harus dilakukan sebelum jam 23:59 WIB',
  ],
  createdAt: '2024-09-15T00:00:00Z',
};

const MOCK_PARTICIPANT: FitChallengeParticipant = {
  id: 'participant-123',
  userId: CURRENT_USER_ID,
  userName: 'Budi Santoso',
  userAvatar: 'https://i.pravatar.cc/150?u=budi',
  totalCheckIns: 15,
  currentStreak: 3,
  longestStreak: 7,
  totalPoints: 165,
  rank: 42,
  isActive: true,
  joinedAt: '2024-10-01T08:00:00Z',
};

const MOCK_CHECK_INS: FitChallengeCheckIn[] = [
  {
    id: 'checkin-1',
    userId: CURRENT_USER_ID,
    challengeId: 'challenge-2024-q4',
    checkInDate: '2024-10-01',
    timestamp: '2024-10-01T07:30:00Z',
    points: 10,
  },
  {
    id: 'checkin-2',
    userId: CURRENT_USER_ID,
    challengeId: 'challenge-2024-q4',
    checkInDate: '2024-10-02',
    timestamp: '2024-10-02T08:15:00Z',
    points: 10,
  },
  // Add more check-ins as needed
];

const MOCK_LEADERBOARD_PARTICIPANTS: FitChallengeParticipant[] = [
  {
    id: 'p1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://i.pravatar.cc/150?u=sarah',
    totalCheckIns: 56,
    currentStreak: 56,
    longestStreak: 56,
    totalPoints: 672,
    rank: 1,
    isActive: true,
    joinedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'p2',
    userId: 'user-2',
    userName: 'Michael Chen',
    userAvatar: 'https://i.pravatar.cc/150?u=michael',
    totalCheckIns: 55,
    currentStreak: 55,
    longestStreak: 55,
    totalPoints: 660,
    rank: 2,
    isActive: true,
    joinedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'p3',
    userId: 'user-3',
    userName: 'Lisa Anderson',
    userAvatar: 'https://i.pravatar.cc/150?u=lisa',
    totalCheckIns: 54,
    currentStreak: 54,
    longestStreak: 54,
    totalPoints: 648,
    rank: 3,
    isActive: true,
    joinedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'p4',
    userId: 'user-4',
    userName: 'David Kim',
    userAvatar: 'https://i.pravatar.cc/150?u=david',
    totalCheckIns: 52,
    currentStreak: 48,
    longestStreak: 48,
    totalPoints: 624,
    rank: 4,
    isActive: true,
    joinedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'p5',
    userId: 'user-5',
    userName: 'Emma Wilson',
    userAvatar: 'https://i.pravatar.cc/150?u=emma',
    totalCheckIns: 50,
    currentStreak: 45,
    longestStreak: 45,
    totalPoints: 600,
    rank: 5,
    isActive: true,
    joinedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'p6',
    userId: 'user-6',
    userName: 'James Brown',
    userAvatar: 'https://i.pravatar.cc/150?u=james',
    totalCheckIns: 48,
    currentStreak: 42,
    longestStreak: 42,
    totalPoints: 576,
    rank: 6,
    isActive: true,
    joinedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'p7',
    userId: 'user-7',
    userName: 'Olivia Davis',
    userAvatar: 'https://i.pravatar.cc/150?u=olivia',
    totalCheckIns: 47,
    currentStreak: 40,
    longestStreak: 40,
    totalPoints: 564,
    rank: 7,
    isActive: true,
    joinedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'p8',
    userId: 'user-8',
    userName: 'William Martinez',
    userAvatar: 'https://i.pravatar.cc/150?u=william',
    totalCheckIns: 45,
    currentStreak: 38,
    longestStreak: 38,
    totalPoints: 540,
    rank: 8,
    isActive: true,
    joinedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'p9',
    userId: 'user-9',
    userName: 'Sophia Garcia',
    userAvatar: 'https://i.pravatar.cc/150?u=sophia',
    totalCheckIns: 44,
    currentStreak: 36,
    longestStreak: 36,
    totalPoints: 528,
    rank: 9,
    isActive: true,
    joinedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'p10',
    userId: 'user-10',
    userName: 'Benjamin Lee',
    userAvatar: 'https://i.pravatar.cc/150?u=benjamin',
    totalCheckIns: 43,
    currentStreak: 35,
    longestStreak: 35,
    totalPoints: 516,
    rank: 10,
    isActive: true,
    joinedAt: '2024-10-01T00:00:00Z',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate weekly progress breakdown
 */
function calculateWeeklyProgress(
  checkIns: FitChallengeCheckIn[],
  challenge: FitChallenge
): WeeklyProgress[] {
  const weeks: WeeklyProgress[] = [];
  const startDate = new Date(challenge.startDate);

  for (let week = 1; week <= challenge.durationWeeks; week++) {
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + (week - 1) * 7);

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    const weekCheckIns = checkIns.filter((checkIn) => {
      const checkInDate = new Date(checkIn.checkInDate);
      return checkInDate >= weekStartDate && checkInDate <= weekEndDate;
    });

    const checkInCount = weekCheckIns.length;
    const points = weekCheckIns.reduce((sum, checkIn) => sum + checkIn.points, 0);
    const targetCheckIns = 7;
    const completionPercentage = Math.round((checkInCount / targetCheckIns) * 100);

    weeks.push({
      weekNumber: week,
      startDate: weekStartDate.toISOString().split('T')[0],
      endDate: weekEndDate.toISOString().split('T')[0],
      checkInCount,
      targetCheckIns,
      points,
      isCompleted: checkInCount >= targetCheckIns,
      completionPercentage,
    });
  }

  return weeks;
}

/**
 * Check if user can check-in today
 */
function canCheckInToday(checkIns: FitChallengeCheckIn[]): boolean {
  const today = new Date().toISOString().split('T')[0];
  return !checkIns.some((checkIn) => checkIn.checkInDate === today);
}

/**
 * Get last check-in date
 */
function getLastCheckInDate(checkIns: FitChallengeCheckIn[]): string | undefined {
  if (checkIns.length === 0) return undefined;

  const sortedCheckIns = [...checkIns].sort(
    (a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()
  );

  return sortedCheckIns[0].checkInDate;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Fetch current active challenge
 */
export async function fetchCurrentChallenge(): Promise<FitChallenge | null> {
  try {
    // TODO: Replace with Supabase query
    // const { data, error } = await supabase
    //   .from('fit_challenges')
    //   .select('*')
    //   .eq('is_active', true)
    //   .single();
    //
    // if (error) throw error;
    // return data;

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
    return MOCK_CHALLENGE;
  } catch (error) {
    logger.error('Error fetching current challenge:', error);
    return null;
  }
}

/**
 * Fetch user's progress in a challenge
 */
export async function fetchMyProgress(challengeId: string): Promise<FitChallengeProgress | null> {
  try {
    // TODO: Replace with Supabase queries
    // 1. Fetch participant record
    // const { data: participant, error: participantError } = await supabase
    //   .from('fit_challenge_participants')
    //   .select('*')
    //   .eq('challenge_id', challengeId)
    //   .eq('user_id', CURRENT_USER_ID)
    //   .single();
    //
    // 2. Fetch check-ins
    // const { data: checkIns, error: checkInsError } = await supabase
    //   .from('fit_challenge_check_ins')
    //   .select('*')
    //   .eq('challenge_id', challengeId)
    //   .eq('user_id', CURRENT_USER_ID)
    //   .order('check_in_date', { ascending: true });

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500));

    const challenge = MOCK_CHALLENGE;
    const participant = MOCK_PARTICIPANT;
    const checkIns = MOCK_CHECK_INS;

    const weeklyProgress = calculateWeeklyProgress(checkIns, challenge);
    const completedDays = checkIns.length;
    const totalDays = challenge.totalDays;
    const completionPercentage = Math.round((completedDays / totalDays) * 100);
    const nextCheckInAvailable = canCheckInToday(checkIns);
    const lastCheckInDate = getLastCheckInDate(checkIns);

    return {
      participant,
      checkIns,
      weeklyProgress,
      completedDays,
      totalDays,
      completionPercentage,
      nextCheckInAvailable,
      lastCheckInDate,
    };
  } catch (error) {
    logger.error('Error fetching my progress:', error);
    return null;
  }
}

/**
 * Fetch leaderboard for a challenge
 */
export async function fetchLeaderboard(
  challengeId: string,
  limit: number = 10
): Promise<FitChallengeLeaderboard | null> {
  try {
    // TODO: Replace with Supabase query
    // const { data: participants, error } = await supabase
    //   .from('fit_challenge_participants')
    //   .select('*')
    //   .eq('challenge_id', challengeId)
    //   .eq('is_active', true)
    //   .order('total_points', { ascending: false })
    //   .order('current_streak', { ascending: false })
    //   .limit(limit);

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500));

    const participants = MOCK_LEADERBOARD_PARTICIPANTS.slice(0, limit);
    const myRank = MOCK_PARTICIPANT.rank;
    const totalParticipants = MOCK_CHALLENGE.participantCount;

    return {
      challengeId,
      participants,
      myRank,
      totalParticipants,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    return null;
  }
}

/**
 * Submit a check-in
 */
export async function checkIn(request: CheckInRequest): Promise<CheckInResponse> {
  try {
    // Validate: only 1 check-in per day
    const progress = await fetchMyProgress(request.challengeId);
    if (!progress) {
      return {
        success: false,
        error: 'Failed to fetch progress',
        message: 'Tidak dapat memuat data progress',
      };
    }

    if (!progress.nextCheckInAvailable) {
      return {
        success: false,
        error: 'Already checked in today',
        message: 'Anda sudah check-in hari ini',
      };
    }

    // TODO: Replace with Supabase insert
    // 1. Upload photo if provided
    // if (request.photoUri) {
    //   const photoUrl = await uploadCheckInPhoto(request.photoUri);
    // }
    //
    // 2. Insert check-in record
    // const { data: checkIn, error } = await supabase
    //   .from('fit_challenge_check_ins')
    //   .insert({
    //     user_id: CURRENT_USER_ID,
    //     challenge_id: request.challengeId,
    //     check_in_date: new Date().toISOString().split('T')[0],
    //     timestamp: new Date().toISOString(),
    //     points: 10, // Base points
    //     notes: request.notes,
    //     photo_url: photoUrl,
    //   })
    //   .select()
    //   .single();
    //
    // 3. Update participant stats
    // await updateParticipantStats(CURRENT_USER_ID, request.challengeId);

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const today = new Date().toISOString().split('T')[0];
    const newCheckIn: FitChallengeCheckIn = {
      id: `checkin-${Date.now()}`,
      userId: CURRENT_USER_ID,
      challengeId: request.challengeId,
      checkInDate: today,
      timestamp: new Date().toISOString(),
      points: 10,
      notes: request.notes,
    };

    // Update mock data
    MOCK_CHECK_INS.push(newCheckIn);
    MOCK_PARTICIPANT.totalCheckIns += 1;
    MOCK_PARTICIPANT.currentStreak += 1;
    MOCK_PARTICIPANT.totalPoints += 10;

    // Fetch updated progress
    const updatedProgress = await fetchMyProgress(request.challengeId);

    return {
      success: true,
      checkIn: newCheckIn,
      progress: updatedProgress ?? undefined,
      message: 'Check-in berhasil! +10 poin',
    };
  } catch (error) {
    logger.error('Error checking in:', error);
    return {
      success: false,
      error: 'Check-in failed',
      message: 'Terjadi kesalahan saat check-in',
    };
  }
}

/**
 * Join a challenge
 */
export async function joinChallenge(challengeId: string): Promise<JoinChallengeResponse> {
  try {
    // TODO: Replace with Supabase insert
    // const { data: participant, error } = await supabase
    //   .from('fit_challenge_participants')
    //   .insert({
    //     challenge_id: challengeId,
    //     user_id: CURRENT_USER_ID,
    //     user_name: 'User Name', // Get from profile
    //     total_check_ins: 0,
    //     current_streak: 0,
    //     longest_streak: 0,
    //     total_points: 0,
    //     is_active: true,
    //   })
    //   .select()
    //   .single();

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      participant: MOCK_PARTICIPANT,
      message: 'Berhasil bergabung dengan challenge!',
    };
  } catch (error) {
    logger.error('Error joining challenge:', error);
    return {
      success: false,
      error: 'Join failed',
      message: 'Gagal bergabung dengan challenge',
    };
  }
}
