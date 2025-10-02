import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Searchbar, Chip, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, SavingsType, Transaction } from '@types';
import { useSavingsStore } from '@store/savingsStore';
import { TransactionItem } from '@components/common/TransactionItem';
import { EmptyState } from '@components/common/EmptyState';
import { TransactionHistorySkeleton } from '@components/skeletons';
import { useAnalytics } from '@hooks';

type TransactionHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TransactionHistory'>;
type TransactionHistoryScreenRouteProp = RouteProp<RootStackParamList, 'TransactionHistory'>;

interface TransactionHistoryScreenProps {
  navigation: TransactionHistoryScreenNavigationProp;
  route: TransactionHistoryScreenRouteProp;
}

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { transactions, isLoading, currentPage, hasMore, fetchTransactions } = useSavingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SavingsType | 'all'>(
    route?.params?.savingsType || 'all'
  );
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'success' | 'failed'>('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Track analytics
  useAnalytics('TransactionHistory');

  useEffect(() => {
    const loadData = async () => {
      await fetchTransactions(1);
      setIsInitialLoad(false);
    };
    loadData();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    if (selectedType !== 'all' && transaction.savingsType !== selectedType) return false;
    if (selectedStatus !== 'all' && transaction.status !== selectedStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(query) ||
        transaction.referenceId?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchTransactions(currentPage + 1);
    }
  };

  const handleRefresh = () => {
    fetchTransactions(1);
  };

  if (isLoading && isInitialLoad) {
    return <TransactionHistorySkeleton />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Riwayat Transaksi
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Cari transaksi..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <Text variant="labelSmall" style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}>
          Jenis Simpanan:
        </Text>
        <View style={styles.filterChips}>
          <Chip
            selected={selectedType === 'all'}
            onPress={() => setSelectedType('all')}
            style={styles.chip}
          >
            Semua
          </Chip>
          <Chip
            selected={selectedType === SavingsType.POKOK}
            onPress={() => setSelectedType(SavingsType.POKOK)}
            style={styles.chip}
          >
            Pokok
          </Chip>
          <Chip
            selected={selectedType === SavingsType.WAJIB}
            onPress={() => setSelectedType(SavingsType.WAJIB)}
            style={styles.chip}
          >
            Wajib
          </Chip>
          <Chip
            selected={selectedType === SavingsType.SUKARELA}
            onPress={() => setSelectedType(SavingsType.SUKARELA)}
            style={styles.chip}
          >
            Sukarela
          </Chip>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text variant="labelSmall" style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}>
          Status:
        </Text>
        <View style={styles.filterChips}>
          <Chip
            selected={selectedStatus === 'all'}
            onPress={() => setSelectedStatus('all')}
            style={styles.chip}
          >
            Semua
          </Chip>
          <Chip
            selected={selectedStatus === 'success'}
            onPress={() => setSelectedStatus('success')}
            style={styles.chip}
          >
            Sukses
          </Chip>
          <Chip
            selected={selectedStatus === 'pending'}
            onPress={() => setSelectedStatus('pending')}
            style={styles.chip}
          >
            Pending
          </Chip>
          <Chip
            selected={selectedStatus === 'failed'}
            onPress={() => setSelectedStatus('failed')}
            style={styles.chip}
          >
            Gagal
          </Chip>
        </View>
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={isLoading && currentPage === 1}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-text-outline"
            title="Tidak Ada Transaksi"
            description="Belum ada transaksi yang sesuai dengan filter"
          />
        }
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
  headerTitle: {
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    elevation: 0,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 0,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
});
