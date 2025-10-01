/**
 * MyQRCodeScreen
 * Display user's personal QR code for receiving payments
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import { Text, useTheme, Button, Card, SegmentedButtons, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '@store/authStore';
import { useQRStore } from '@store/qrStore';
import { QRCodeType } from '@types';
import { formatCurrency } from '@utils/formatters';
import { logger } from '@utils/logger';

export const MyQRCodeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { generateQRCode, generatedQR, isGeneratingQR } = useQRStore();

  const [qrType, setQrType] = useState<'static' | 'dynamic'>('static');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [expiryMinutes, setExpiryMinutes] = useState<string>('30');

  // Generate QR code on mount or when settings change
  useEffect(() => {
    generateQR();
  }, [qrType, amount]);

  const generateQR = async () => {
    if (!user) return;

    const numericAmount = amount ? parseInt(amount.replace(/\D/g, ''), 10) : undefined;
    const expiry = qrType === 'dynamic' ? parseInt(expiryMinutes) : undefined;

    await generateQRCode({
      type: QRCodeType.PEER_TO_PEER,
      amount: numericAmount,
      description: description || undefined,
      expiresInMinutes: expiry,
    });
  };

  const handleShare = async () => {
    if (!generatedQR?.qrData) return;

    try {
      await Share.share({
        message: `Scan QR code ini untuk bayar ke ${user?.name || 'saya'}\n\nJumlah: ${amount ? formatCurrency(parseInt(amount.replace(/\D/g, ''), 10)) : 'Sesuai kebutuhan'}\n\nSinoman Mobile App`,
        title: 'QR Code Pembayaran',
      });
    } catch (error) {
      logger.error('Share QR error:', error);
    }
  };

  const handleRefresh = () => {
    generateQR();
    Alert.alert('QR Code Diperbarui', 'QR code baru telah dibuat');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            QR Code Saya
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Tunjukkan QR code ini untuk menerima pembayaran
          </Text>
        </View>

        {/* QR Type Selector */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Tipe QR Code
            </Text>
            <SegmentedButtons
              value={qrType}
              onValueChange={(value) => setQrType(value as 'static' | 'dynamic')}
              buttons={[
                {
                  value: 'static',
                  label: 'Statis',
                  icon: 'qrcode',
                },
                {
                  value: 'dynamic',
                  label: 'Dinamis',
                  icon: 'qrcode-scan',
                },
              ]}
              style={styles.segmentedButtons}
            />
            <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
              {qrType === 'static'
                ? 'QR code permanen untuk semua transaksi'
                : 'QR code dengan jumlah dan waktu kadaluarsa'}
            </Text>
          </Card.Content>
        </Card>

        {/* Dynamic QR Settings */}
        {qrType === 'dynamic' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Pengaturan
              </Text>

              {/* Amount Input */}
              <TextInput
                mode="outlined"
                label="Jumlah (Opsional)"
                placeholder="0"
                value={amount ? formatCurrency(parseInt(amount.replace(/\D/g, ''), 10)).replace('Rp ', '') : ''}
                onChangeText={(text) => setAmount(text.replace(/\D/g, ''))}
                keyboardType="numeric"
                left={<TextInput.Affix text="Rp" />}
                style={styles.input}
              />

              {/* Description Input */}
              <TextInput
                mode="outlined"
                label="Deskripsi (Opsional)"
                placeholder="Contoh: Bayar makan siang"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
              />

              {/* Expiry Input */}
              <TextInput
                mode="outlined"
                label="Kadaluarsa (Menit)"
                placeholder="30"
                value={expiryMinutes}
                onChangeText={setExpiryMinutes}
                keyboardType="numeric"
                style={styles.input}
              />

              <Button
                mode="contained"
                onPress={generateQR}
                loading={isGeneratingQR}
                disabled={isGeneratingQR}
                style={styles.generateButton}
              >
                Generate QR Code
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* QR Code Display */}
        {generatedQR?.qrData && (
          <Card style={styles.qrCard}>
            <Card.Content style={styles.qrCardContent}>
              {/* User Info */}
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Icon name="account" size={32} color={theme.colors.primary} />
                </View>
                <Text variant="titleLarge" style={[styles.userName, { color: theme.colors.onSurface }]}>
                  {user?.name || 'Member Sinoman'}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {user?.phone || ''}
                </Text>
              </View>

              {/* QR Code */}
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={generatedQR.qrData}
                  size={250}
                  color={theme.colors.onSurface}
                  backgroundColor={theme.colors.surface}
                />
              </View>

              {/* Amount Display */}
              {amount && (
                <View style={styles.amountDisplay}>
                  <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                    Jumlah
                  </Text>
                  <Text variant="headlineMedium" style={[styles.amountText, { color: theme.colors.primary }]}>
                    {formatCurrency(parseInt(amount.replace(/\D/g, ''), 10))}
                  </Text>
                </View>
              )}

              {/* Expiry Info */}
              {qrType === 'dynamic' && generatedQR.expiresAt && (
                <View style={[styles.expiryInfo, { backgroundColor: theme.colors.secondaryContainer }]}>
                  <Icon name="clock-outline" size={16} color={theme.colors.onSecondaryContainer} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer, marginLeft: 8 }}>
                    Berlaku hingga {new Date(generatedQR.expiresAt).toLocaleString('id-ID')}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleRefresh}
            icon="refresh"
            style={styles.actionButton}
          >
            Perbarui
          </Button>
          <Button
            mode="outlined"
            onPress={handleShare}
            icon="share-variant"
            style={styles.actionButton}
            disabled={!generatedQR?.qrData}
          >
            Bagikan
          </Button>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Icon name="information-outline" size={20} color={theme.colors.primary} />
          <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
            Tunjukkan QR code ini kepada pembayar untuk menerima uang ke simpanan Anda
          </Text>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  hint: {
    fontStyle: 'italic',
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
  },
  generateButton: {
    marginTop: 8,
  },
  qrCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  qrCardContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  qrCodeContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
  },
  amountDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amountText: {
    fontWeight: '700',
    marginTop: 4,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
});
