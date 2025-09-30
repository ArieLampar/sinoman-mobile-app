import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '@types';
import { useDashboardStore } from '@store/dashboardStore';
import { useAuthStore } from '@store/authStore';
import { BalanceCard } from '@components/dashboard/BalanceCard';
import { QuickActionButton } from '@components/dashboard/QuickActionButton';
import { TransactionItem } from '@components/common/TransactionItem';
import { EmptyState } from '@components/common/EmptyState';

export const DashboardScreen: React.FC<MainTabScreenProps<'Dashboard'>> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const {
    balance,
    recentTransactions,
    stats,
    isLoading,
    fetchDashboardData,
    refreshDashboard,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    await refreshDashboard();
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
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
        </View>

        {/* Balance Card */}
        <View style={styles.section}>
          <BalanceCard
            balance={balance}
            isLoading={isLoading}
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

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Memuat transaksi...
              </Text>
            </View>
          ) : recentTransactions.length > 0 ? (
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
  transactionList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
});