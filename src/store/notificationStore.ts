/**
 * Notification Store
 * Manages notification state, settings, and subscriptions
 */

import { create } from 'zustand';
import { logger } from '@utils/logger';
import type {
  PushNotification,
  NotificationSettings,
  NotificationPermissionStatus,
} from '@types/notification.types';
import {
  initializePushNotifications,
  cleanupPushNotifications,
  requestNotificationPermissions,
  getBadgeCount,
  setBadgeCount,
  clearAllNotifications,
} from '@services/notificationService';
import {
  initializeRealtimeSubscriptions,
  cleanupRealtimeSubscriptions,
} from '@services/realtimeService';

interface NotificationState {
  // State
  notifications: PushNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  permissionStatus: NotificationPermissionStatus | null;
  isLoading: boolean;
  error: string | null;
  pushToken: string | null;
  isInitialized: boolean;

  // Actions
  initialize: (userId: string) => Promise<boolean>;
  cleanup: (userId: string) => Promise<void>;
  requestPermissions: () => Promise<NotificationPermissionStatus>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  addNotification: (notification: PushNotification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => Promise<void>;
  updateBadgeCount: () => Promise<void>;
  setError: (error: string | null) => void;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  transactions: true,
  balanceUpdates: true,
  orderUpdates: true,
  promotions: true,
  fitChallenge: true,
  system: true,
  soundEnabled: true,
  vibrationEnabled: true,
  badgeEnabled: true,
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial State
  notifications: [],
  unreadCount: 0,
  settings: DEFAULT_SETTINGS,
  permissionStatus: null,
  isLoading: false,
  error: null,
  pushToken: null,
  isInitialized: false,

  // Initialize notifications
  initialize: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      logger.info('Initializing notification store', { userId });

      // Request permissions first
      const permissionStatus = await requestNotificationPermissions();
      set({ permissionStatus });

      if (!permissionStatus.granted) {
        logger.warn('Notification permissions not granted');
        set({ isLoading: false });
        return false;
      }

      // Initialize push notifications
      const pushInitialized = await initializePushNotifications(userId);

      if (!pushInitialized) {
        logger.warn('Failed to initialize push notifications');
        set({ isLoading: false });
        return false;
      }

      // Initialize realtime subscriptions
      initializeRealtimeSubscriptions(userId, {
        onBalanceUpdate: async (payload) => {
          logger.info('Balance updated via realtime', payload);

          // Refresh balance data in stores
          const { useDashboardStore } = await import('./dashboardStore');
          const { useSavingsStore } = await import('./savingsStore');

          await Promise.all([
            useDashboardStore.getState().fetchDashboardData(),
            useSavingsStore.getState().fetchBalance(),
          ]);

          // Add in-app notification
          const notification: PushNotification = {
            id: `balance-${Date.now()}`,
            type: 'balance_update',
            title: 'Saldo Diperbarui',
            message: 'Saldo Anda telah diperbarui',
            data: payload,
            read: false,
            createdAt: new Date().toISOString(),
            userId,
          };

          get().addNotification(notification);
        },
        onTransaction: (payload) => {
          logger.info('New transaction via realtime', payload);

          const notification: PushNotification = {
            id: `transaction-${Date.now()}`,
            type: 'transaction',
            title: 'Transaksi Baru',
            message: 'Transaksi Anda telah berhasil',
            data: payload,
            read: false,
            createdAt: new Date().toISOString(),
            userId,
          };

          get().addNotification(notification);
        },
        onOrderUpdate: (payload) => {
          logger.info('Order updated via realtime', payload);

          const notification: PushNotification = {
            id: `order-${Date.now()}`,
            type: 'order_status',
            title: 'Status Pesanan Diperbarui',
            message: `Pesanan Anda ${payload.new.status}`,
            data: payload,
            read: false,
            createdAt: new Date().toISOString(),
            userId,
          };

          get().addNotification(notification);
        },
        onNotification: (payload) => {
          logger.info('New notification via realtime', payload);

          const notification: PushNotification = {
            id: payload.new.id,
            type: payload.new.type,
            title: payload.new.title,
            message: payload.new.message,
            data: payload.new.data,
            read: false,
            createdAt: payload.new.created_at,
            userId,
          };

          get().addNotification(notification);
        },
        onFitChallengeUpdate: (payload) => {
          logger.info('Fit challenge updated via realtime', payload);

          const notification: PushNotification = {
            id: `fit-${Date.now()}`,
            type: 'fit_challenge',
            title: 'Fit Challenge Update',
            message: 'Progress Fit Challenge Anda telah diperbarui',
            data: payload,
            read: false,
            createdAt: new Date().toISOString(),
            userId,
          };

          get().addNotification(notification);
        },
      });

      set({
        isInitialized: true,
        isLoading: false,
      });

      logger.info('Notification store initialized successfully');
      return true;
    } catch (error: any) {
      logger.error('Failed to initialize notification store', error);
      set({
        error: error.message || 'Failed to initialize notifications',
        isLoading: false,
      });
      return false;
    }
  },

  // Cleanup notifications
  cleanup: async (userId: string) => {
    try {
      logger.info('Cleaning up notification store', { userId });

      // Cleanup push notifications
      await cleanupPushNotifications(userId);

      // Cleanup realtime subscriptions
      await cleanupRealtimeSubscriptions();

      // Reset state
      set({
        notifications: [],
        unreadCount: 0,
        permissionStatus: null,
        pushToken: null,
        isInitialized: false,
        error: null,
      });

      logger.info('Notification store cleaned up');
    } catch (error: any) {
      logger.error('Failed to cleanup notification store', error);
      set({ error: error.message || 'Failed to cleanup notifications' });
    }
  },

  // Request permissions
  requestPermissions: async () => {
    try {
      set({ isLoading: true, error: null });
      const permissionStatus = await requestNotificationPermissions();
      set({ permissionStatus, isLoading: false });
      return permissionStatus;
    } catch (error: any) {
      logger.error('Failed to request permissions', error);
      set({
        error: error.message || 'Failed to request permissions',
        isLoading: false,
      });
      throw error;
    }
  },

  // Update settings
  updateSettings: async (newSettings: Partial<NotificationSettings>) => {
    try {
      const currentSettings = get().settings;
      const updatedSettings = { ...currentSettings, ...newSettings };

      // TODO: Save to backend/storage
      // await saveNotificationSettings(updatedSettings);

      set({ settings: updatedSettings });
      logger.info('Notification settings updated', updatedSettings);
    } catch (error: any) {
      logger.error('Failed to update notification settings', error);
      set({ error: error.message || 'Failed to update settings' });
    }
  },

  // Add notification
  addNotification: (notification: PushNotification) => {
    const { notifications, unreadCount } = get();

    // Add to beginning of list
    const updatedNotifications = [notification, ...notifications];

    // Update unread count
    const newUnreadCount = unreadCount + 1;

    set({
      notifications: updatedNotifications,
      unreadCount: newUnreadCount,
    });

    // Update badge count
    get().updateBadgeCount();

    logger.info('Notification added', {
      id: notification.id,
      type: notification.type,
      unreadCount: newUnreadCount,
    });
  },

  // Mark as read
  markAsRead: (notificationId: string) => {
    const { notifications, unreadCount } = get();

    const updatedNotifications = notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );

    const notification = notifications.find((n) => n.id === notificationId);
    const newUnreadCount = notification && !notification.read
      ? unreadCount - 1
      : unreadCount;

    set({
      notifications: updatedNotifications,
      unreadCount: Math.max(0, newUnreadCount),
    });

    // Update badge count
    get().updateBadgeCount();

    logger.info('Notification marked as read', { notificationId });
  },

  // Mark all as read
  markAllAsRead: () => {
    const { notifications } = get();

    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));

    set({
      notifications: updatedNotifications,
      unreadCount: 0,
    });

    // Update badge count
    get().updateBadgeCount();

    logger.info('All notifications marked as read');
  },

  // Delete notification
  deleteNotification: (notificationId: string) => {
    const { notifications, unreadCount } = get();

    const notification = notifications.find((n) => n.id === notificationId);
    const updatedNotifications = notifications.filter((n) => n.id !== notificationId);
    const newUnreadCount = notification && !notification.read
      ? unreadCount - 1
      : unreadCount;

    set({
      notifications: updatedNotifications,
      unreadCount: Math.max(0, newUnreadCount),
    });

    // Update badge count
    get().updateBadgeCount();

    logger.info('Notification deleted', { notificationId });
  },

  // Clear all notifications
  clearAll: async () => {
    try {
      await clearAllNotifications();
      set({
        notifications: [],
        unreadCount: 0,
      });
      await setBadgeCount(0);
      logger.info('All notifications cleared');
    } catch (error: any) {
      logger.error('Failed to clear notifications', error);
      set({ error: error.message || 'Failed to clear notifications' });
    }
  },

  // Update badge count
  updateBadgeCount: async () => {
    try {
      const { unreadCount, settings } = get();

      if (settings.badgeEnabled) {
        await setBadgeCount(unreadCount);
      } else {
        await setBadgeCount(0);
      }
    } catch (error: any) {
      logger.error('Failed to update badge count', error);
    }
  },

  // Set error
  setError: (error: string | null) => set({ error }),
}));
