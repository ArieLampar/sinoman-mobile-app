/**
 * NotificationsScreen
 * Displays list of notifications with mark as read, delete, and navigation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  IconButton,
  Chip,
  Divider,
  Button,
  useTheme,
  Menu,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationStore } from '@store/notificationStore';
import { EmptyState } from '@components/common/EmptyState';
import { NotificationsSkeleton } from '@components/skeletons';
import { useAnalytics } from '@hooks';
import type { PushNotification, NotificationType } from '@types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@types';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  // Track analytics
  useAnalytics('Notifications');

  const {
    notifications,
    unreadCount,
    isLoading,
    isInitialized,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationStore();

  const [selectedCategory, setSelectedCategory] = useState<'all' | NotificationType>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Track initial load completion
  useEffect(() => {
    if (isInitialized || notifications.length > 0) {
      setIsInitialLoad(false);
    }
  }, [isInitialized, notifications.length]);

  // Filter notifications based on selected category
  const filteredNotifications = notifications.filter(
    (n) => selectedCategory === 'all' || n.type === selectedCategory
  );

  // Helper: Get icon for notification type
  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'transaction':
        return 'cash';
      case 'balance_update':
        return 'wallet';
      case 'order_status':
        return 'package-variant';
      case 'promotion':
        return 'sale';
      case 'fit_challenge':
        return 'run';
      case 'system':
        return 'information';
      default:
        return 'bell';
    }
  };

  // Helper: Get color for notification type
  const getNotificationColor = (type: string): string => {
    switch (type) {
      case 'transaction':
        return '#059669';
      case 'balance_update':
        return '#3B82F6';
      case 'order_status':
        return '#F59E0B';
      case 'promotion':
        return '#EF4444';
      case 'fit_challenge':
        return '#8B5CF6';
      case 'system':
        return '#6B7280';
      default:
        return theme.colors.primary;
    }
  };

  // Helper: Format timestamp to relative time
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSeconds < 60) return 'Baru saja';
    else if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
    else if (diffHours < 24) return `${diffHours} jam yang lalu`;
    else if (diffDays < 7) return `${diffDays} hari yang lalu`;
    else if (diffWeeks < 4) return `${diffWeeks} minggu yang lalu`;
    else if (diffMonths < 12) return `${diffMonths} bulan yang lalu`;
    else return date.toLocaleDateString('id-ID');
  };

  // Handle notification press
  const handleNotificationPress = (notification: PushNotification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'transaction':
        // Navigate to TransactionHistory screen (existing route)
        if (notification.data?.savingsType) {
          navigation.navigate('TransactionHistory', {
            savingsType: notification.data.savingsType,
          });
        } else {
          // Fallback to Savings tab
          navigation.navigate('Main', { screen: 'Savings' });
        }
        break;

      case 'balance_update':
        // Navigate to Savings tab
        navigation.navigate('Main', { screen: 'Savings' });
        break;

      case 'order_status':
        // Navigate to OrderConfirmation if orderId exists, otherwise Marketplace tab
        if (notification.data?.orderId && notification.data?.order) {
          navigation.navigate('OrderConfirmation', {
            orderId: notification.data.orderId,
            order: notification.data.order,
          });
        } else {
          navigation.navigate('Main', { screen: 'Marketplace' });
        }
        break;

      case 'fit_challenge':
        // Navigate to FitChallenge screen (existing route)
        navigation.navigate('FitChallenge');
        break;

      case 'promotion':
        // Navigate to Marketplace tab
        navigation.navigate('Main', { screen: 'Marketplace' });
        break;

      case 'system':
        // Navigate to Dashboard tab as fallback
        navigation.navigate('Main', { screen: 'Dashboard' });
        break;

      default:
        // Fallback to Dashboard tab
        navigation.navigate('Main', { screen: 'Dashboard' });
    }
  };

  // Handle delete notification
  const handleDelete = (id: string) => {
    Alert.alert(
      'Hapus Notifikasi',
      'Apakah Anda yakin ingin menghapus notifikasi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deleteNotification(id),
        },
      ]
    );
  };

  // Handle clear all
  const handleClearAll = () => {
    Alert.alert(
      'Hapus Semua Notifikasi',
      'Apakah Anda yakin ingin menghapus semua notifikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: () => clearAll(),
        },
      ]
    );
  };

  // Show skeleton on initial load
  if (isLoading && isInitialLoad) {
    return <NotificationsSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium" style={styles.title}>
            Notifikasi
          </Text>
          {unreadCount > 0 && (
            <Text variant="bodySmall" style={styles.unreadText}>
              {unreadCount} belum dibaca
            </Text>
          )}
        </View>

        {/* Menu Button */}
        {notifications.length > 0 && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            {unreadCount > 0 && (
              <Menu.Item
                onPress={() => {
                  markAllAsRead();
                  setMenuVisible(false);
                }}
                title="Tandai Semua Dibaca"
                leadingIcon="check-all"
              />
            )}
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleClearAll();
              }}
              title="Hapus Semua"
              leadingIcon="delete-sweep"
            />
          </Menu>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <Chip
          selected={selectedCategory === 'all'}
          onPress={() => setSelectedCategory('all')}
          style={styles.filterChip}
        >
          Semua
        </Chip>
        <Chip
          selected={selectedCategory === 'transaction'}
          onPress={() => setSelectedCategory('transaction')}
          icon="cash"
          style={styles.filterChip}
        >
          Transaksi
        </Chip>
        <Chip
          selected={selectedCategory === 'balance_update'}
          onPress={() => setSelectedCategory('balance_update')}
          icon="wallet"
          style={styles.filterChip}
        >
          Saldo
        </Chip>
        <Chip
          selected={selectedCategory === 'order_status'}
          onPress={() => setSelectedCategory('order_status')}
          icon="package-variant"
          style={styles.filterChip}
        >
          Pesanan
        </Chip>
        <Chip
          selected={selectedCategory === 'promotion'}
          onPress={() => setSelectedCategory('promotion')}
          icon="sale"
          style={styles.filterChip}
        >
          Promo
        </Chip>
        <Chip
          selected={selectedCategory === 'fit_challenge'}
          onPress={() => setSelectedCategory('fit_challenge')}
          icon="run"
          style={styles.filterChip}
        >
          Fit Challenge
        </Chip>
      </ScrollView>

      {/* Notification List */}
      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleNotificationPress(item)}
              style={[
                styles.notificationItem,
                !item.read && styles.unreadItem,
              ]}
            >
              <View style={styles.notificationContent}>
                {/* Icon */}
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: getNotificationColor(item.type) + '20' },
                  ]}
                >
                  <IconButton
                    icon={getNotificationIcon(item.type)}
                    iconColor={getNotificationColor(item.type)}
                    size={24}
                    style={styles.icon}
                  />
                </View>

                {/* Content */}
                <View style={styles.textContent}>
                  <View style={styles.titleRow}>
                    <Text
                      variant="titleSmall"
                      style={[
                        styles.notificationTitle,
                        !item.read && styles.unreadTitle,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text
                    variant="bodyMedium"
                    style={styles.notificationBody}
                    numberOfLines={2}
                  >
                    {item.message}
                  </Text>
                  <Text variant="bodySmall" style={styles.timestamp}>
                    {formatTimestamp(item.createdAt)}
                  </Text>
                </View>

                {/* Delete Button */}
                <IconButton
                  icon="delete-outline"
                  size={20}
                  onPress={() => handleDelete(item.id)}
                  style={styles.deleteButton}
                />
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="bell-outline"
            title={
              selectedCategory === 'all'
                ? 'Belum Ada Notifikasi'
                : 'Tidak Ada Notifikasi'
            }
            description={
              selectedCategory === 'all'
                ? 'Notifikasi Anda akan muncul di sini'
                : 'Tidak ada notifikasi untuk kategori ini'
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontWeight: '700',
  },
  unreadText: {
    color: '#6B7280',
    marginTop: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
  },
  unreadItem: {
    backgroundColor: '#F0FDF4',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    borderRadius: 12,
    marginRight: 12,
  },
  icon: {
    margin: 0,
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    color: '#111827',
  },
  unreadTitle: {
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
    marginLeft: 8,
  },
  notificationBody: {
    color: '#6B7280',
    marginBottom: 4,
  },
  timestamp: {
    color: '#9CA3AF',
  },
  deleteButton: {
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
