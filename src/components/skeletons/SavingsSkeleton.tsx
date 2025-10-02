import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export const SavingsSkeleton: React.FC = () => {
  return (
    <SkeletonPlaceholder borderRadius={8}>
      <View style={styles.container}>
        {/* Balance Card */}
        <View style={styles.balanceCard} />

        {/* Tabs */}
        <View style={styles.tabs}>
          <View style={styles.tab} />
          <View style={styles.tab} />
          <View style={styles.tab} />
        </View>

        {/* Chart */}
        <View style={styles.chart} />

        {/* Section Title */}
        <View style={styles.sectionTitle} />

        {/* Transaction List */}
        <View style={styles.transactionList}>
          <View style={styles.transactionItem} />
          <View style={styles.transactionItem} />
          <View style={styles.transactionItem} />
          <View style={styles.transactionItem} />
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  balanceCard: {
    height: 140,
    borderRadius: 12,
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  tab: {
    width: 100,
    height: 36,
    borderRadius: 18,
  },
  chart: {
    height: 200,
    borderRadius: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    width: 150,
    height: 20,
    marginBottom: 16,
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    height: 72,
    borderRadius: 8,
    marginBottom: 12,
  },
});
