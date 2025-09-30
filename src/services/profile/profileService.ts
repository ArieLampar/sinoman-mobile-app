/**
 * Profile Service
 * Handles user profile operations and settings management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@services/supabase';
import {
  UserProfile,
  UpdateProfileRequest,
  UpdateProfilePhotoRequest,
  AppSettings,
  NotificationPreferences,
} from '@types';

const SETTINGS_STORAGE_KEY = '@sinoman:settings';

/**
 * Default app settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  // Security
  biometricEnabled: false,
  autoLockEnabled: true,
  autoLockDuration: 15,

  // Notifications
  pushNotificationsEnabled: true,
  transactionNotificationsEnabled: true,
  promotionalNotificationsEnabled: false,
  emailNotificationsEnabled: false,

  // Preferences
  language: 'id',
  theme: 'system',
  currency: 'IDR',

  // Privacy
  showBalanceOnHome: true,
  showTransactionHistory: true,
};

/**
 * Fetch user profile from Supabase
 */
export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User tidak terautentikasi');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // If profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        return await createUserProfile(user.id, user.phone || '');
      }
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Create initial user profile
 */
async function createUserProfile(userId: string, phoneNumber: string): Promise<UserProfile | null> {
  try {
    const newProfile = {
      id: userId,
      phone_number: phoneNumber,
      name: phoneNumber, // Default name is phone number
      member_number: `SIN${Date.now().toString().slice(-8)}`,
      member_since: new Date().toISOString(),
      kyc_status: 'not_started',
      membership_tier: 'basic',
      is_active: true,
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(newProfile)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: UpdateProfileRequest): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User tidak terautentikasi');
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Update profile photo
 */
export async function updateProfilePhoto(request: UpdateProfilePhotoRequest): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User tidak terautentikasi');
    }

    // Upload photo to Supabase Storage
    const fileExt = request.mimeType.split('/')[1];
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // Convert URI to blob
    const response = await fetch(request.photoUri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType: request.mimeType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath);

    // Update profile with new photo URL
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ profile_photo_url: publicUrl })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return publicUrl;
  } catch (error: any) {
    console.error('Error updating profile photo:', error);
    throw error;
  }
}

/**
 * Fetch app settings from local storage
 */
export async function fetchAppSettings(): Promise<AppSettings> {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!settingsJson) {
      return DEFAULT_SETTINGS;
    }

    const settings = JSON.parse(settingsJson);
    // Merge with defaults to ensure all keys exist
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update app settings in local storage
 */
export async function updateAppSettings(updates: Partial<AppSettings>): Promise<boolean> {
  try {
    const currentSettings = await fetchAppSettings();
    const newSettings = { ...currentSettings, ...updates };

    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));

    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
}

/**
 * Clear all app settings (reset to defaults)
 */
export async function clearAppSettings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing settings:', error);
  }
}

/**
 * Update notification preferences on server
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User tidak terautentikasi');
    }

    const { error } = await supabase
      .from('user_notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}

/**
 * Delete user account (soft delete)
 */
export async function deleteUserAccount(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User tidak terautentikasi');
    }

    // Soft delete - mark account as inactive
    const { error } = await supabase
      .from('user_profiles')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    // Sign out user
    await supabase.auth.signOut();

    return true;
  } catch (error: any) {
    console.error('Error deleting account:', error);
    throw error;
  }
}
