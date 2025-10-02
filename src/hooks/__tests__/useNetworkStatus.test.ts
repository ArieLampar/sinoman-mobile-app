import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNetworkStatus } from '../useNetworkStatus';
import * as offlineService from '@services/offline';
import { useQRStore } from '@store/qrStore';

jest.mock('@services/offline');
jest.mock('@store/qrStore');
jest.mock('@utils/logger');

describe('useNetworkStatus', () => {
  const mockSyncOfflineQueue = jest.fn();
  const mockGetQueuedTransactionsCount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useQRStore as unknown as jest.Mock).mockReturnValue({
      syncOfflineQueue: mockSyncOfflineQueue,
      getQueuedTransactionsCount: mockGetQueuedTransactionsCount,
    });
  });

  it('should initialize with checking state', () => {
    (offlineService.isOnline as jest.Mock).mockResolvedValue(true);
    (offlineService.subscribeToNetworkChanges as jest.Mock).mockReturnValue(jest.fn());

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isChecking).toBe(true);
  });

  it('should set connected state after initial check', async () => {
    (offlineService.isOnline as jest.Mock).mockResolvedValue(true);
    (offlineService.subscribeToNetworkChanges as jest.Mock).mockReturnValue(jest.fn());

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('should set offline state when not connected', async () => {
    (offlineService.isOnline as jest.Mock).mockResolvedValue(false);
    (offlineService.subscribeToNetworkChanges as jest.Mock).mockReturnValue(jest.fn());

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('should subscribe to network changes', () => {
    (offlineService.isOnline as jest.Mock).mockResolvedValue(true);
    const mockUnsubscribe = jest.fn();
    (offlineService.subscribeToNetworkChanges as jest.Mock).mockReturnValue(mockUnsubscribe);

    renderHook(() => useNetworkStatus());

    expect(offlineService.subscribeToNetworkChanges).toHaveBeenCalled();
  });

  it('should sync offline queue when connection is restored', async () => {
    (offlineService.isOnline as jest.Mock).mockResolvedValue(false);
    let networkCallback: ((connected: boolean) => void) | null = null;

    (offlineService.subscribeToNetworkChanges as jest.Mock).mockImplementation((callback) => {
      networkCallback = callback;
      return jest.fn();
    });

    mockGetQueuedTransactionsCount.mockReturnValue(3);
    mockSyncOfflineQueue.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });

    // Simulate connection restored
    await act(async () => {
      if (networkCallback) {
        await networkCallback(true);
      }
    });

    await waitFor(() => {
      expect(mockGetQueuedTransactionsCount).toHaveBeenCalled();
      expect(mockSyncOfflineQueue).toHaveBeenCalled();
    });
  });

  it('should not sync if no queued transactions', async () => {
    (offlineService.isOnline as jest.Mock).mockResolvedValue(false);
    let networkCallback: ((connected: boolean) => void) | null = null;

    (offlineService.subscribeToNetworkChanges as jest.Mock).mockImplementation((callback) => {
      networkCallback = callback;
      return jest.fn();
    });

    mockGetQueuedTransactionsCount.mockReturnValue(0);

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });

    // Simulate connection restored
    await act(async () => {
      if (networkCallback) {
        await networkCallback(true);
      }
    });

    await waitFor(() => {
      expect(mockGetQueuedTransactionsCount).toHaveBeenCalled();
      expect(mockSyncOfflineQueue).not.toHaveBeenCalled();
    });
  });

  it('should handle sync errors gracefully', async () => {
    (offlineService.isOnline as jest.Mock).mockResolvedValue(false);
    let networkCallback: ((connected: boolean) => void) | null = null;

    (offlineService.subscribeToNetworkChanges as jest.Mock).mockImplementation((callback) => {
      networkCallback = callback;
      return jest.fn();
    });

    mockGetQueuedTransactionsCount.mockReturnValue(2);
    mockSyncOfflineQueue.mockRejectedValue(new Error('Sync failed'));

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });

    // Should not throw error
    await act(async () => {
      if (networkCallback) {
        await networkCallback(true);
      }
    });

    await waitFor(() => {
      expect(mockSyncOfflineQueue).toHaveBeenCalled();
    });
  });

  it('should unsubscribe on unmount', async () => {
    (offlineService.isOnline as jest.Mock).mockResolvedValue(true);
    const mockUnsubscribe = jest.fn();
    (offlineService.subscribeToNetworkChanges as jest.Mock).mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(offlineService.subscribeToNetworkChanges).toHaveBeenCalled();
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
