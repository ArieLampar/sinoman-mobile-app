/**
 * Error Boundary Component
 * Catches React errors and provides graceful fallback UI
 */

import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { logger } from '@utils/logger';
import { captureError, addBreadcrumb } from '@services/monitoring';
import { getUserFriendlyMessage, getRecoveryActions } from '@services/monitoring/errorMessages';
import { ErrorSeverity } from '@types';

interface Props {
  children: ReactNode;
  context?: string;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches React errors
 * and provides a fallback UI with recovery options
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error to monitoring services
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { context } = this.props;

    // Add breadcrumb for context
    addBreadcrumb(
      `Error caught in ${context || 'App'}`,
      'error',
      {
        componentStack: errorInfo.componentStack?.slice(0, 500), // Limit size
      }
    );

    // Capture error in Sentry
    captureError(
      error,
      {
        screen: context,
        action: 'component_error',
        timestamp: new Date().toISOString(),
        additionalData: {
          componentStack: errorInfo.componentStack?.slice(0, 500),
        },
      },
      ErrorSeverity.FATAL
    );

    // Log to console in development
    if (__DEV__) {
      logger.error('[ErrorBoundary] Error caught:', error);
      logger.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    }
  }

  /**
   * Reset error state and allow retry
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });

    // Add breadcrumb for error reset
    addBreadcrumb(
      `Error boundary reset in ${this.props.context || 'App'}`,
      'user-action',
      {}
    );
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    // No error - render children normally
    if (!hasError || !error) {
      return children;
    }

    // Use custom fallback if provided
    if (fallback) {
      return fallback(error, this.resetError);
    }

    // Default fallback UI
    const userMessage = getUserFriendlyMessage(error);
    const recoveryActions = getRecoveryActions(error, {
      retry: this.resetError,
    });

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Oops! Terjadi Kesalahan
          </Text>

          <Text variant="bodyLarge" style={styles.message}>
            {userMessage}
          </Text>

          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text variant="labelSmall" style={styles.debugLabel}>
                Debug Info:
              </Text>
              <Text variant="bodySmall" style={styles.debugText}>
                {error.message}
              </Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
            {recoveryActions.map((action, index) => (
              <Button
                key={index}
                mode={action.isPrimary ? 'contained' : 'outlined'}
                onPress={() => action.action()}
                style={styles.actionButton}
              >
                {action.label}
              </Button>
            ))}

            {recoveryActions.length === 0 && (
              <Button
                mode="contained"
                onPress={this.resetError}
                style={styles.actionButton}
              >
                Coba Lagi
              </Button>
            )}
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  debugContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  debugLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#d32f2f',
  },
  debugText: {
    fontFamily: 'monospace',
    color: '#666',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export { ErrorBoundary };
