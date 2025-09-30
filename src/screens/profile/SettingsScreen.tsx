import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Card, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '@store/profileStore';
import { useAuthStore } from '@store/authStore';
import { SettingsItem } from '@components/profile/SettingsItem';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { settings, isLoadingSettings, fetchSettings, toggleBiometric, updateSettings } = useProfileStore();
  const { biometricAvailable } = useAuthStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleBiometricToggle = async (enabled: boolean) => {
    await toggleBiometric(enabled);
  };

  const handleAutoLockToggle = async (enabled: boolean) => {
    await updateSettings({ autoLockEnabled: enabled });
  };

  const handlePushNotificationToggle = async (enabled: boolean) => {
    await updateSettings({ pushNotificationsEnabled: enabled });
  };

  const handleTransactionNotificationToggle = async (enabled: boolean) => {
    await updateSettings({ transactionNotificationsEnabled: enabled });
  };

  const handlePromotionalNotificationToggle = async (enabled: boolean) => {
    await updateSettings({ promotionalNotificationsEnabled: enabled });
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
              icon="bell"
              label="Notifikasi Push"
              description="Aktifkan notifikasi push dari aplikasi"
              type="switch"
              value={settings.pushNotificationsEnabled}
              onValueChange={handlePushNotificationToggle}
            />
            <Divider />
            <SettingsItem
              icon="receipt"
              label="Notifikasi Transaksi"
              description="Dapatkan notifikasi untuk setiap transaksi"
              type="switch"
              value={settings.transactionNotificationsEnabled}
              onValueChange={handleTransactionNotificationToggle}
              disabled={!settings.pushNotificationsEnabled}
            />
            <Divider />
            <SettingsItem
              icon="tag"
              label="Notifikasi Promo"
              description="Dapatkan notifikasi tentang promo dan penawaran"
              type="switch"
              value={settings.promotionalNotificationsEnabled}
              onValueChange={handlePromotionalNotificationToggle}
              disabled={!settings.pushNotificationsEnabled}
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
