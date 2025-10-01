import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, Divider, IconButton, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabScreenProps, PromotionalBanner } from '@types';
import { useDashboard } from '@hooks/useDashboard';
import { useAuthStore } from '@store/authStore';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { useQRStore } from '@store/qrStore';
import { useNotificationStore } from '@store/notificationStore';
import { BalanceCard } from '@components/dashboard/BalanceCard';
import { QuickActionButton } from '@components/dashboard/QuickActionButton';
import { BannerCarousel } from '@components/dashboard/BannerCarousel';
import { DashboardSkeleton } from '@components/dashboard/DashboardSkeleton';
import { TransactionItem } from '@components/common/TransactionItem';
import { EmptyState } from '@components/common/EmptyState';
import { OfflineIndicator } from '@components/common/OfflineIndicator';
import { logger } from '@utils/logger';

export const DashboardScreen: React.FC<MainTabScreenProps<'Dashboard'>> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { isOffline } = useNetworkStatus();
  const { getQueuedTransactionsCount } = useQRStore();
  const { unreadCount } = useNotificationStore();
  const {
    balance,
    recentTransactions,
    banners,
    stats,
    isLoading,
    refreshDashboard,
  } = useDashboard();

  const handleRefresh = async () => {
    await refreshDashboard();
  };

  const handleBannerPress = (banner: PromotionalBanner) => {
    logger.info('Banner pressed:', banner.id, banner.actionUrl);

    if (!banner.actionUrl) {
      return;
    }

    // Map actionUrl to actual route names
    const routeMap: Record<string, string> = {
      '/savings': 'Savings',
      '/topup': 'TopUp',
      '/top-up': 'TopUp',
      '/marketplace': 'Marketplace',
      '/fit-challenge': 'FitChallenge',
      '/qr-scanner': 'QRScanner',
      '/profile': 'Profile',
      '/health': 'Health',
    };

    const routeName = routeMap[banner.actionUrl.toLowerCase()];

    if (routeName) {
      try {
        (navigation as any).navigate(routeName);
      } catch (error) {
        logger.error('Navigation error:', error);
      }
    } else {
      logger.warn('Unknown banner actionUrl:', banner.actionUrl);
    }
  };

  const quickActions = [
    {
      icon: 'wallet-plus',
      label: 'Top Up',
      onPress: () => (navigation as any).navigate('TopUp', {}),
      color: theme.colors.primary,
    },
    {
      icon: 'history',
      label: 'Riwayat',
      onPress: () => navigation.navigate('Savings'),
    },
    {
      icon: 'qrcode-scan',
      label: 'Scan QR',
      onPress: () => navigation.navigate('QRScanner'),
    },
    {
      icon: 'shopping',
      label: 'Belanja',
      onPress: () => navigation.navigate('Marketplace'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {isLoading && !balance ? (
        // Show skeleton on initial load
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <DashboardSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isLoading && !!balance} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Selamat Datang,
              </Text>
              <Text variant="headlineSmall" style={[styles.userName, { color: theme.colors.onSurface }]}>
                {user?.name || 'Member Sinoman'}
              </Text>
            </View>

            {/* Notification Bell */}
            <View style={styles.headerActions}>
              <IconButton
                icon="bell"
                size={24}
                onPress={() => navigation.navigate('Notifications')}
                style={styles.notificationButton}
              />
              {unreadCount > 0 && (
                <Badge
                  size={18}
                  style={styles.notificationBadge}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </View>
          </View>

          {/* Offline Indicator */}
          {(isOffline || getQueuedTransactionsCount() > 0) && (
            <View style={styles.offlineSection}>
              <OfflineIndicator />
            </View>
          )}

          {/* Balance Card */}
          <View style={styles.section}>
            <BalanceCard
              balance={balance}
              isLoading={false}
              onPress={() => navigation.navigate('Savings')}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Aksi Cepat
            </Text>
            <View style={styles.quickActions}>
              {quickActions.map((action, index) => (
                <QuickActionButton
                  key={index}
                  icon={action.icon}
                  label={action.label}
                  onPress={action.onPress}
                  color={action.color}
                />
              ))}
            </View>
          </View>

          {/* Promotional Banner Carousel */}
          {banners.length > 0 && (
            <View style={styles.section}>
              <BannerCarousel banners={banners} onBannerPress={handleBannerPress} />
            </View>
          )}

          {/* Recent Transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Transaksi Terakhir
              </Text>
              {recentTransactions.length > 0 && (
                <Text
                  variant="bodyMedium"
                  style={[styles.seeAll, { color: theme.colors.primary }]}
                  onPress={() => navigation.navigate('Savings')}
                >
                  Lihat Semua
                </Text>
              )}
            </View>

            {recentTransactions.length > 0 ? (
              <View style={[styles.transactionList, { backgroundColor: theme.colors.surface }]}>
                {recentTransactions.map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    <TransactionItem transaction={transaction} />
                    {index < recentTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </View>
            ) : (
              <EmptyState
                icon="receipt-text-outline"
                title="Belum Ada Transaksi"
                description="Transaksi Anda akan muncul di sini"
                actionLabel="Mulai Top Up"
                onAction={() => (navigation as any).navigate('TopUp', {})}
              />
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  userName: {
    fontWeight: '700',
    marginTop: 4,
  },
  headerActions: {
    position: 'relative',
  },
  notificationButton: {
    margin: 0,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  seeAll: {
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  offlineSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  transactionList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
});