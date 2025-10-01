/**
 * Network Service
 * Manages network connectivity detection and monitoring
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { logger } from '@utils/logger';

/**
 * Check if device is currently online
 * @returns Promise<boolean> - true if connected and internet reachable
 */
export async function isOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable === true;
  } catch (error) {
    logger.error('Network check error:', error);
    return false; // Assume offline on error
  }
}

/**
 * Subscribe to network state changes
 * @param callback - Function called when network state changes
 * @returns Unsubscribe function
 */
export function subscribeToNetworkChanges(
  callback: (isConnected: boolean) => void
): () => void {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const connected = state.isConnected === true && state.isInternetReachable === true;
    logger.info('Network state changed:', { connected, type: state.type });
    callback(connected);
  });

  return unsubscribe;
}

/**
 * Get current network state with full details
 * @returns Promise<NetInfoState> - Full network state information
 */
export async function getNetworkState(): Promise<NetInfoState> {
  return await NetInfo.fetch();
}

/**
 * Wait for network connection to be restored
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 30000)
 * @returns Promise<boolean> - true if connection restored within timeout
 */
export function waitForConnection(timeoutMs: number = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });
  });
}
