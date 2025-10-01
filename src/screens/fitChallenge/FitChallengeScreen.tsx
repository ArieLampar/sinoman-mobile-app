/**
 * Fit Challenge Screen
 *
 * Main screen for 8-week health challenge program
 * Features: check-in, progress tracking, leaderboard
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ProgressBar,
  Chip,
  Avatar,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFitChallengeStore } from '@/store/fitChallengeStore';
import { FitChallengeParticipant } from '@/types';

const { width } = Dimensions.get('window');

export const FitChallengeScreen: React.FC = () => {
  const {
    currentChallenge,
    myProgress,
    leaderboard,
    isLoadingChallenge,
    isLoadingProgress,
    isLoadingLeaderboard,
    isCheckingIn,
    error,
    fetchCurrentChallenge,
    fetchMyProgress,
    fetchLeaderboard,
    checkIn,
    refreshData,
  } = useFitChallengeStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await refreshData();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCheckIn = async () => {
    if (!currentChallenge) return;

    if (!myProgress?.nextCheckInAvailable) {
      Alert.alert('Sudah Check-in', 'Anda sudah check-in hari ini. Coba lagi besok!');
      return;
    }

    const response = await checkIn({
      challengeId: currentChallenge.id,
    });

    if (response.success) {
      Alert.alert(
        'Check-in Berhasil! 🎉',
        response.message || 'Anda mendapat +10 poin!',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Check-in Gagal', response.message || 'Terjadi kesalahan');
    }
  };

  const getMedalEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const isLoading = isLoadingChallenge || isLoadingProgress || isLoadingLeaderboard;

  if (isLoading && !currentChallenge) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Memuat data challenge...</Text>
      </View>
    );
  }

  if (!currentChallenge) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="trophy-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>Tidak ada challenge aktif</Text>
        <Button mode="contained" onPress={loadData} style={styles.retryButton}>
          Coba Lagi
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header Section */}
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        style={styles.header}
      >
        <MaterialCommunityIcons name="trophy" size={48} color="#fff" />
        <Text style={styles.headerTitle}>{currentChallenge.name}</Text>
        <Text style={styles.headerDescription}>{currentChallenge.description}</Text>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatLabel}>Durasi</Text>
            <Text style={styles.headerStatValue}>{currentChallenge.durationWeeks} Minggu</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatLabel}>Peserta</Text>
            <Text style={styles.headerStatValue}>{currentChallenge.participantCount}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Check-in Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Check-in Hari Ini</Text>
            <Text style={styles.sectionDescription}>
              Check-in setiap hari untuk mendapatkan poin dan menjaga streak
            </Text>

            <Button
              mode="contained"
              onPress={handleCheckIn}
              disabled={!myProgress?.nextCheckInAvailable || isCheckingIn}
              loading={isCheckingIn}
              style={styles.checkInButton}
              icon="check-circle"
            >
              {myProgress?.nextCheckInAvailable
                ? 'Check-in Hari Ini'
                : 'Sudah Check-in Hari Ini'}
            </Button>

            {myProgress?.lastCheckInDate && (
              <Text style={styles.lastCheckIn}>
                Terakhir check-in: {myProgress.lastCheckInDate}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Progress Card */}
        {myProgress && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Progress Saya</Text>

              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {myProgress.completedDays} / {myProgress.totalDays} hari
                </Text>
                <Text style={styles.progressPercentage}>
                  {myProgress.completionPercentage}%
                </Text>
              </View>

              <ProgressBar
                progress={myProgress.completionPercentage / 100}
                color="#10b981"
                style={styles.progressBar}
              />

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="fire" size={32} color="#f59e0b" />
                  <Text style={styles.statValue}>{myProgress.participant.currentStreak}</Text>
                  <Text style={styles.statLabel}>Streak Saat Ini</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="star" size={32} color="#fbbf24" />
                  <Text style={styles.statValue}>{myProgress.participant.totalPoints}</Text>
                  <Text style={styles.statLabel}>Total Poin</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="trophy" size={32} color="#3b82f6" />
                  <Text style={styles.statValue}>#{myProgress.participant.rank}</Text>
                  <Text style={styles.statLabel}>Peringkat</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Weekly Progress Section */}
        {myProgress && myProgress.weeklyProgress.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Progress Mingguan</Text>

              {myProgress.weeklyProgress.map((week) => (
                <View key={week.weekNumber} style={styles.weekItem}>
                  <View style={styles.weekHeader}>
                    <Text style={styles.weekTitle}>Minggu {week.weekNumber}</Text>
                    {week.isCompleted && (
                      <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                    )}
                  </View>
                  <Text style={styles.weekDate}>
                    {week.startDate} - {week.endDate}
                  </Text>
                  <View style={styles.weekStats}>
                    <Text style={styles.weekStat}>
                      Check-in: {week.checkInCount}/{week.targetCheckIns}
                    </Text>
                    <Text style={styles.weekStat}>Poin: {week.points}</Text>
                  </View>
                  <ProgressBar
                    progress={week.completionPercentage / 100}
                    color={week.isCompleted ? '#10b981' : '#94a3b8'}
                    style={styles.weekProgressBar}
                  />
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Leaderboard Section */}
        {leaderboard && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Leaderboard Top 10</Text>
              <Text style={styles.sectionDescription}>
                Peringkat berdasarkan total poin dan streak
              </Text>

              {leaderboard.participants.map((participant, index) => (
                <View key={participant.id}>
                  <View style={styles.leaderboardItem}>
                    <View style={styles.leaderboardLeft}>
                      <Text style={styles.rankText}>
                        {getMedalEmoji(participant.rank) || `#${participant.rank}`}
                      </Text>
                      <Avatar.Image
                        size={40}
                        source={{ uri: participant.userAvatar }}
                        style={styles.avatar}
                      />
                      <View style={styles.leaderboardInfo}>
                        <Text style={styles.participantName}>{participant.userName}</Text>
                        <View style={styles.participantStats}>
                          <MaterialCommunityIcons name="fire" size={14} color="#f59e0b" />
                          <Text style={styles.participantStreak}>{participant.currentStreak}</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.participantPoints}>{participant.totalPoints} pts</Text>
                  </View>
                  {index < leaderboard.participants.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}

              {/* My Rank (if not in top 10) */}
              {leaderboard.myRank > 10 && myProgress && (
                <>
                  <Divider style={styles.dividerBold} />
                  <View style={styles.myRankCard}>
                    <Text style={styles.myRankTitle}>Peringkat Saya</Text>
                    <View style={styles.leaderboardItem}>
                      <View style={styles.leaderboardLeft}>
                        <Text style={styles.rankText}>#{leaderboard.myRank}</Text>
                        <Avatar.Image
                          size={40}
                          source={{ uri: myProgress.participant.userAvatar }}
                          style={styles.avatar}
                        />
                        <View style={styles.leaderboardInfo}>
                          <Text style={styles.participantName}>{myProgress.participant.userName}</Text>
                          <View style={styles.participantStats}>
                            <MaterialCommunityIcons name="fire" size={14} color="#f59e0b" />
                            <Text style={styles.participantStreak}>
                              {myProgress.participant.currentStreak}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text style={styles.participantPoints}>
                        {myProgress.participant.totalPoints} pts
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Challenge Rules Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Aturan Challenge</Text>

            {currentChallenge.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  headerStats: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 32,
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  checkInButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  lastCheckIn: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  weekItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekStat: {
    fontSize: 14,
    color: '#64748b',
  },
  weekProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  participantStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  participantStreak: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  participantPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  divider: {
    marginVertical: 4,
  },
  dividerBold: {
    marginVertical: 16,
    height: 2,
    backgroundColor: '#e2e8f0',
  },
  myRankCard: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  myRankTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 12,
    flex: 1,
  },
});
