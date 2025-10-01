import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, useTheme, Button, Card, Divider, RadioButton, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { QRCodeData, MerchantInfo, SavingsType } from '@types';
import { useQRStore } from '@store/qrStore';
import { useSavingsStore } from '@store/savingsStore';
import { formatCurrency } from '@utils/formatters';
import { OfflineIndicator } from '@components/common/OfflineIndicator';

interface QRPaymentScreenProps {
  navigation: any;
  route: {
    params: {
      qrData: QRCodeData;
      merchant?: MerchantInfo;
    };
  };
}

export const QRPaymentScreen: React.FC<QRPaymentScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { qrData, merchant } = route.params;
  const { processPayment, isProcessingPayment } = useQRStore();
  const { balance } = useSavingsStore();

  const [selectedSavingsType, setSelectedSavingsType] = useState<SavingsType>(SavingsType.SUKARELA);
  const [amount, setAmount] = useState<string>(qrData.amount?.toString() || '');
  const [notes, setNotes] = useState<string>('');

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const selectedBalance = balance?.[selectedSavingsType] || 0;
  const isAmountFixed = !!qrData.amount;
  const isSufficientBalance = selectedBalance >= numericAmount;

  const handleAmountChange = (text: string) => {
    if (!isAmountFixed) {
      const numericValue = text.replace(/\D/g, '');
      setAmount(numericValue);
    }
  };

  const handlePayment = async () => {
    // Validation
    if (numericAmount < 1000) {
      Alert.alert('Jumlah Tidak Valid', 'Minimal pembayaran adalah Rp 1.000');
      return;
    }

    if (!isSufficientBalance) {
      Alert.alert('Saldo Tidak Cukup', `Saldo ${getSavingsTypeLabel(selectedSavingsType)} Anda tidak mencukupi`);
      return;
    }

    // Confirm payment
    Alert.alert(
      'Konfirmasi Pembayaran',
      `Anda akan membayar ${formatCurrency(numericAmount)} ke ${merchant?.name || 'penerima'} menggunakan ${getSavingsTypeLabel(selectedSavingsType)}. Lanjutkan?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Bayar',
          onPress: async () => {
            const result = await processPayment({
              qrData,
              amount: numericAmount,
              savingsType: selectedSavingsType,
              notes,
            });

            if (result.success) {
              const isQueued = result.message?.includes('disimpan');
              Alert.alert(
                isQueued ? 'Transaksi Disimpan' : 'Pembayaran Berhasil',
                result.message || 'Transaksi telah selesai',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Dashboard'),
                  },
                ]
              );
            } else {
              Alert.alert('Pembayaran Gagal', result.error || 'Terjadi kesalahan');
            }
          },
        },
      ]
    );
  };

  const getSavingsTypeLabel = (type: SavingsType): string => {
    switch (type) {
      case SavingsType.POKOK:
        return 'Simpanan Pokok';
      case SavingsType.WAJIB:
        return 'Simpanan Wajib';
      case SavingsType.SUKARELA:
        return 'Simpanan Sukarela';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Merchant Info */}
        {merchant && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.merchantHeader}>
                {merchant.logoUrl ? (
                  <Image source={{ uri: merchant.logoUrl }} style={styles.merchantLogo} />
                ) : (
                  <View style={[styles.merchantLogoPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Icon name="store" size={32} color={theme.colors.onSurfaceVariant} />
                  </View>
                )}
                <View style={styles.merchantInfo}>
                  <View style={styles.merchantNameRow}>
                    <Text variant="titleLarge" style={[styles.merchantName, { color: theme.colors.onSurface }]}>
                      {merchant.name}
                    </Text>
                    {merchant.isVerified && (
                      <Icon name="check-decagram" size={20} color={theme.colors.primary} />
                    )}
                  </View>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {merchant.category}
                  </Text>
                  {merchant.rating && (
                    <View style={styles.ratingRow}>
                      <Icon name="star" size={16} color="#FFB800" />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {merchant.rating.toFixed(1)} • {merchant.totalTransactions} transaksi
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Amount */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Jumlah Pembayaran
            </Text>

            <TextInput
              mode="outlined"
              label="Jumlah"
              placeholder="0"
              value={amount ? formatCurrency(numericAmount).replace('Rp ', '') : ''}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              left={<TextInput.Affix text="Rp" />}
              style={styles.input}
              disabled={isAmountFixed}
            />

            {isAmountFixed && (
              <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                Jumlah ditentukan oleh merchant
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Payment Source */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Bayar Dari
            </Text>

            <RadioButton.Group
              onValueChange={(value) => setSelectedSavingsType(value as SavingsType)}
              value={selectedSavingsType}
            >
              <View style={styles.radioItem}>
                <RadioButton.Item
                  label={`Simpanan Pokok - ${formatCurrency(balance?.pokok || 0)}`}
                  value={SavingsType.POKOK}
                  disabled={(balance?.pokok || 0) < numericAmount}
                />
              </View>
              <Divider />
              <View style={styles.radioItem}>
                <RadioButton.Item
                  label={`Simpanan Wajib - ${formatCurrency(balance?.wajib || 0)}`}
                  value={SavingsType.WAJIB}
                  disabled={(balance?.wajib || 0) < numericAmount}
                />
              </View>
              <Divider />
              <View style={styles.radioItem}>
                <RadioButton.Item
                  label={`Simpanan Sukarela - ${formatCurrency(balance?.sukarela || 0)}`}
                  value={SavingsType.SUKARELA}
                  disabled={(balance?.sukarela || 0) < numericAmount}
                />
              </View>
            </RadioButton.Group>

            {!isSufficientBalance && numericAmount > 0 && (
              <View style={[styles.warningBox, { backgroundColor: theme.colors.errorContainer }]}>
                <Icon name="alert-circle" size={20} color={theme.colors.error} />
                <Text variant="bodySmall" style={{ color: theme.colors.error, flex: 1 }}>
                  Saldo tidak mencukupi. Silakan pilih sumber pembayaran lain atau lakukan top up.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Notes */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Catatan (Opsional)
            </Text>

            <TextInput
              mode="outlined"
              label="Tambah Catatan"
              placeholder="Contoh: Bayar makan siang"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Sumber Pembayaran
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                {getSavingsTypeLabel(selectedSavingsType)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Saldo Tersedia
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {formatCurrency(selectedBalance)}
              </Text>
            </View>

            <Divider style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                Total Pembayaran
              </Text>
              <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                {formatCurrency(numericAmount)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Saldo Setelah Pembayaran
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                {formatCurrency(Math.max(0, selectedBalance - numericAmount))}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="contained"
          onPress={handlePayment}
          disabled={!isSufficientBalance || numericAmount < 1000 || isProcessingPayment}
          loading={isProcessingPayment}
          style={styles.payButton}
        >
          {isProcessingPayment ? 'Memproses...' : `Bayar ${formatCurrency(numericAmount)}`}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  merchantHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  merchantLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  merchantLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  merchantInfo: {
    flex: 1,
    gap: 4,
  },
  merchantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  merchantName: {
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  input: {
    marginBottom: 8,
  },
  hint: {
    fontStyle: 'italic',
  },
  radioItem: {
    marginVertical: 0,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryDivider: {
    marginVertical: 12,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  payButton: {
    paddingVertical: 6,
  },
});
