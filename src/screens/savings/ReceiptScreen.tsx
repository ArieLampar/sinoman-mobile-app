import React from 'react';
import { View, StyleSheet, ScrollView, Share } from 'react-native';
import { Text, Button, Divider, useTheme, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList, SavingsType } from '@types';
import { formatCurrency, formatDate } from '@utils/formatters';

type ReceiptScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Receipt'>;
type ReceiptScreenRouteProp = RouteProp<RootStackParamList, 'Receipt'>;

interface ReceiptScreenProps {
  navigation: ReceiptScreenNavigationProp;
  route: ReceiptScreenRouteProp;
}

export const ReceiptScreen: React.FC<ReceiptScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { receipt } = route.params;

  const getSavingsTypeLabel = (type: SavingsType): string => {
    switch (type) {
      case SavingsType.POKOK:
        return 'Simpanan Pokok';
      case SavingsType.WAJIB:
        return 'Simpanan Wajib';
      case SavingsType.SUKARELA:
        return 'Simpanan Sukarela';
      default:
        return type;
    }
  };

  const getTransactionTypeLabel = (type: string): string => {
    switch (type) {
      case 'deposit':
        return 'Setoran';
      case 'withdrawal':
        return 'Penarikan';
      case 'transfer':
        return 'Transfer';
      case 'payment':
        return 'Pembayaran';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'success':
        return 'Berhasil';
      case 'pending':
        return 'Menunggu';
      case 'failed':
        return 'Gagal';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success':
        return theme.colors.primary;
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const handleShare = async () => {
    const message = `
Struk Transaksi Sinoman
━━━━━━━━━━━━━━━━━━━━
ID: ${receipt.transactionId}
Ref: ${receipt.referenceId}

Jenis: ${getTransactionTypeLabel(receipt.type)}
Simpanan: ${getSavingsTypeLabel(receipt.savingsType)}
Jumlah: ${formatCurrency(receipt.amount)}
Biaya Admin: ${formatCurrency(receipt.fee)}
Total: ${formatCurrency(receipt.totalAmount)}

Status: ${getStatusLabel(receipt.status)}
Waktu: ${formatDate(receipt.timestamp)}

Saldo Sebelum: ${formatCurrency(receipt.balanceBefore)}
Saldo Setelah: ${formatCurrency(receipt.balanceAfter)}
━━━━━━━━━━━━━━━━━━━━
    `.trim();

    try {
      await Share.share({
        message,
        title: 'Struk Transaksi Sinoman',
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  const handleDone = () => {
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Icon
            name={receipt.status === 'success' ? 'check-circle' : receipt.status === 'pending' ? 'clock-outline' : 'alert-circle'}
            size={80}
            color={getStatusColor(receipt.status)}
          />
        </View>

        {/* Status */}
        <Text variant="headlineSmall" style={[styles.statusText, { color: getStatusColor(receipt.status) }]}>
          {getStatusLabel(receipt.status)}
        </Text>

        {/* Amount */}
        <Text variant="displaySmall" style={[styles.amount, { color: theme.colors.onSurface }]}>
          {formatCurrency(receipt.totalAmount)}
        </Text>

        {/* Receipt Card */}
        <Card style={styles.receiptCard}>
          <Card.Content>
            {/* Transaction Details */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Detail Transaksi
              </Text>

              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  ID Transaksi
                </Text>
                <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                  {receipt.transactionId.substring(0, 16)}...
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Referensi
                </Text>
                <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                  {receipt.referenceId}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Jenis Transaksi
                </Text>
                <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                  {getTransactionTypeLabel(receipt.type)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Jenis Simpanan
                </Text>
                <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                  {getSavingsTypeLabel(receipt.savingsType)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Waktu
                </Text>
                <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                  {formatDate(receipt.timestamp)}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Payment Details */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Rincian Pembayaran
              </Text>

              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Jumlah
                </Text>
                <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                  {formatCurrency(receipt.amount)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Biaya Admin
                </Text>
                <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                  {formatCurrency(receipt.fee)}
                </Text>
              </View>

              <View style={[styles.detailRow, styles.totalRow]}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                  Total
                </Text>
                <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                  {formatCurrency(receipt.totalAmount)}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Balance Info */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Informasi Saldo
              </Text>

              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Saldo Sebelum
                </Text>
                <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                  {formatCurrency(receipt.balanceBefore)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Saldo Setelah
                </Text>
                <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.primary, fontWeight: '700' }]}>
                  {formatCurrency(receipt.balanceAfter)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleShare}
            icon="share-variant"
            style={styles.shareButton}
          >
            Bagikan
          </Button>

          <Button
            mode="contained"
            onPress={handleDone}
            style={styles.doneButton}
          >
            Selesai
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    marginVertical: 24,
  },
  statusText: {
    fontWeight: '700',
    marginBottom: 8,
  },
  amount: {
    fontWeight: '700',
    marginBottom: 24,
  },
  receiptCard: {
    width: '100%',
    marginBottom: 24,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailValue: {
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  totalRow: {
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  shareButton: {
    marginBottom: 8,
  },
  doneButton: {
    marginBottom: 16,
  },
});
