import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, useTheme, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';
import { BarCodeScanner, BarCodeEvent } from 'expo-barcode-scanner';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabScreenProps } from '@types';
import { useQRStore } from '@store/qrStore';
import { useNetworkStatus } from '@hooks/useNetworkStatus';

export const QRScannerScreen: React.FC<MainTabScreenProps<'QRScanner'>> = ({ navigation }) => {
  const theme = useTheme();
  const { scanQRCode, isScanning, scanResult, clearScanResult } = useQRStore();
  const { isOffline } = useNetworkStatus();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  useEffect(() => {
    // Navigate to payment screen when scan is successful
    if (scanResult && scanResult.success && !scanned) {
      setScanned(true);
      (navigation as any).navigate('QRPayment', {
        qrData: scanResult.data,
        merchant: scanResult.merchant,
      });
      // Clear after navigation
      setTimeout(() => {
        clearScanResult();
        setScanned(false);
      }, 500);
    } else if (scanResult && !scanResult.success) {
      Alert.alert('Scan Gagal', scanResult.error || 'QR code tidak valid', [
        {
          text: 'OK',
          onPress: () => {
            clearScanResult();
            setScanned(false);
          },
        },
      ]);
    }
  }, [scanResult]);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ type, data }: BarCodeEvent) => {
    if (scanned || isScanning) return;

    setScanned(true);
    await scanQRCode(data);
  };

  const handleManualReset = () => {
    setScanned(false);
    clearScanResult();
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={[styles.message, { color: theme.colors.onSurface }]}>
            Meminta izin kamera...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.centerContent}>
          <Icon name="camera-off" size={64} color={theme.colors.onSurfaceVariant} />
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            Izin Kamera Diperlukan
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.message, { color: theme.colors.onSurfaceVariant, textAlign: 'center' }]}
          >
            Aplikasi memerlukan akses kamera untuk memindai QR code. Silakan aktifkan izin kamera di pengaturan
            perangkat Anda.
          </Text>
          <Button mode="contained" onPress={requestCameraPermission} style={styles.button}>
            Minta Izin Kamera
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]} edges={['top']}>
      <Camera
        style={styles.camera}
        type={CameraType.back}
        enableTorch={flashEnabled}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.headerText}>
              Pindai QR Code
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtext}>
              Arahkan kamera ke QR code untuk melakukan pembayaran
            </Text>
          </View>

          {/* Offline Indicator */}
          {isOffline && (
            <View style={[styles.offlineIndicator, { backgroundColor: theme.colors.errorContainer }]}>
              <Icon name="wifi-off" size={16} color={theme.colors.error} />
              <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 8 }}>
                Mode Offline - Transaksi akan disimpan
              </Text>
            </View>
          )}

          {/* Scan Frame */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft, { borderColor: theme.colors.primary }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: theme.colors.primary }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.colors.primary }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: theme.colors.primary }]} />

            {isScanning && (
              <View style={styles.scanningIndicator}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.scanningText}>
                  Memproses...
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {scanned && (
              <Button
                mode="contained"
                onPress={handleManualReset}
                icon="reload"
                style={styles.button}
                buttonColor={theme.colors.surface}
                textColor={theme.colors.onSurface}
              >
                Pindai Ulang
              </Button>
            )}
            <Button
              mode="text"
              onPress={() => setFlashEnabled(!flashEnabled)}
              icon={flashEnabled ? 'flash' : 'flash-off'}
              style={styles.button}
              textColor="#FFFFFF"
            >
              {flashEnabled ? 'Matikan Flash' : 'Nyalakan Flash'}
            </Button>
            <Button
              mode="text"
              onPress={() => (navigation as any).navigate('QRGenerate')}
              icon="qrcode"
              style={styles.button}
              textColor="#FFFFFF"
            >
              Tampilkan QR Saya
            </Button>
          </View>
        </View>
      </Camera>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontWeight: '700',
    marginTop: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  scanFrame: {
    alignSelf: 'center',
    width: 280,
    height: 280,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanningIndicator: {
    alignItems: 'center',
    gap: 12,
  },
  scanningText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    gap: 12,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 24,
    marginBottom: 16,
  },
});
