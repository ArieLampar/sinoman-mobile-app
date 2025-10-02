import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Button, TextInput, Card, RadioButton, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SavingsType, PaymentMethod, PaymentMethodOption } from '@types';
import { useSavingsStore } from '@store/savingsStore';
import { formatCurrency } from '@utils/formatters';
import { toastError, showSuccessToast } from '@utils/toast';

interface TopUpScreenProps {
  navigation: any;
  route?: {
    params?: {
      savingsType?: SavingsType;
    };
  };
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: PaymentMethod.BANK_TRANSFER,
    name: 'Transfer Bank',
    icon: 'bank-transfer',
    enabled: true,
    fee: 0,
  },
  {
    id: PaymentMethod.VIRTUAL_ACCOUNT,
    name: 'Virtual Account',
    icon: 'credit-card-outline',
    enabled: true,
    fee: 4000,
  },
  {
    id: PaymentMethod.E_WALLET,
    name: 'E-Wallet',
    icon: 'wallet-outline',
    enabled: true,
    fee: 1500,
  },
  {
    id: PaymentMethod.CREDIT_CARD,
    name: 'Kartu Kredit',
    icon: 'credit-card',
    enabled: false,
    fee: 0,
  },
];

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export const TopUpScreen: React.FC<TopUpScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { topUp, generateReceipt, isLoading } = useSavingsStore();

  const [selectedType, setSelectedType] = useState<SavingsType>(
    route?.params?.savingsType || SavingsType.SUKARELA
  );
  const [amount, setAmount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.BANK_TRANSFER
  );

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const selectedPayment = PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod);
  const totalAmount = numericAmount + (selectedPayment?.fee || 0);
  const minAmount = 10000;
  const maxAmount = 10000000;

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    setAmount(numericValue);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleTopUp = async () => {
    // Validation
    if (numericAmount < minAmount) {
      toastError(`Minimal top up adalah ${formatCurrency(minAmount)}`);
      return;
    }

    if (numericAmount > maxAmount) {
      toastError(`Maksimal top up adalah ${formatCurrency(maxAmount)}`);
      return;
    }

    if (!selectedPayment?.enabled) {
      toastError('Metode pembayaran yang dipilih tidak tersedia');
      return;
    }

    try {
      const result = await topUp({
        savingsType: selectedType,
        amount: numericAmount,
        paymentMethod: selectedPaymentMethod,
      });

      if (result.status === 'success') {
        // Generate receipt
        const receipt = await generateReceipt(result.transactionId);

        if (receipt) {
          // Navigate to receipt screen
          navigation.navigate('Receipt', {
            transactionId: result.transactionId,
            receipt
          });
        } else {
          // Fallback if receipt generation fails
          showSuccessToast({
            title: 'Top Up Berhasil',
            message: `Saldo ${getSavingsTypeLabel(selectedType)} Anda telah bertambah ${formatCurrency(numericAmount)}`,
            onPress: () => navigation.goBack(),
          });
        }
      } else if (result.status === 'pending' && result.paymentUrl) {
        // Navigate to payment page (WebView)
        // TODO: Implement payment WebView screen
        showSuccessToast({
          title: 'Menunggu Pembayaran',
          message: 'Silakan selesaikan pembayaran Anda',
          onPress: () => navigation.goBack(),
        });
      }
    } catch (error: any) {
      toastError(error.message || 'Terjadi kesalahan saat melakukan top up');
    }
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
        {/* Savings Type Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Jenis Simpanan
            </Text>
            <RadioButton.Group onValueChange={(value) => setSelectedType(value as SavingsType)} value={selectedType}>
              <View style={styles.radioItem}>
                <RadioButton.Item label="Simpanan Pokok" value={SavingsType.POKOK} />
              </View>
              <Divider />
              <View style={styles.radioItem}>
                <RadioButton.Item label="Simpanan Wajib" value={SavingsType.WAJIB} />
              </View>
              <Divider />
              <View style={styles.radioItem}>
                <RadioButton.Item label="Simpanan Sukarela" value={SavingsType.SUKARELA} />
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Amount Input */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Jumlah Top Up
            </Text>

            <TextInput
              mode="outlined"
              label="Masukkan Jumlah"
              placeholder="0"
              value={amount ? formatCurrency(numericAmount).replace('Rp ', '') : ''}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              left={<TextInput.Affix text="Rp" />}
              style={styles.input}
            />

            <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
              Min: {formatCurrency(minAmount)} • Max: {formatCurrency(maxAmount)}
            </Text>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  mode={numericAmount === quickAmount ? 'contained' : 'outlined'}
                  onPress={() => handleQuickAmount(quickAmount)}
                  style={styles.quickAmountButton}
                  compact
                >
                  {formatCurrency(quickAmount).replace('Rp ', '').replace('.00', '')}
                </Button>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Payment Method */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Metode Pembayaran
            </Text>

            <RadioButton.Group
              onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}
              value={selectedPaymentMethod}
            >
              {PAYMENT_METHODS.map((method, index) => (
                <React.Fragment key={method.id}>
                  <View style={[styles.paymentMethodItem, !method.enabled && styles.disabledItem]}>
                    <View style={styles.paymentMethodLeft}>
                      <Icon
                        name={method.icon}
                        size={24}
                        color={method.enabled ? theme.colors.onSurface : theme.colors.onSurfaceDisabled}
                      />
                      <View style={styles.paymentMethodInfo}>
                        <Text
                          variant="bodyLarge"
                          style={{ color: method.enabled ? theme.colors.onSurface : theme.colors.onSurfaceDisabled }}
                        >
                          {method.name}
                        </Text>
                        {method.fee > 0 && (
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Biaya admin: {formatCurrency(method.fee)}
                          </Text>
                        )}
                        {method.fee === 0 && method.enabled && (
                          <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                            Gratis biaya admin
                          </Text>
                        )}
                      </View>
                    </View>
                    <RadioButton value={method.id} disabled={!method.enabled} />
                  </View>
                  {index < PAYMENT_METHODS.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Ringkasan
            </Text>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Jenis Simpanan
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                {getSavingsTypeLabel(selectedType)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Jumlah Top Up
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {formatCurrency(numericAmount)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Biaya Admin
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {formatCurrency(selectedPayment?.fee || 0)}
              </Text>
            </View>

            <Divider style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                Total Pembayaran
              </Text>
              <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="contained"
          onPress={handleTopUp}
          disabled={numericAmount < minAmount || isLoading}
          loading={isLoading}
          style={styles.topUpButton}
        >
          {isLoading ? 'Memproses...' : 'Top Up Sekarang'}
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
  radioItem: {
    marginVertical: 0,
  },
  input: {
    marginBottom: 8,
  },
  hint: {
    marginBottom: 16,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    flexBasis: '30%',
    flexGrow: 1,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  disabledItem: {
    opacity: 0.5,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  paymentMethodInfo: {
    flex: 1,
    gap: 4,
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
  topUpButton: {
    paddingVertical: 6,
  },
});
