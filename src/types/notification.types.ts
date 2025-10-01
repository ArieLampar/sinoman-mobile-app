/**
 * Notification Types
 * Types for push notifications and in-app notifications
 */

import { ExpoPushToken } from 'expo-notifications';

export type NotificationType =
  | 'transaction'
  | 'balance_update'
  | 'order_status'
  | 'promotion'
  | 'fit_challenge'
  | 'system'
  | 'general';

export type NotificationPriority = 'low' | 'default' | 'high';

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  badge?: number;
  sound?: string | boolean;
  categoryIdentifier?: string;
}

export interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  userId: string;
}

export interface NotificationSettings {
  enabled: boolean;
  transactions: boolean;
  balanceUpdates: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  fitChallenge: boolean;
  system: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  badgeEnabled: boolean;
}

export interface ExpoPushTokenData {
  userId: string;
  token: string;
  deviceType: 'ios' | 'android';
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  ios?: {
    status: number;
    allowsAlert: boolean;
    allowsBadge: boolean;
    allowsSound: boolean;
  };
  android?: {
    importance: number;
  };
}

export interface NotificationResponse {
  actionIdentifier: string;
  notification: {
    request: {
      content: NotificationData;
      identifier: string;
      trigger: any;
    };
  };
}
