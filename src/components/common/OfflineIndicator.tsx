/**
 * OfflineIndicator Component
 * Shows offline status and queued transactions count
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { useQRStore } from '@store/qrStore';

interface OfflineIndicatorProps {
  onPress?: () => void;
  showQueueCount?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onPress,
  showQueueCount = true,
}) => {
  const theme = useTheme();
  const { isOffline } = useNetworkStatus();
  const { getQueuedTransactionsCount } = useQRStore();

  const queueCount = getQueuedTransactionsCount();

  if (!isOffline && queueCount === 0) {
    return null; // Don't show if online and no queued transactions
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, { backgroundColor: theme.colors.errorContainer }]}
      disabled={!onPress}
    >
      <Icon name="wifi-off" size={16} color={theme.colors.error} />
      <Text variant="bodySmall" style={[styles.text, { color: theme.colors.error }]}>
        {isOffline ? 'Mode Offline' : 'Tersambung'}
      </Text>
      {showQueueCount && queueCount > 0 && (
        <Badge
          size={20}
          style={[styles.badge, { backgroundColor: theme.colors.error }]}
        >
          {queueCount}
        </Badge>
      )}
      {onPress && (
        <Icon name="chevron-right" size={16} color={theme.colors.error} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  text: {
    flex: 1,
    fontWeight: '600',
  },
  badge: {
    marginLeft: 8,
  },
});
