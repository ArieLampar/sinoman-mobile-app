import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { BackHandler, Alert } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from './src/navigation';
import { theme, loadFonts } from './src/theme';
import { useInactivityTimer, useNotifications } from './src/hooks';
import { useAuthStore } from './src/store/authStore';
import { logger } from './src/utils/logger';
import { SecurityWarningModal, ErrorBoundary } from './src/components/common';
import {
  checkDeviceSecurity,
  shouldBlockApp,
  migrateFromAsyncStorage,
} from './src/services/security';
import { DeviceSecurityStatus } from './src/types';
import {
  initializeSentry,
  initializeFirebase,
  logEvent,
  AnalyticsEvents,
  setSentryUser,
  clearSentryUser,
  setUserProperties,
} from './src/services/monitoring';

// Prevent auto-hide of splash screen
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isAuthenticated, user } = useAuthStore();

  // Initialize notifications when user is authenticated
  useNotifications();

  // Enable inactivity timer for auto-logout
  useInactivityTimer();

  // Set user context in Sentry and Firebase Analytics when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setSentryUser(user.id, {
        phone: user.phone,
        name: user.name,
      });
      setUserProperties({
        userId: user.id,
      });
    } else {
      clearSentryUser();
    }
  }, [isAuthenticated, user?.id]);

  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<DeviceSecurityStatus | null>(null);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        logger.info('App initialization started');

        // SECURITY: Check device security first
        logger.info('Running device security check');
        const deviceSecurity = await checkDeviceSecurity();
        setSecurityStatus(deviceSecurity);

        if (deviceSecurity.isCompromised) {
          logger.warn('Device compromised:', deviceSecurity.warnings);

          // Block app if configured to do so
          if (shouldBlockApp(deviceSecurity)) {
            Alert.alert(
              'Aplikasi Tidak Dapat Dijalankan',
              'Perangkat Anda terdeteksi jailbroken/rooted. Demi keamanan data Anda, aplikasi tidak dapat dijalankan pada perangkat yang dimodifikasi.',
              [
                {
                  text: 'Keluar',
                  onPress: () => BackHandler.exitApp(),
                  style: 'destructive',
                },
              ],
              { cancelable: false }
            );
            return;
          }

          // Show warning modal (non-blocking)
          setShowSecurityWarning(true);
        } else {
          logger.info('Device security check passed');
        }

        // SECURITY: Migrate data from AsyncStorage to SecureStore
        logger.info('Starting data migration to secure storage');
        const migrationSuccess = await migrateFromAsyncStorage();
        if (migrationSuccess) {
          logger.info('Data migration completed successfully');
        } else {
          logger.warn('Data migration encountered issues');
        }

        // Initialize monitoring services
        logger.info('Initializing Sentry');
        initializeSentry();

        logger.info('Initializing Firebase Analytics & Performance');
        await initializeFirebase();

        // Log app open event
        await logEvent(AnalyticsEvents.APP_OPEN);

        // Load custom fonts
        const fontsLoaded = await loadFonts();
        if (fontsLoaded) {
          logger.info('Inter fonts loaded successfully');
        } else {
          logger.warn('Falling back to system fonts');
        }

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
    <ErrorBoundary context="App">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <NavigationContainer>
              <ErrorBoundary context="Navigation">
                <AppContent />
              </ErrorBoundary>
            </NavigationContainer>

            {/* Security Warning Modal */}
            {securityStatus && (
              <SecurityWarningModal
                visible={showSecurityWarning}
                securityStatus={securityStatus}
                onContinue={() => setShowSecurityWarning(false)}
                onExit={() => BackHandler.exitApp()}
              />
            )}
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}