/**
 * useNotifications Hook
 * React hook for managing notifications in components
 * Handles notification listeners and navigation
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useNotificationStore } from '@store/notificationStore';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';
import type { NavigationProp } from '@types';

export function useNotifications() {
  const navigation = useNavigation<NavigationProp>();
  const { user, isAuthenticated } = useAuthStore();
  const {
    initialize,
    cleanup,
    addNotification,
    markAsRead,
    notifications,
    unreadCount,
    settings,
    isInitialized,
  } = useNotificationStore();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const appState = useRef(AppState.currentState);

  // Initialize notifications when user logs in
  useEffect(() => {
    if (isAuthenticated && user && !isInitialized) {
      logger.info('Initializing notifications for user', { userId: user.id });
      initialize(user.id);
    }
  }, [isAuthenticated, user, isInitialized, initialize]);

  // Setup notification listeners
  useEffect(() => {
    // Listener for notifications received while app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        logger.info('Notification received in foreground', {
          title: notification.request.content.title,
          type: notification.request.content.data?.type,
        });

        // Add to in-app notification list
        if (user) {
          const notificationData = {
            id: notification.request.identifier,
            type: (notification.request.content.data?.type as string) || 'general',
            title: notification.request.content.title || '',
            message: notification.request.content.body || '',
            data: notification.request.content.data,
            read: false,
            createdAt: new Date().toISOString(),
            userId: user.id,
          };

          addNotification(notificationData);
        }
      });

    // Listener for when user taps on notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        logger.info('Notification tapped', {
          actionIdentifier: response.actionIdentifier,
          data: response.notification.request.content.data,
        });

        handleNotificationTap(response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user, addNotification]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        logger.info('App came to foreground');
        // App has come to the foreground, refresh notifications
        // The realtime subscriptions will automatically reconnect
      }

      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        logger.info('App went to background');
        // App is going to background
        // Realtime subscriptions will be maintained but with less priority
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Cleanup on logout
  useEffect(() => {
    if (!isAuthenticated && isInitialized && user) {
      logger.info('Cleaning up notifications on logout');
      cleanup(user.id);
    }
  }, [isAuthenticated, isInitialized, user, cleanup]);

  /**
   * Handle notification tap
   * Navigate to appropriate screen based on notification type
   */
  const handleNotificationTap = (
    response: Notifications.NotificationResponse
  ) => {
    const { data } = response.notification.request.content;

    if (!data) {
      logger.warn('Notification has no data, cannot navigate');
      return;
    }

    const notificationId = response.notification.request.identifier;
    markAsRead(notificationId);

    // Navigate based on notification type
    switch (data.type) {
      case 'transaction':
        // Navigate to TransactionHistory screen (existing route)
        if (data.savingsType) {
          navigation.navigate('TransactionHistory', {
            savingsType: data.savingsType,
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
        if (data.orderId && data.order) {
          navigation.navigate('OrderConfirmation', {
            orderId: data.orderId,
            order: data.order,
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

  return {
    notifications,
    unreadCount,
    settings,
    isInitialized,
  };
}

/**
 * useNotificationPermission Hook
 * Simplified hook for checking and requesting notification permissions
 */
export function useNotificationPermission() {
  const { permissionStatus, requestPermissions } = useNotificationStore();

  return {
    permissionStatus,
    requestPermissions,
    hasPermission: permissionStatus?.granted ?? false,
    canAskAgain: permissionStatus?.canAskAgain ?? true,
  };
}

/**
 * useNotificationSettings Hook
 * Hook for managing notification settings
 */
export function useNotificationSettings() {
  const { settings, updateSettings } = useNotificationStore();

  return {
    settings,
    updateSettings,
  };
}
