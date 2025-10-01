import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { Text, useTheme, Card, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '@store/profileStore';
import { useAuthStore } from '@store/authStore';
import { useNotificationSettings, useNotificationPermission } from '@hooks';
import { SettingsItem } from '@components/profile/SettingsItem';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { settings, isLoadingSettings, fetchSettings, toggleBiometric, updateSettings } = useProfileStore();
  const { biometricAvailable } = useAuthStore();
  const { settings: notificationSettings, updateSettings: updateNotificationSettings } = useNotificationSettings();
  const { hasPermission, canAskAgain, requestPermissions } = useNotificationPermission();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleBiometricToggle = async (enabled: boolean) => {
    await toggleBiometric(enabled);
  };

  const handleAutoLockToggle = async (enabled: boolean) => {
    await updateSettings({ autoLockEnabled: enabled });
  };

  const handleNotificationMasterToggle = async (enabled: boolean) => {
    if (enabled && !hasPermission) {
      // Request permission if not granted
      const status = await requestPermissions();
      if (!status.granted) {
        // Show alert to open settings
        Alert.alert(
          'Izin Notifikasi Diperlukan',
          'Buka pengaturan untuk mengaktifkan notifikasi',
          [
            { text: 'Batal', style: 'cancel' },
            { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }
    await updateNotificationSettings({ enabled });
  };

  const handleTransactionNotificationToggle = async (enabled: boolean) => {
    await updateNotificationSettings({ transactions: enabled });
  };

  const handleBalanceNotificationToggle = async (enabled: boolean) => {
    await updateNotificationSettings({ balanceUpdates: enabled });
  };

  const handleOrderNotificationToggle = async (enabled: boolean) => {
    await updateNotificationSettings({ orderUpdates: enabled });
  };

  const handlePromotionalNotificationToggle = async (enabled: boolean) => {
    await updateNotificationSettings({ promotions: enabled });
  };

  const handleFitChallengeNotificationToggle = async (enabled: boolean) => {
    await updateNotificationSettings({ fitChallenge: enabled });
  };

  const handleSystemNotificationToggle = async (enabled: boolean) => {
    await updateNotificationSettings({ system: enabled });
  };

  const handleSoundToggle = async (enabled: boolean) => {
    await updateNotificationSettings({ soundEnabled: enabled });
  };

  const handleVibrationToggle = async (enabled: boolean) => {
    await updateNotificationSettings({ vibrationEnabled: enabled });
  };

  const handleBadgeToggle = async (enabled: boolean) => {
    await updateNotificationSettings({ badgeEnabled: enabled });
  };

  const handleBalanceVisibilityToggle = async (enabled: boolean) => {
    await updateSettings({ showBalanceOnHome: enabled });
  };

  if (isLoadingSettings) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginTop: 16 }}>
            Memuat pengaturan...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Security Settings */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            KEAMANAN
          </Text>
          <Card style={styles.card}>
            <SettingsItem
              icon="fingerprint"
              label="Autentikasi Biometrik"
              description={
                biometricAvailable
                  ? 'Gunakan sidik jari atau Face ID untuk login'
                  : 'Biometrik tidak tersedia di perangkat ini'
              }
              type="switch"
              value={settings.biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!biometricAvailable}
            />
            <Divider />
            <SettingsItem
              icon="lock-clock"
              label="Kunci Otomatis"
              description={`Kunci aplikasi setelah ${settings.autoLockDuration} menit tidak aktif`}
              type="switch"
              value={settings.autoLockEnabled}
              onValueChange={handleAutoLockToggle}
            />
            <Divider />
            <SettingsItem
              icon="timer-cog"
              label="Durasi Kunci Otomatis"
              description={`${settings.autoLockDuration} menit`}
              type="navigation"
              onPress={() => {
                // TODO: Navigate to duration picker
              }}
            />
          </Card>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            NOTIFIKASI
          </Text>
          <Card style={styles.card}>
            <SettingsItem
              icon="bell-cog"
              label="Kelola Notifikasi"
              description="Atur preferensi notifikasi detail"
              type="navigation"
              onPress={() => navigation.navigate('Notifications')}
            />
            <Divider />
            <SettingsItem
              icon="bell"
              label="Aktifkan Notifikasi"
              description="Master toggle untuk semua notifikasi"
              type="switch"
              value={notificationSettings.enabled}
              onValueChange={handleNotificationMasterToggle}
            />
            <Divider />
            <SettingsItem
              icon="cash"
              label="Notifikasi Transaksi"
              description="Dapatkan notifikasi untuk setiap transaksi"
              type="switch"
              value={notificationSettings.transactions}
              onValueChange={handleTransactionNotificationToggle}
              disabled={!notificationSettings.enabled}
            />
            <Divider />
            <SettingsItem
              icon="wallet"
              label="Notifikasi Saldo"
              description="Dapatkan notifikasi saat saldo berubah"
              type="switch"
              value={notificationSettings.balanceUpdates}
              onValueChange={handleBalanceNotificationToggle}
              disabled={!notificationSettings.enabled}
            />
            <Divider />
            <SettingsItem
              icon="package-variant"
              label="Notifikasi Pesanan"
              description="Dapatkan notifikasi status pesanan"
              type="switch"
              value={notificationSettings.orderUpdates}
              onValueChange={handleOrderNotificationToggle}
              disabled={!notificationSettings.enabled}
            />
            <Divider />
            <SettingsItem
              icon="sale"
              label="Notifikasi Promo"
              description="Dapatkan notifikasi tentang promo dan penawaran"
              type="switch"
              value={notificationSettings.promotions}
              onValueChange={handlePromotionalNotificationToggle}
              disabled={!notificationSettings.enabled}
            />
            <Divider />
            <SettingsItem
              icon="run"
              label="Notifikasi Fit Challenge"
              description="Dapatkan notifikasi program Fit Challenge"
              type="switch"
              value={notificationSettings.fitChallenge}
              onValueChange={handleFitChallengeNotificationToggle}
              disabled={!notificationSettings.enabled}
            />
            <Divider />
            <SettingsItem
              icon="information"
              label="Notifikasi Sistem"
              description="Dapatkan notifikasi sistem dan maintenance"
              type="switch"
              value={notificationSettings.system}
              onValueChange={handleSystemNotificationToggle}
              disabled={!notificationSettings.enabled}
            />
            <Divider />
            <SettingsItem
              icon="volume-high"
              label="Suara"
              description="Mainkan suara notifikasi"
              type="switch"
              value={notificationSettings.soundEnabled}
              onValueChange={handleSoundToggle}
              disabled={!notificationSettings.enabled}
            />
            <Divider />
            <SettingsItem
              icon="vibrate"
              label="Getaran"
              description="Aktifkan getaran"
              type="switch"
              value={notificationSettings.vibrationEnabled}
              onValueChange={handleVibrationToggle}
              disabled={!notificationSettings.enabled}
            />
            <Divider />
            <SettingsItem
              icon="numeric"
              label="Badge"
              description="Tampilkan jumlah notifikasi di icon app"
              type="switch"
              value={notificationSettings.badgeEnabled}
              onValueChange={handleBadgeToggle}
              disabled={!notificationSettings.enabled}
            />
          </Card>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            PRIVASI
          </Text>
          <Card style={styles.card}>
            <SettingsItem
              icon="eye"
              label="Tampilkan Saldo di Beranda"
              description="Tampilkan saldo Anda di halaman utama"
              type="switch"
              value={settings.showBalanceOnHome}
              onValueChange={handleBalanceVisibilityToggle}
            />
            <Divider />
            <SettingsItem
              icon="history"
              label="Tampilkan Riwayat Transaksi"
              description="Tampilkan riwayat transaksi di profil"
              type="switch"
              value={settings.showTransactionHistory}
              onValueChange={async (enabled) => {
                await updateSettings({ showTransactionHistory: enabled });
              }}
            />
          </Card>
        </View>

        {/* Appearance Settings */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            TAMPILAN
          </Text>
          <Card style={styles.card}>
            <SettingsItem
              icon="theme-light-dark"
              label="Tema Aplikasi"
              description={settings.theme === 'dark' ? 'Gelap' : settings.theme === 'light' ? 'Terang' : 'Mengikuti Sistem'}
              type="navigation"
              onPress={() => {
                // TODO: Navigate to theme picker
              }}
            />
            <Divider />
            <SettingsItem
              icon="translate"
              label="Bahasa"
              description={settings.language === 'id' ? 'Bahasa Indonesia' : 'English'}
              type="navigation"
              onPress={() => {
                // TODO: Navigate to language picker
              }}
            />
          </Card>
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            DATA & PENYIMPANAN
          </Text>
          <Card style={styles.card}>
            <SettingsItem
              icon="cached"
              label="Hapus Cache"
              description="Hapus data cache aplikasi untuk mengosongkan ruang"
              type="navigation"
              onPress={() => {
                // TODO: Implement cache clearing
              }}
            />
            <Divider />
            <SettingsItem
              icon="database-export"
              label="Ekspor Data"
              description="Ekspor data transaksi Anda"
              type="navigation"
              onPress={() => {
                // TODO: Implement data export
              }}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
