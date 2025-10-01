/**
 * Realtime Service
 * Handles Supabase Realtime subscriptions for live data updates
 * Supports balance updates, transactions, orders, and notifications
 */

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { logger } from '@utils/logger';
import type { Transaction } from '@types/savings.types';

type RealtimeCallback<T = any> = (payload: RealtimePostgresChangesPayload<T>) => void;

/**
 * Active subscriptions registry
 */
const activeChannels = new Map<string, RealtimeChannel>();

/**
 * Subscribe to balance changes for a user
 * Triggers when user's savings balance is updated
 */
export function subscribeToBalanceUpdates(
  userId: string,
  callback: RealtimeCallback
): RealtimeChannel {
  try {
    const channelName = `balance:${userId}`;

    // Unsubscribe from existing channel if any
    unsubscribeChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'savings_balances',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.info('Balance update received', {
            event: payload.eventType,
            userId,
          });
          callback(payload);
        }
      )
      .subscribe((status) => {
        logger.info('Balance subscription status', { status, userId });
      });

    activeChannels.set(channelName, channel);
    logger.info('Subscribed to balance updates', { userId });

    return channel;
  } catch (error) {
    logger.error('Failed to subscribe to balance updates', error);
    throw error;
  }
}

/**
 * Subscribe to transaction updates for a user
 * Triggers when new transactions are created
 */
export function subscribeToTransactions(
  userId: string,
  callback: RealtimeCallback<Transaction>
): RealtimeChannel {
  try {
    const channelName = `transactions:${userId}`;

    // Unsubscribe from existing channel if any
    unsubscribeChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only listen to new transactions
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.info('New transaction received', {
            transactionId: payload.new.id,
            userId,
          });
          callback(payload);
        }
      )
      .subscribe((status) => {
        logger.info('Transaction subscription status', { status, userId });
      });

    activeChannels.set(channelName, channel);
    logger.info('Subscribed to transaction updates', { userId });

    return channel;
  } catch (error) {
    logger.error('Failed to subscribe to transaction updates', error);
    throw error;
  }
}

/**
 * Subscribe to order status updates
 * Triggers when order status changes (pending -> processing -> shipped -> delivered)
 */
export function subscribeToOrderUpdates(
  userId: string,
  callback: RealtimeCallback
): RealtimeChannel {
  try {
    const channelName = `orders:${userId}`;

    // Unsubscribe from existing channel if any
    unsubscribeChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.info('Order update received', {
            orderId: payload.new.id,
            status: payload.new.status,
            userId,
          });
          callback(payload);
        }
      )
      .subscribe((status) => {
        logger.info('Order subscription status', { status, userId });
      });

    activeChannels.set(channelName, channel);
    logger.info('Subscribed to order updates', { userId });

    return channel;
  } catch (error) {
    logger.error('Failed to subscribe to order updates', error);
    throw error;
  }
}

/**
 * Subscribe to in-app notifications
 * Triggers when new notifications are created for the user
 */
export function subscribeToNotifications(
  userId: string,
  callback: RealtimeCallback
): RealtimeChannel {
  try {
    const channelName = `notifications:${userId}`;

    // Unsubscribe from existing channel if any
    unsubscribeChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.info('New notification received', {
            notificationId: payload.new.id,
            type: payload.new.type,
            userId,
          });
          callback(payload);
        }
      )
      .subscribe((status) => {
        logger.info('Notification subscription status', { status, userId });
      });

    activeChannels.set(channelName, channel);
    logger.info('Subscribed to notifications', { userId });

    return channel;
  } catch (error) {
    logger.error('Failed to subscribe to notifications', error);
    throw error;
  }
}

/**
 * Subscribe to fit challenge updates
 * Triggers when user's fit challenge progress is updated
 */
export function subscribeToFitChallengeUpdates(
  userId: string,
  callback: RealtimeCallback
): RealtimeChannel {
  try {
    const channelName = `fit_challenge:${userId}`;

    // Unsubscribe from existing channel if any
    unsubscribeChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fit_challenge_progress',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.info('Fit challenge update received', {
            event: payload.eventType,
            userId,
          });
          callback(payload);
        }
      )
      .subscribe((status) => {
        logger.info('Fit challenge subscription status', { status, userId });
      });

    activeChannels.set(channelName, channel);
    logger.info('Subscribed to fit challenge updates', { userId });

    return channel;
  } catch (error) {
    logger.error('Failed to subscribe to fit challenge updates', error);
    throw error;
  }
}

/**
 * Subscribe to presence (online/offline status)
 * Useful for showing which members are currently online
 */
