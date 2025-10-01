/**
 * useNetworkStatus Hook
 * Monitors network status and auto-syncs offline queue
 */

import { useState, useEffect } from 'react';
import { subscribeToNetworkChanges, isOnline } from '@services/offline';
import { useQRStore } from '@store/qrStore';
import { logger } from '@utils/logger';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const { syncOfflineQueue, getQueuedTransactionsCount } = useQRStore();

  useEffect(() => {
    // Initial check
    isOnline().then((online) => {
      setIsConnected(online);
      setIsChecking(false);
    });

    // Subscribe to network changes
    const unsubscribe = subscribeToNetworkChanges(async (connected) => {
      const wasOffline = !isConnected;
      setIsConnected(connected);

      // Auto-sync when connection restored
      if (connected && wasOffline) {
        const queueCount = getQueuedTransactionsCount();
        if (queueCount > 0) {
          logger.info('Connection restored, syncing offline queue:', queueCount);
          try {
            await syncOfflineQueue();
          } catch (error) {
            logger.error('Auto-sync failed:', error);
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected]);

  return {
    isConnected,
    isChecking,
    isOffline: !isConnected,
  };
}
