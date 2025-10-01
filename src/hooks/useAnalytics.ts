/**
 * Analytics Hook
 * Provides automatic screen view tracking and analytics utilities
 */

import { useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { logger } from '@utils/logger';
import { logScreenView, addBreadcrumb } from '@services/monitoring';

/**
 * Hook to automatically track screen views in Firebase Analytics
 * @param screenName - Optional screen name override (defaults to route name)
 * @returns Object containing the current screen name
 */
export function useAnalytics(screenName?: string) {
  const route = useRoute();
  const name = screenName || route.name;

  useEffect(() => {
    // Log screen view to Firebase Analytics
    logScreenView(name);

    // Add breadcrumb to Sentry
    addBreadcrumb(`Screen viewed: ${name}`, 'navigation', {
      screen: name,
      route: route.name,
    });

    if (__DEV__) {
      logger.info(`[Analytics] Screen view tracked: ${name}`);
    }
  }, [name, route.name]);

  return {
    screenName: name,
  };
}