export function subscribeToPresence(
  channelName: string,
  userId: string,
  userName: string,
  onPresenceChange: (state: any) => void
): RealtimeChannel {
  try {
    const fullChannelName = `presence:${channelName}`;

    // Unsubscribe from existing channel if any
    unsubscribeChannel(fullChannelName);

    const channel = supabase.channel(fullChannelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        logger.info('Presence sync', { state });
        onPresenceChange(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        logger.info('User joined', { key, newPresences });
        onPresenceChange(channel.presenceState());
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        logger.info('User left', { key, leftPresences });
        onPresenceChange(channel.presenceState());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            user_name: userName,
            online_at: new Date().toISOString(),
          });
          logger.info('Presence tracked', { userId, userName });
        }
      });

    activeChannels.set(fullChannelName, channel);
    logger.info('Subscribed to presence', { channelName: fullChannelName });

    return channel;
  } catch (error) {
    logger.error('Failed to subscribe to presence', error);
    throw error;
  }
}

/**
 * Subscribe to broadcast messages
 * Useful for real-time chat or announcements
 */
export function subscribeToBroadcast(
  channelName: string,
  eventName: string,
  callback: (payload: any) => void
): RealtimeChannel {
  try {
    const fullChannelName = `broadcast:${channelName}`;

    // Unsubscribe from existing channel if any
    unsubscribeChannel(fullChannelName);

    const channel = supabase
      .channel(fullChannelName)
      .on('broadcast', { event: eventName }, (payload) => {
        logger.info('Broadcast message received', {
          event: eventName,
          payload,
        });
        callback(payload);
      })
      .subscribe((status) => {
        logger.info('Broadcast subscription status', { status, channelName });
      });

    activeChannels.set(fullChannelName, channel);
    logger.info('Subscribed to broadcast', { channelName: fullChannelName, eventName });

    return channel;
  } catch (error) {
    logger.error('Failed to subscribe to broadcast', error);
    throw error;
  }
}

/**
 * Send a broadcast message
 */
export async function sendBroadcast(
  channelName: string,
  eventName: string,
  payload: any
): Promise<void> {
  try {
    const fullChannelName = `broadcast:${channelName}`;
    const channel = activeChannels.get(fullChannelName);

    if (!channel) {
      throw new Error(`Channel ${fullChannelName} not found. Subscribe first.`);
    }

    await channel.send({
      type: 'broadcast',
      event: eventName,
      payload,
    });

    logger.info('Broadcast message sent', { channelName, eventName });
  } catch (error) {
    logger.error('Failed to send broadcast', error);
    throw error;
  }
}

/**
 * Unsubscribe from a specific channel
 */
export async function unsubscribeChannel(channelName: string): Promise<void> {
  try {
    const channel = activeChannels.get(channelName);

    if (channel) {
      await supabase.removeChannel(channel);
      activeChannels.delete(channelName);
      logger.info('Unsubscribed from channel', { channelName });
    }
  } catch (error) {
    logger.error('Failed to unsubscribe from channel', error);
  }
}

/**
 * Unsubscribe from all channels
 * Call this when user logs out
 */
export async function unsubscribeAll(): Promise<void> {
  try {
    const channelNames = Array.from(activeChannels.keys());

    for (const channelName of channelNames) {
      await unsubscribeChannel(channelName);
    }

    logger.info('Unsubscribed from all channels', { count: channelNames.length });
  } catch (error) {
    logger.error('Failed to unsubscribe from all channels', error);
  }
}

/**
 * Get all active channels
 */
export function getActiveChannels(): string[] {
  return Array.from(activeChannels.keys());
}

/**
 * Check if a channel is active
 */
export function isChannelActive(channelName: string): boolean {
  return activeChannels.has(channelName);
}

/**
 * Initialize all realtime subscriptions for a user
 * Call this when user logs in
 */
export function initializeRealtimeSubscriptions(
  userId: string,
  callbacks: {
    onBalanceUpdate?: RealtimeCallback;
    onTransaction?: RealtimeCallback<Transaction>;
    onOrderUpdate?: RealtimeCallback;
    onNotification?: RealtimeCallback;
    onFitChallengeUpdate?: RealtimeCallback;
  }
): void {
  try {
    logger.info('Initializing realtime subscriptions', { userId });

    if (callbacks.onBalanceUpdate) {
      subscribeToBalanceUpdates(userId, callbacks.onBalanceUpdate);
    }

    if (callbacks.onTransaction) {
      subscribeToTransactions(userId, callbacks.onTransaction);
    }

    if (callbacks.onOrderUpdate) {
      subscribeToOrderUpdates(userId, callbacks.onOrderUpdate);
    }

    if (callbacks.onNotification) {
      subscribeToNotifications(userId, callbacks.onNotification);
    }

    if (callbacks.onFitChallengeUpdate) {
      subscribeToFitChallengeUpdates(userId, callbacks.onFitChallengeUpdate);
    }

    logger.info('Realtime subscriptions initialized', {
      userId,
      subscriptionCount: activeChannels.size,
    });
  } catch (error) {
    logger.error('Failed to initialize realtime subscriptions', error);
    throw error;
  }
}

/**
 * Cleanup all realtime subscriptions
 * Call this when user logs out
 */
export async function cleanupRealtimeSubscriptions(): Promise<void> {
  try {
    logger.info('Cleaning up realtime subscriptions');
    await unsubscribeAll();
    logger.info('Realtime subscriptions cleaned up');
  } catch (error) {
    logger.error('Failed to cleanup realtime subscriptions', error);
  }
}
