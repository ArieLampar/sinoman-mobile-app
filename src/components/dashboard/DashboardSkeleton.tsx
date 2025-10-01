import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useTheme } from 'react-native-paper';

export const DashboardSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <SkeletonPlaceholder
      backgroundColor={theme.colors.surfaceVariant}
      highlightColor={theme.colors.surface}
      speed={1200}
    >
      <View style={styles.container}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <View>
            <View style={styles.greetingText} />
            <View style={styles.nameText} />
          </View>
        </View>

        {/* Balance Card Skeleton */}
        <View style={styles.balanceCard} />

        {/* Quick Actions Skeleton */}
        <View style={styles.section}>
          <View style={styles.sectionTitle} />
          <View style={styles.quickActions}>
            <View style={styles.quickAction} />
            <View style={styles.quickAction} />
            <View style={styles.quickAction} />
            <View style={styles.quickAction} />
          </View>
        </View>

        {/* Banner Skeleton */}
        <View style={styles.banner} />

        {/* Transactions Skeleton */}
        <View style={styles.section}>
          <View style={styles.sectionTitle} />
          <View style={styles.transactionList}>
            <View style={styles.transactionItem} />
            <View style={styles.transactionItem} />
            <View style={styles.transactionItem} />
          </View>
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  greetingText: {
    width: 120,
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  nameText: {
    width: 180,
    height: 24,
    borderRadius: 4,
  },
  balanceCard: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    width: 140,
    height: 20,
    borderRadius: 4,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAction: {
    width: 80,
    height: 100,
    borderRadius: 12,
  },
  banner: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 24,
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    width: '100%',
    height: 72,
    borderRadius: 12,
  },
});
