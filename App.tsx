import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from '@navigation';
import { theme } from '@theme';
import { useInactivityTimer } from '@hooks/useInactivityTimer';
import { logger } from '@utils/logger';

function AppContent() {
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

        // TODO: Load custom fonts
        // await Font.loadAsync({
        //   'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
        //   'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
        //   'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        // });

        // TODO: Initialize analytics
        // await initAnalytics();

        logger.info('App initialization completed');
      } catch (error) {
        logger.error('App initialization error:', error);
      } finally {
        setIsReady(true);
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