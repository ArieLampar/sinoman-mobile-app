import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Transaction } from '@types';
import { formatCurrency, formatDate } from '@utils/formatters';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const theme = useTheme();

  const getIcon = () => {
    switch (transaction.type) {
      case 'deposit':
        return { name: 'arrow-down-circle', color: theme.colors.primary };
      case 'withdrawal':
        return { name: 'arrow-up-circle', color: theme.colors.error };
      case 'transfer':
        return { name: 'swap-horizontal-circle', color: theme.colors.tertiary };
      case 'payment':
        return { name: 'qrcode-scan', color: theme.colors.secondary };
      default:
        return { name: 'circle', color: theme.colors.outline };
    }
  };

  const getTypeLabel = () => {
    switch (transaction.type) {
      case 'deposit':
        return 'Setoran';
      case 'withdrawal':
        return 'Penarikan';
      case 'transfer':
        return 'Transfer';
      case 'payment':
        return 'Pembayaran';
      default:
        return transaction.type;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'success':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.secondary;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const icon = getIcon();
  const isPositive = transaction.type === 'deposit';

  return (
    <Pressable onPress={onPress} style={[styles.container, { borderBottomColor: theme.colors.outlineVariant }]}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Icon name={icon.name} size={24} color={icon.color} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text variant="bodyLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
            {getTypeLabel()}
          </Text>
          <Text
            variant="bodyLarge"
            style={[
              styles.amount,
              { color: isPositive ? theme.colors.primary : theme.colors.error },
            ]}
          >
            {isPositive ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text variant="bodySmall" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            {transaction.description}
          </Text>
          <Text variant="bodySmall" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
            {formatDate(transaction.createdAt)}
          </Text>
        </View>

        {transaction.status !== 'success' && (
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text variant="bodySmall" style={[styles.statusText, { color: getStatusColor() }]}>
              {transaction.status === 'pending' ? 'Menunggu' : 'Gagal'}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
  },
  amount: {
    fontWeight: '700',
  },
  description: {
    flex: 1,
  },
  date: {
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});