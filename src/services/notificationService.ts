/**
 * Notification Service
 * Handles push notifications using Expo Notifications
 * Manages permissions, token registration, and notification handling
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import { logger } from '@utils/logger';
import type {
  NotificationData,
  NotificationPermissionStatus,
  ExpoPushTokenData,
  NotificationResponse,
} from '@types/notification.types';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Check if push notifications are supported on this device
 */
export function isPushNotificationSupported(): boolean {
  return Device.isDevice && Platform.OS !== 'web';
}

/**
 * Request notification permissions
 * Returns permission status
 */
export async function requestNotificationPermissions(): Promise<NotificationPermissionStatus> {
  try {
    if (!isPushNotificationSupported()) {
      logger.warn('Push notifications not supported on this device');
      return {
        granted: false,
        canAskAgain: false,
      };
    }

    // Get current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Ask for permission if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    const granted = finalStatus === 'granted';

    if (!granted) {
      logger.warn('Notification permission not granted', { status: finalStatus });
    } else {
      logger.info('Notification permission granted');
    }

    // Get detailed permission status
    const permissionsResponse = await Notifications.getPermissionsAsync();

    return {
      granted,
      canAskAgain: permissionsResponse.canAskAgain,
      ios: permissionsResponse.ios
        ? {
            status: permissionsResponse.ios.status,
            allowsAlert: permissionsResponse.ios.allowsAlert ?? false,
            allowsBadge: permissionsResponse.ios.allowsBadge ?? false,
            allowsSound: permissionsResponse.ios.allowsSound ?? false,
          }
        : undefined,
      android: permissionsResponse.android
        ? {
            importance: permissionsResponse.android.importance,
          }
        : undefined,
    };
  } catch (error) {
    logger.error('Failed to request notification permissions', error);
    throw error;
  }
}

/**
 * Register for push notifications and get Expo Push Token
 * This token is used to send notifications to the device
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (!isPushNotificationSupported()) {
      logger.warn('Cannot register for push notifications: device not supported');
      return null;
    }

    // Request permissions first
    const permissionStatus = await requestNotificationPermissions();

    if (!permissionStatus.granted) {
      logger.warn('Cannot register for push notifications: permission not granted');
      return null;
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#059669',
        sound: 'default',
        enableVibrate: true,
      });

      // Create additional channels for different notification types
      await Notifications.setNotificationChannelAsync('transactions', {
        name: 'Transactions',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#059669',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('promotions', {
        name: 'Promotions',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    // Get Expo Push Token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      logger.error('Project ID not found in app config');
      throw new Error('Project ID is required for push notifications');
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    logger.info('Expo push token obtained', {
      token: tokenData.data.substring(0, 20) + '...',
    });

    return tokenData.data;
  } catch (error) {
    logger.error('Failed to register for push notifications', error);
    throw error;
  }
}

/**
 * Save push token to Supabase
 * Associates the device token with the user account
 */
export async function savePushTokenToBackend(
  userId: string,
  token: string
): Promise<boolean> {
  try {
    const deviceId = Constants.deviceId || 'unknown';
    const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';

    const tokenData: Omit<ExpoPushTokenData, 'createdAt' | 'updatedAt'> = {
      userId,
      token,
      deviceType,
      deviceId,
    };

    // Save to Supabase (upsert to handle token updates)
    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          device_type: deviceType,
          device_id: deviceId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,device_id',
        }
      );

    if (error) {
      logger.error('Failed to save push token to backend', error);
      return false;
    }

    logger.info('Push token saved to backend', { userId, deviceType });
    return true;
  } catch (error) {
    logger.error('Failed to save push token', error);
    return false;
  }
}

/**
 * Delete push token from backend
 * Called when user logs out or disables notifications
 */
export async function deletePushTokenFromBackend(userId: string): Promise<boolean> {
  try {
    const deviceId = Constants.deviceId || 'unknown';

    const { error } = await supabase
      .from('push_tokens')
      .delete()
      .match({ user_id: userId, device_id: deviceId });

    if (error) {
      logger.error('Failed to delete push token from backend', error);
      return false;
    }

    logger.info('Push token deleted from backend', { userId });
    return true;
  } catch (error) {
    logger.error('Failed to delete push token', error);
    return false;
  }
}

/**
 * Schedule a local notification
 * Useful for reminders and offline notifications
 */
export async function scheduleLocalNotification(
  notification: NotificationData,
  trigger: Notifications.NotificationTriggerInput
): Promise<string> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: notification.sound ?? true,
        badge: notification.badge,
        categoryIdentifier: notification.categoryIdentifier,
      },
      trigger,
    });

    logger.info('Local notification scheduled', { identifier });
    return identifier;
  } catch (error) {
    logger.error('Failed to schedule local notification', error);
    throw error;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    logger.info('Scheduled notification cancelled', { identifier });
  } catch (error) {
    logger.error('Failed to cancel scheduled notification', error);
    throw error;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    logger.info('All scheduled notifications cancelled');
  } catch (error) {
    logger.error('Failed to cancel all scheduled notifications', error);
    throw error;
  }
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    if (Platform.OS === 'ios') {
      return await Notifications.getBadgeCountAsync();
    }
    return 0; // Android doesn't have a global badge count API
  } catch (error) {
    logger.error('Failed to get badge count', error);
    return 0;
  }
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
    logger.info('Badge count set', { count });
  } catch (error) {
    logger.error('Failed to set badge count', error);
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
    logger.info('All notifications cleared');
  } catch (error) {
    logger.error('Failed to clear notifications', error);
  }
}

/**
 * Add listener for notifications received while app is in foreground
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for when user taps on notification
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get all delivered notifications
 */
export async function getPresentedNotifications(): Promise<Notifications.Notification[]> {
  try {
    return await Notifications.getPresentedNotificationsAsync();
  } catch (error) {
    logger.error('Failed to get presented notifications', error);
    return [];
  }
}

/**
 * Full initialization flow for push notifications
 * Call this when user logs in
 */
export async function initializePushNotifications(userId: string): Promise<boolean> {
  try {
    logger.info('Initializing push notifications', { userId });

    // Check device support
    if (!isPushNotificationSupported()) {
      logger.warn('Device does not support push notifications');
      return false;
    }

    // Request permissions
    const permissionStatus = await requestNotificationPermissions();

    if (!permissionStatus.granted) {
      logger.warn('Notification permissions not granted');
      return false;
    }

    // Register for push notifications
    const token = await registerForPushNotifications();

    if (!token) {
      logger.warn('Failed to get push token');
      return false;
    }

    // Save token to backend
    const saved = await savePushTokenToBackend(userId, token);

    if (!saved) {
      logger.warn('Failed to save push token to backend');
      return false;
    }

    logger.info('Push notifications initialized successfully', { userId });
    return true;
  } catch (error) {
    logger.error('Failed to initialize push notifications', error);
    return false;
  }
}

/**
 * Cleanup push notifications
 * Call this when user logs out
 */
export async function cleanupPushNotifications(userId: string): Promise<void> {
  try {
    logger.info('Cleaning up push notifications', { userId });

    // Delete token from backend
    await deletePushTokenFromBackend(userId);

    // Clear all notifications
    await clearAllNotifications();

    // Reset badge count
    await setBadgeCount(0);

    logger.info('Push notifications cleaned up', { userId });
  } catch (error) {
    logger.error('Failed to cleanup push notifications', error);
  }
}
