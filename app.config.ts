import { ExpoConfig } from '@expo/config-types';

export default (): ExpoConfig => {
  const config = require('./app.json').expo;

  return {
    ...config,
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      environment: process.env.EXPO_PUBLIC_ENV || 'development',
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      sentryEnvironment: process.env.EXPO_PUBLIC_ENV || 'development',
      sentryRelease: process.env.EXPO_PUBLIC_SENTRY_RELEASE || '1.0.0',
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  };
};