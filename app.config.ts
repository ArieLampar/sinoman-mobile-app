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
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  };
};