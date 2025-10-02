import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, useTheme, Card, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabScreenProps, ProfileSection } from '@types';
import { useProfileStore } from '@store/profileStore';
import { useAuthStore } from '@store/authStore';
import { ProfileHeader } from '@components/profile/ProfileHeader';
import { ProfileMenuItem } from '@components/profile/ProfileMenuItem';
import { ProfileSkeleton } from '@components/skeletons';
import { useAnalytics } from '@hooks';

export const ProfileScreen: React.FC<MainTabScreenProps<'Profile'>> = ({ navigation }) => {
  const theme = useTheme();
  const { profile, isLoadingProfile, fetchProfile } = useProfileStore();
  const { signOut } = useAuthStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Track analytics
  useAnalytics('Profile');

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
      setIsInitialLoad(false);
    };
    loadData();
  }, [fetchProfile]);

  const handleSignOut = () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar dari akun Anda?', [
      {
        text: 'Batal',
        style: 'cancel',
      },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const profileSections: ProfileSection[] = [
    {
      title: 'Akun',
      items: [
        {
          id: 'edit-profile',
          label: 'Edit Profil',
          icon: 'account-edit',
          onPress: () => (navigation as any).navigate('EditProfile'),
        },
        {
          id: 'kyc',
          label: 'Verifikasi Identitas',
          icon: 'shield-check',
          badge: profile?.kycStatus === 'not_started' ? 'Belum' : undefined,
          onPress: () => (navigation as any).navigate('KYCVerification'),
        },
        {
          id: 'change-phone',
          label: 'Ganti Nomor Telepon',
          icon: 'phone-settings',
          onPress: () => (navigation as any).navigate('ChangePhone'),
        },
      ],
    },
    {
      title: 'Program',
      items: [
        {
          id: 'fit-challenge',
          label: 'Fit Challenge',
          icon: 'run',
          badge: 'Aktif',
          onPress: () => (navigation as any).navigate('FitChallenge'),
        },
      ],
    },
    {
      title: 'Pengaturan',
      items: [
        {
          id: 'settings',
          label: 'Pengaturan Aplikasi',
          icon: 'cog',
          onPress: () => (navigation as any).navigate('Settings'),
        },
        {
          id: 'notifications',
          label: 'Notifikasi',
          icon: 'bell',
          onPress: () => (navigation as any).navigate('NotificationSettings'),
        },
        {
          id: 'security',
          label: 'Keamanan',
          icon: 'lock',
          onPress: () => (navigation as any).navigate('SecuritySettings'),
        },
      ],
    },
    {
      title: 'Bantuan & Informasi',
      items: [
        {
          id: 'help',
          label: 'Pusat Bantuan',
          icon: 'help-circle',
          onPress: () => (navigation as any).navigate('HelpCenter'),
        },
        {
          id: 'about',
          label: 'Tentang Aplikasi',
          icon: 'information',
          onPress: () => (navigation as any).navigate('About'),
        },
        {
          id: 'terms',
          label: 'Syarat & Ketentuan',
          icon: 'file-document',
          onPress: () => (navigation as any).navigate('Terms'),
        },
        {
          id: 'privacy',
          label: 'Kebijakan Privasi',
          icon: 'shield-account',
          onPress: () => (navigation as any).navigate('Privacy'),
        },
      ],
    },
    {
      items: [
        {
          id: 'signout',
          label: 'Keluar',
          icon: 'logout',
          dangerous: true,
          onPress: handleSignOut,
        },
      ],
    },
  ];

  if ((isLoadingProfile && isInitialLoad) || !profile) {
    return <ProfileSkeleton />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          onEditPress={() => (navigation as any).navigate('EditProfile')}
          onPhotoPress={() => {
            Alert.alert('Foto Profil', 'Pilih aksi', [
              {
                text: 'Ambil Foto',
                onPress: () => {
                  // TODO: Implement camera
                },
              },
              {
                text: 'Pilih dari Galeri',
                onPress: () => {
                  // TODO: Implement image picker
                },
              },
              {
                text: 'Batal',
                style: 'cancel',
              },
            ]);
          }}
        />

        {/* Menu Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            {section.title && (
              <Text
                variant="titleSmall"
                style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}
              >
                {section.title}
              </Text>
            )}
            <Card style={styles.card}>
              {section.items.map((item, itemIndex) => (
                <ProfileMenuItem
                  key={item.id}
                  item={item}
                  showDivider={itemIndex < section.items.length - 1}
                />
              ))}
            </Card>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Sinoman Mobile App v1.0.0
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
  versionContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
});
