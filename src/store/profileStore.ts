/**
 * Profile Store
 * Zustand store for user profile and settings management
 */

import { create } from 'zustand';
import {
  ProfileState,
  UserProfile,
  UpdateProfileRequest,
  UpdateProfilePhotoRequest,
  AppSettings,
  NotificationPreferences,
} from '@types';
import {
  fetchUserProfile,
  updateUserProfile,
  updateProfilePhoto,
  fetchAppSettings,
  updateAppSettings,
  DEFAULT_SETTINGS,
} from '@services/profile';

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  profile: null,
  isLoadingProfile: false,
  settings: DEFAULT_SETTINGS,
  isLoadingSettings: false,
  isUpdatingProfile: false,
  isUpdatingPhoto: false,
  isUpdatingSettings: false,
  error: null,

  // Fetch profile
  fetchProfile: async () => {
    set({ isLoadingProfile: true, error: null });

    try {
      const profile = await fetchUserProfile();
      set({
        profile,
        isLoadingProfile: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Gagal memuat profil',
        isLoadingProfile: false,
      });
    }
  },

  // Update profile
  updateProfile: async (data: UpdateProfileRequest): Promise<boolean> => {
    set({ isUpdatingProfile: true, error: null });

    try {
      const success = await updateUserProfile(data);

      if (success) {
        // Refresh profile
        await get().fetchProfile();
      }

      set({ isUpdatingProfile: false });
      return success;
    } catch (error: any) {
      set({
        error: error.message || 'Gagal memperbarui profil',
        isUpdatingProfile: false,
      });
      return false;
    }
  },

  // Update profile photo
  updateProfilePhoto: async (data: UpdateProfilePhotoRequest): Promise<boolean> => {
    set({ isUpdatingPhoto: true, error: null });

    try {
      const photoUrl = await updateProfilePhoto(data);

      if (photoUrl) {
        // Update profile in state
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: { ...currentProfile, profilePhotoUrl: photoUrl },
          });
        }
      }

      set({ isUpdatingPhoto: false });
      return !!photoUrl;
    } catch (error: any) {
      set({
        error: error.message || 'Gagal memperbarui foto profil',
        isUpdatingPhoto: false,
      });
      return false;
    }
  },

  // Fetch settings
  fetchSettings: async () => {
    set({ isLoadingSettings: true, error: null });

    try {
      const settings = await fetchAppSettings();
      set({
        settings,
        isLoadingSettings: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Gagal memuat pengaturan',
        isLoadingSettings: false,
      });
    }
  },

  // Update settings
  updateSettings: async (updates: Partial<AppSettings>): Promise<boolean> => {
    set({ isUpdatingSettings: true, error: null });

    try {
      const success = await updateAppSettings(updates);

      if (success) {
        const currentSettings = get().settings;
        set({
          settings: { ...currentSettings, ...updates },
        });
      }

      set({ isUpdatingSettings: false });
      return success;
    } catch (error: any) {
      set({
        error: error.message || 'Gagal memperbarui pengaturan',
        isUpdatingSettings: false,
      });
      return false;
    }
  },

  // Toggle biometric
  toggleBiometric: async (enabled: boolean): Promise<boolean> => {
    return get().updateSettings({ biometricEnabled: enabled });
  },

  // Toggle notification
  toggleNotification: async (type: keyof NotificationPreferences, enabled: boolean): Promise<boolean> => {
    const settingsKey = `${type}NotificationsEnabled` as keyof AppSettings;
    return get().updateSettings({ [settingsKey]: enabled } as Partial<AppSettings>);
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      profile: null,
      isLoadingProfile: false,
      settings: DEFAULT_SETTINGS,
      isLoadingSettings: false,
      isUpdatingProfile: false,
      isUpdatingPhoto: false,
      isUpdatingSettings: false,
      error: null,
    });
  },
}));
