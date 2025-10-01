import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from './src/navigation';
import { theme, loadFonts } from './src/theme';
import { useInactivityTimer, useNotifications } from './src/hooks';
import { useAuthStore } from './src/store/authStore';
import { logger } from './src/utils/logger';

// Prevent auto-hide of splash screen
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isAuthenticated } = useAuthStore();

  // Initialize notifications when user is authenticated
  useNotifications();

  // Enable inactivity timer for auto-logout
  useInactivityTimer();

  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        logger.info('App initialization started');

        // Load custom fonts
        const fontsLoaded = await loadFonts();
        if (fontsLoaded) {
          logger.info('Inter fonts loaded successfully');
        } else {
          logger.warn('Falling back to system fonts');
        }

        // TODO: Initialize analytics
        // await initAnalytics();

        logger.info('App initialization completed');
      } catch (error) {
        logger.error('App initialization error:', error);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    // TODO: Replace with proper splash screen component
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <AppContent />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}