import 'dotenv/config';
import { ExpoConfig } from '@expo/config-types';

export default (): ExpoConfig => {
  const config = require('./app.json').expo;

  // Load environment variables with fallbacks for EAS Build
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fjequffxcontjvupgedh.supabase.co';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZXF1ZmZ4Y29udGp2dXBnZWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjU1MjAsImV4cCI6MjA3NDY0MTUyMH0.RWDxO6Q5_o5lxaj83hi3OOBYbnI5vKSTEIQMb22fgaU';

  // Validate required environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase credentials in environment variables');
  }

  return {
    ...config,
    plugins: [
      'expo-font',
      'expo-secure-store',
      ...(config.plugins || []),
    ],
    android: {
      ...config.android,
    },
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    extra: {
      supabaseUrl,
      supabaseAnonKey,
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.sinomanapp.id',
      environment: process.env.EXPO_PUBLIC_ENV || 'production',
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
      sentryEnvironment: process.env.EXPO_PUBLIC_ENV || 'production',
      sentryRelease: process.env.EXPO_PUBLIC_SENTRY_RELEASE || '1.0.0',
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      eas: {
        projectId: process.env.EAS_PROJECT_ID || '06863a61-aa5a-4f34-b0e8-7be02c7514eb',
      },
    },
  };
};