import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from 'react-native-paper';

export const DashboardSkeleton: React.FC = () => {
  const theme = useTheme();
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  const skeletonStyle = {
    backgroundColor: theme.colors.surfaceVariant,
    opacity,
  };

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View>
          <Animated.View style={[styles.greetingText, skeletonStyle]} />
          <Animated.View style={[styles.nameText, skeletonStyle]} />
        </View>
      </View>

      {/* Balance Card Skeleton */}
      <Animated.View style={[styles.balanceCard, skeletonStyle]} />

      {/* Quick Actions Skeleton */}
      <View style={styles.section}>
        <Animated.View style={[styles.sectionTitle, skeletonStyle]} />
        <View style={styles.quickActions}>
          <Animated.View style={[styles.quickAction, skeletonStyle]} />
          <Animated.View style={[styles.quickAction, skeletonStyle]} />
          <Animated.View style={[styles.quickAction, skeletonStyle]} />
          <Animated.View style={[styles.quickAction, skeletonStyle]} />
        </View>
      </View>

      {/* Banner Skeleton */}
      <Animated.View style={[styles.banner, skeletonStyle]} />

      {/* Transactions Skeleton */}
      <View style={styles.section}>
        <Animated.View style={[styles.sectionTitle, skeletonStyle]} />
        <View style={styles.transactionList}>
          <Animated.View style={[styles.transactionItem, skeletonStyle]} />
          <Animated.View style={[styles.transactionItem, skeletonStyle]} />
          <Animated.View style={[styles.transactionItem, skeletonStyle]} />
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
