import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export const NotificationsSkeleton: React.FC = () => {
  return (
    <SkeletonPlaceholder borderRadius={8}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.title} />
          <View style={styles.markAllButton} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filters}>
          <View style={styles.filterChip} />
          <View style={styles.filterChip} />
          <View style={styles.filterChip} />
        </View>

        {/* Notification List */}
        <View style={styles.notificationList}>
          {/* Notification Items */}
          <View style={styles.notificationItem}>
            <View style={styles.notificationIcon} />
            <View style={styles.notificationContent}>
              <View style={styles.notificationTitle} />
              <View style={styles.notificationMessage} />
              <View style={styles.notificationTime} />
            </View>
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationIcon} />
            <View style={styles.notificationContent}>
              <View style={styles.notificationTitle} />
              <View style={styles.notificationMessage} />
              <View style={styles.notificationTime} />
            </View>
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationIcon} />
            <View style={styles.notificationContent}>
              <View style={styles.notificationTitle} />
              <View style={styles.notificationMessage} />
              <View style={styles.notificationTime} />
            </View>
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationIcon} />
            <View style={styles.notificationContent}>
              <View style={styles.notificationTitle} />
              <View style={styles.notificationMessage} />
              <View style={styles.notificationTime} />
            </View>
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
