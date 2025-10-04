import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from 'react-native-paper';

export const NotificationsSkeleton: React.FC = () => {
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
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={[styles.title, skeletonStyle]} />
          <Animated.View style={[styles.markAllButton, skeletonStyle]} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filters}>
          <Animated.View style={[styles.filterChip, skeletonStyle]} />
          <Animated.View style={[styles.filterChip, skeletonStyle]} />
          <Animated.View style={[styles.filterChip, skeletonStyle]} />
        </View>

        {/* Notification List */}
        <View style={styles.notificationList}>
          {/* Notification Items */}
          <View style={styles.notificationItem}>
            <Animated.View style={[styles.notificationIcon, skeletonStyle]} />
            <View style={styles.notificationContent}>
              <Animated.View style={[styles.notificationTitle, skeletonStyle]} />
              <Animated.View style={[styles.notificationMessage, skeletonStyle]} />
              <Animated.View style={[styles.notificationTime, skeletonStyle]} />
            </View>
          </View>

          <View style={styles.notificationItem}>
            <Animated.View style={[styles.notificationIcon, skeletonStyle]} />
            <View style={styles.notificationContent}>
              <Animated.View style={[styles.notificationTitle, skeletonStyle]} />
              <Animated.View style={[styles.notificationMessage, skeletonStyle]} />
              <Animated.View style={[styles.notificationTime, skeletonStyle]} />
            </View>
          </View>

          <View style={styles.notificationItem}>
            <Animated.View style={[styles.notificationIcon, skeletonStyle]} />
            <View style={styles.notificationContent}>
              <Animated.View style={[styles.notificationTitle, skeletonStyle]} />
              <Animated.View style={[styles.notificationMessage, skeletonStyle]} />
              <Animated.View style={[styles.notificationTime, skeletonStyle]} />
            </View>
          </View>

          <View style={styles.notificationItem}>
            <Animated.View style={[styles.notificationIcon, skeletonStyle]} />
            <View style={styles.notificationContent}>
              <Animated.View style={[styles.notificationTitle, skeletonStyle]} />
              <Animated.View style={[styles.notificationMessage, skeletonStyle]} />
              <Animated.View style={[styles.notificationTime, skeletonStyle]} />
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
    marginBottom: 20,
  },
  title: {
    width: 150,
    height: 28,
  },
  markAllButton: {
    width: 100,
    height: 32,
    borderRadius: 16,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterChip: {
    width: 90,
    height: 36,
    borderRadius: 18,
  },
  notificationList: {
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 80,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    width: '80%',
    height: 18,
    marginBottom: 8,
  },
  notificationMessage: {
    width: '100%',
    height: 14,
    marginBottom: 6,
  },
  notificationTime: {
    width: 80,
    height: 12,
  },
});
