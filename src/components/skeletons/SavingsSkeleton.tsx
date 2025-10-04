import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from 'react-native-paper';

export const SavingsSkeleton: React.FC = () => {
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
      {/* Balance Card */}
      <Animated.View style={[styles.balanceCard, skeletonStyle]} />

      {/* Tabs */}
      <View style={styles.tabs}>
        <Animated.View style={[styles.tab, skeletonStyle]} />
        <Animated.View style={[styles.tab, skeletonStyle]} />
        <Animated.View style={[styles.tab, skeletonStyle]} />
      </View>

      {/* Chart */}
      <Animated.View style={[styles.chart, skeletonStyle]} />

      {/* Section Title */}
      <Animated.View style={[styles.sectionTitle, skeletonStyle]} />

      {/* Transaction List */}
      <View style={styles.transactionList}>
        <Animated.View style={[styles.transactionItem, skeletonStyle]} />
        <Animated.View style={[styles.transactionItem, skeletonStyle]} />
        <Animated.View style={[styles.transactionItem, skeletonStyle]} />
        <Animated.View style={[styles.transactionItem, skeletonStyle]} />
      </View>
    </View>
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
