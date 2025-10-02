// Import jest-native matchers (deprecated but included for compatibility)
import '@testing-library/jest-native/extend-expect';

// Mock expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  SecurityLevel: {
    BIOMETRIC_STRONG: 2,
  },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  modelName: 'iPhone 12',
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
}));

jest.mock('expo-barcode-scanner', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  BarCodeScanner: {
    Constants: {
      BarCodeType: {},
    },
  },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock Supabase
jest.mock('@services/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn(),
      verifyOtp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      refreshSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
  },
}));

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  addBreadcrumb: jest.fn(),
  wrap: (fn) => fn,
  Native: {
    crash: jest.fn(),
  },
}));

// Mock Firebase
jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    logEvent: jest.fn(),
    setUserId: jest.fn(),
    setUserProperty: jest.fn(),
    setCurrentScreen: jest.fn(),
  })),
}));

jest.mock('@react-native-firebase/perf', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    newTrace: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      putAttribute: jest.fn(),
      putMetric: jest.fn(),
    })),
  })),
}));

// Mock jail-monkey
jest.mock('jail-monkey', () => ({
  isJailBroken: jest.fn(() => false),
  hookDetected: jest.fn(() => false),
  canMockLocation: jest.fn(() => false),
  trustFall: jest.fn(() => false),
}));

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));

// Mock react-native-ssl-pinning
jest.mock('react-native-ssl-pinning', () => ({
  fetch: jest.fn(() => Promise.resolve({
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })),
}));

// Global test setup
global.console = {
  ...console,
  // Suppress console errors in tests unless explicitly needed
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock timers
jest.useFakeTimers();
