import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { Text, useTheme, SegmentedButtons, FAB, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabScreenProps, SavingsType } from '@types';
import { useSavingsStore } from '@store/savingsStore';
import { BalanceCard } from '@components/dashboard/BalanceCard';
import { MonthlyChart } from '@components/savings/MonthlyChart';
import { TransactionItem } from '@components/common/TransactionItem';
import { EmptyState } from '@components/common/EmptyState';
import { SavingsSkeleton } from '@components/skeletons';
import { formatCurrency } from '@utils/formatters';
import { useAnalytics } from '@hooks';

export const SavingsScreen: React.FC<MainTabScreenProps<'Savings'>> = ({ navigation }) => {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<SavingsType>(SavingsType.SUKARELA);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Track analytics
  useAnalytics('Savings');

  const {
    balance,
    transactions,
    chartData,
    isLoading,
    currentPage,
    hasMore,
    fetchBalance,
    fetchTransactions,
    fetchChartData,
    refreshData,
  } = useSavingsStore();

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchBalance(),
        fetchTransactions(1),
        fetchChartData(selectedType)
      ]);
      setIsInitialLoad(false);
    };
    loadData();
  }, [fetchBalance, fetchTransactions]);

  useEffect(() => {
    fetchChartData(selectedType);
  }, [selectedType, fetchChartData]);

  const handleRefresh = async () => {
    await refreshData();
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchTransactions(currentPage + 1);
    }
  };

  const getSelectedBalance = () => {
    if (!balance) return 0;
    switch (selectedType) {
      case SavingsType.POKOK:
        return balance.pokok;
      case SavingsType.WAJIB:
        return balance.wajib;
      case SavingsType.SUKARELA:
        return balance.sukarela;
      default:
        return 0;
    }
  };

  const getSelectedLabel = () => {
    switch (selectedType) {
      case SavingsType.POKOK:
        return 'Simpanan Pokok';
      case SavingsType.WAJIB:
        return 'Simpanan Wajib';
      case SavingsType.SUKARELA:
        return 'Simpanan Sukarela';
      default:
        return '';
    }
  };

  const filteredTransactions = transactions.filter(
    (t) => t.savingsType === selectedType
  );

  if (isLoading && isInitialLoad) {
    return <SavingsSkeleton />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Simpanan
        </Text>
      </View>

      {/* Balance Overview */}
      <View style={styles.balanceSection}>
        <BalanceCard balance={balance} isLoading={isLoading} />
      </View>

      {/* Tabs */}
      <View style={styles.tabSection}>
        <SegmentedButtons
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as SavingsType)}
          buttons={[
            {
              value: SavingsType.POKOK,
              label: 'Pokok',
            },
            {
              value: SavingsType.WAJIB,
              label: 'Wajib',
            },
            {
              value: SavingsType.SUKARELA,
              label: 'Sukarela',
            },
          ]}
          style={styles.tabs}
        />
      </View>

      {/* Selected Balance */}
      <View style={styles.selectedBalance}>
        <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {getSelectedLabel()}
        </Text>
        <Text variant="headlineLarge" style={[styles.balanceAmount, { color: theme.colors.primary }]}>
          {formatCurrency(getSelectedBalance())}
        </Text>
      </View>

      {/* Monthly Chart */}
      {chartData && chartData.labels.length > 0 && (
        <View style={styles.chartSection}>
          <MonthlyChart data={chartData} title={`Pertumbuhan ${getSelectedLabel()}`} />
        </View>
      )}

      {/* Transaction List */}
      <View style={styles.transactionSection}>
        <View style={styles.transactionHeader}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Riwayat Transaksi
          </Text>
          {filteredTransactions.length > 0 && (
            <Text
              variant="bodyMedium"
              style={[styles.seeAll, { color: theme.colors.primary }]}
              onPress={() => (navigation as any).navigate('TransactionHistory', { savingsType: selectedType })}
            >
              Lihat Semua
            </Text>
          )}
        </View>

        {isLoading && filteredTransactions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Memuat transaksi...
            </Text>
          </View>
        ) : filteredTransactions.length > 0 ? (
          <FlatList
            data={filteredTransactions}
            renderItem={({ item }) => <TransactionItem transaction={item} />}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <Divider />}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
            }
            style={[styles.transactionList, { backgroundColor: theme.colors.surface }]}
            contentContainerStyle={styles.transactionListContent}
          />
        ) : (
          <EmptyState
            icon="receipt-text-outline"
            title="Belum Ada Transaksi"
            description={`Transaksi ${getSelectedLabel().toLowerCase()} Anda akan muncul di sini`}
            actionLabel="Top Up Sekarang"
            onAction={() => {
              (navigation as any).navigate('TopUp', { savingsType: selectedType });
            }}
          />
        )}
      </View>

      {/* FAB for Top Up */}
      <FAB
        icon="plus"
        label="Top Up"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          (navigation as any).navigate('TopUp', { savingsType: selectedType });
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontWeight: '700',
  },
  balanceSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabs: {
    width: '100%',
  },
  selectedBalance: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  balanceAmount: {
    fontWeight: '700',
  },
  chartSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  transactionSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transactionHeader: {
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
  transactionList: {
    flex: 1,
    borderRadius: 12,
  },
  transactionListContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});