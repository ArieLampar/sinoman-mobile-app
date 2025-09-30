import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Balance } from '@types';
import { formatCurrency } from '@utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';

interface BalanceCardProps {
  balance: Balance | null;
  isLoading?: boolean;
  onPress?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, isLoading, onPress }) => {
  const theme = useTheme();

  const totalBalance = balance?.total || 0;

  return (
    <Card style={styles.card} elevation={4}>
      <Pressable onPress={onPress} disabled={!onPress}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Icon name="wallet" size={24} color="#FFFFFF" />
                <Text variant="titleMedium" style={styles.headerText}>
                  Total Simpanan
                </Text>
              </View>
              {onPress && (
                <Icon name="chevron-right" size={24} color="#FFFFFF" />
              )}
            </View>

            {/* Balance Amount */}
            <View style={styles.balanceContainer}>
              {isLoading ? (
                <Text variant="displaySmall" style={styles.balanceText}>
                  Loading...
                </Text>
              ) : (
                <Text variant="displaySmall" style={styles.balanceText}>
                  {formatCurrency(totalBalance)}
                </Text>
              )}
            </View>

            {/* Breakdown */}
            {!isLoading && balance && (
              <View style={styles.breakdown}>
                <View style={styles.breakdownItem}>
                  <Text variant="bodySmall" style={styles.breakdownLabel}>
                    Pokok
                  </Text>
                  <Text variant="bodyMedium" style={styles.breakdownValue}>
                    {formatCurrency(balance.pokok)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.breakdownItem}>
                  <Text variant="bodySmall" style={styles.breakdownLabel}>
                    Wajib
                  </Text>
                  <Text variant="bodyMedium" style={styles.breakdownValue}>
                    {formatCurrency(balance.wajib)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.breakdownItem}>
                  <Text variant="bodySmall" style={styles.breakdownLabel}>
                    Sukarela
                  </Text>
                  <Text variant="bodyMedium" style={styles.breakdownValue}>
                    {formatCurrency(balance.sukarela)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  content: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  balanceContainer: {
    paddingVertical: 8,
  },
  balanceText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  breakdownLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  breakdownValue: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
});