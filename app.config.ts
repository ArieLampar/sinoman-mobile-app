import 'dotenv/config';
import { ExpoConfig } from '@expo/config-types';

export default (): ExpoConfig => {
  // Load environment variables with fallbacks for EAS Build
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fjequffxcontjvupgedh.supabase.co';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZXF1ZmZ4Y29udGp2dXBnZWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjU1MjAsImV4cCI6MjA3NDY0MTUyMH0.RWDxO6Q5_o5lxaj83hi3OOBYbnI5vKSTEIQMb22fgaU';
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.sinomanapp.id';

  // Validate required environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase credentials in environment variables');
  }

  // Enforce HTTPS for all endpoints
  if (!supabaseUrl.startsWith('https://')) {
    throw new Error('Supabase URL must use HTTPS');
  }

  if (!apiUrl.startsWith('https://')) {
    throw new Error('API URL must use HTTPS');
  }

  return {
    name: 'Sinoman Mobile App',
    slug: 'sinoman-mobile-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    description: 'Aplikasi resmi Koperasi Sinoman Ponorogo untuk kelola simpanan, belanja, dan program kesehatan.',
    primaryColor: '#059669',
    scheme: 'sinoman',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#059669',
    },
    notification: {
      icon: './assets/notification-icon.png',
      color: '#059669',
    },
    assetBundlePatterns: ['**/*'],
    plugins: [
      'expo-font',
      'expo-secure-store',
    ],
    android: {
      package: 'id.sinomanapp.mobile',
      versionCode: 6,
      allowBackup: false,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#059669',
        monochromeImage: './assets/adaptive-icon-monochrome.png',
      },
      permissions: [
        'CAMERA',
        'USE_FINGERPRINT',
        'USE_BIOMETRIC',
        'RECEIVE_BOOT_COMPLETED',
        'POST_NOTIFICATIONS',
        'VIBRATE',
        'ACCESS_NETWORK_STATE',
        'INTERNET',
      ],
      blockedPermissions: ['ACCESS_FINE_LOCATION'],
    },
    ios: {
      bundleIdentifier: 'id.sinomanapp.mobile',
      buildNumber: '1.0.0',
      jsEngine: 'hermes',
      supportsTablet: true,
      userInterfaceStyle: 'automatic',
      infoPlist: {
        NSCameraUsageDescription: 'Aplikasi memerlukan akses kamera untuk scan QR code pembayaran',
        NSFaceIDUsageDescription: 'Aplikasi menggunakan Face ID untuk login yang aman dan cepat',
        NSPhotoLibraryUsageDescription: 'Aplikasi memerlukan akses galeri untuk memilih foto profil',
        NSLocationWhenInUseUsageDescription: 'Temukan merchant terdekat (opsional)',
        UIBackgroundModes: ['remote-notification'],
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/06863a61-aa5a-4f34-b0e8-7be02c7514eb',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    extra: {
      supabaseUrl,
      supabaseAnonKey,
      apiUrl,
      environment: process.env.EXPO_PUBLIC_ENV || 'production',
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
      sentryEnvironment: process.env.EXPO_PUBLIC_ENV || 'production',
      sentryRelease: process.env.EXPO_PUBLIC_SENTRY_RELEASE || '1.0.0',
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      otpResendCooldown: parseInt(process.env.EXPO_PUBLIC_OTP_RESEND_COOLDOWN || '60', 10),
      enableSslPinning: process.env.EXPO_PUBLIC_ENV === 'production',
      eas: {
        projectId: process.env.EAS_PROJECT_ID || '06863a61-aa5a-4f34-b0e8-7be02c7514eb',
      },
    },
  };
};