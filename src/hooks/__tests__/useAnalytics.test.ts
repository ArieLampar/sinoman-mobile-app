import { renderHook } from '@testing-library/react-native';
import { useAnalytics } from '../useAnalytics';
import { logScreenView, addBreadcrumb } from '@services/monitoring';
import { useRoute } from '@react-navigation/native';

jest.mock('@react-navigation/native');
jest.mock('@services/monitoring');
jest.mock('@utils/logger');

describe('useAnalytics', () => {
  const mockRoute = {
    name: 'TestScreen',
    key: 'test-key',
    params: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoute as jest.Mock).mockReturnValue(mockRoute);
  });

  it('should use route name as screen name by default', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(result.current.screenName).toBe('TestScreen');
  });

  it('should use provided screen name override', () => {
    const { result } = renderHook(() => useAnalytics('CustomScreenName'));

    expect(result.current.screenName).toBe('CustomScreenName');
  });

  it('should log screen view to Firebase Analytics', () => {
    renderHook(() => useAnalytics());

    expect(logScreenView).toHaveBeenCalledWith('TestScreen');
  });

  it('should add breadcrumb to Sentry', () => {
    renderHook(() => useAnalytics());

    expect(addBreadcrumb).toHaveBeenCalledWith(
      'Screen viewed: TestScreen',
      'navigation',
      {
        screen: 'TestScreen',
        route: 'TestScreen',
      }
    );
  });

  it('should log screen view with custom name', () => {
    renderHook(() => useAnalytics('DashboardScreen'));

    expect(logScreenView).toHaveBeenCalledWith('DashboardScreen');
    expect(addBreadcrumb).toHaveBeenCalledWith(
      'Screen viewed: DashboardScreen',
      'navigation',
      expect.objectContaining({
        screen: 'DashboardScreen',
      })
    );
  });

  it('should track screen view on mount', () => {
    renderHook(() => useAnalytics());

    expect(logScreenView).toHaveBeenCalledTimes(1);
    expect(addBreadcrumb).toHaveBeenCalledTimes(1);
  });

  it('should re-track when screen name changes', () => {
    const { rerender } = renderHook(
      ({ screenName }) => useAnalytics(screenName),
      { initialProps: { screenName: 'Screen1' } }
    );

    expect(logScreenView).toHaveBeenCalledWith('Screen1');

    rerender({ screenName: 'Screen2' });

    expect(logScreenView).toHaveBeenCalledWith('Screen2');
    expect(logScreenView).toHaveBeenCalledTimes(2);
  });

  it('should handle different route names', () => {
    (useRoute as jest.Mock).mockReturnValue({
      name: 'ProfileScreen',
      key: 'profile-key',
      params: {},
    });

    renderHook(() => useAnalytics());

    expect(logScreenView).toHaveBeenCalledWith('ProfileScreen');
    expect(addBreadcrumb).toHaveBeenCalledWith(
      'Screen viewed: ProfileScreen',
      'navigation',
      expect.objectContaining({
        screen: 'ProfileScreen',
        route: 'ProfileScreen',
      })
    );
  });
});
