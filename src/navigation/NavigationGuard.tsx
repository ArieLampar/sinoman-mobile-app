/**
 * Navigation Guard Component
 * Protects routes based on authentication state
 */

import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';

interface NavigationGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProfile?: boolean;
  redirectTo?: string;
}

/**
 * Navigation Guard HOC
 * Redirects based on authentication and profile completion state
 */
export const NavigationGuard: React.FC<NavigationGuardProps> = ({
  children,
  requireAuth = true,
  requireProfile = false,
  redirectTo,
}) => {
  const navigation = useNavigation();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    // Don't check while loading
    if (isLoading) {
      return;
    }

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      logger.info('Navigation guard: User not authenticated, redirecting to login');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });
      return;
    }

    // Check profile completion requirement
    if (requireProfile && user && !user.isProfileComplete) {
      logger.info('Navigation guard: Profile incomplete, redirecting to profile setup');
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProfileSetup' as never }],
      });
      return;
    }

    // Custom redirect
    if (redirectTo && !isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: redirectTo as never }],
      });
      return;
    }
  }, [isAuthenticated, user, isLoading, requireAuth, requireProfile, redirectTo, navigation]);

  // Show nothing while loading to prevent flash of content
  if (isLoading) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

/**
 * HOC to wrap screens with navigation guard
 * @param Component - Component to wrap
 * @param options - Guard options
 * @returns Wrapped component
 */
export function withNavigationGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<NavigationGuardProps, 'children'> = {}
) {
  return function GuardedComponent(props: P) {
    return (
      <NavigationGuard {...options}>
        <Component {...props} />
      </NavigationGuard>
    );
  };
}

/**
 * Hook to check if user can access a route
 * @returns Boolean indicating if navigation is allowed
 */
export function useCanNavigate(
  requireAuth: boolean = true,
  requireProfile: boolean = false
): boolean {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return false;
  }

  if (requireAuth && !isAuthenticated) {
    return false;
  }

  if (requireProfile && user && !user.isProfileComplete) {
    return false;
  }

  return true;
}
