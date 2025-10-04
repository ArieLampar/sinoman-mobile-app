import React from 'react';
import { View, StyleSheet } from 'react-native';


export const TransactionHistorySkeleton: React.FC = () => {
  return (
    <View>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.title} />
          <View style={styles.filterButton} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar} />

        {/* Date Range Filter */}
        <View style={styles.dateRange}>
          <View style={styles.dateButton} />
          <View style={styles.dateButton} />
        </View>

        {/* Category Filters */}
        <View style={styles.filters}>
          <View style={styles.filterChip} />
          <View style={styles.filterChip} />
          <View style={styles.filterChip} />
        </View>

        {/* Transaction List */}
        <View style={styles.transactionList}>
          {/* Date Group Header */}
          <View style={styles.dateHeader} />

          {/* Transaction Items */}
          <View style={styles.transactionItem}>
            <View style={styles.transactionIcon} />
            <View style={styles.transactionDetails}>
              <View style={styles.transactionTitle} />
              <View style={styles.transactionSubtitle} />
            </View>
            <View style={styles.transactionAmount} />
          </View>

          <View style={styles.transactionItem}>
            <View style={styles.transactionIcon} />
            <View style={styles.transactionDetails}>
              <View style={styles.transactionTitle} />
              <View style={styles.transactionSubtitle} />
            </View>
            <View style={styles.transactionAmount} />
          </View>

          {/* Date Group Header */}
          <View style={styles.dateHeader} />

          <View style={styles.transactionItem}>
            <View style={styles.transactionIcon} />
            <View style={styles.transactionDetails}>
              <View style={styles.transactionTitle} />
              <View style={styles.transactionSubtitle} />
            </View>
            <View style={styles.transactionAmount} />
          </View>

          <View style={styles.transactionItem}>
            <View style={styles.transactionIcon} />
            <View style={styles.transactionDetails}>
              <View style={styles.transactionTitle} />
              <View style={styles.transactionSubtitle} />
            </View>
            <View style={styles.transactionAmount} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    width: 180,
    height: 28,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchBar: {
    height: 48,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  dateButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterChip: {
    width: 80,
    height: 36,
    borderRadius: 18,
  },
  transactionList: {
    gap: 8,
  },
  dateHeader: {
    width: 120,
    height: 20,
    marginTop: 12,
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 72,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionTitle: {
    width: '70%',
    height: 16,
    marginBottom: 6,
  },
  transactionSubtitle: {
    width: '50%',
    height: 14,
  },
  transactionAmount: {
    width: 80,
    height: 20,
  },
});
