import { supabase } from '../supabase';
import { logger } from '@utils/logger';
import type { RegistrationRequest, RegistrationResponse, User } from '../../types/auth.types';

/**
 * Complete user registration by updating profile with name, email, and address
 */
export async function completeRegistration(data: RegistrationRequest): Promise<RegistrationResponse> {
  try {
    const { userId, name, email, address } = data;

    // Validate required fields
    if (!name || name.trim() === '') {
      return {
        success: false,
        error: 'Nama wajib diisi',
      };
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        error: 'Format email tidak valid',
      };
    }

    // Update user_profiles table
    const { data: profile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        name: name.trim(),
        email: email?.trim() || null,
        address: address?.trim() || null,
        is_profile_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      logger.error('Profile update error:', updateError);
      return {
        success: false,
        error: 'Gagal menyimpan profil',
      };
    }

    // Update user_metadata in auth.users for consistency
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        name: name.trim(),
        email: email?.trim(),
        address: address?.trim(),
        is_profile_complete: true,
      },
    });

    if (metadataError) {
      logger.error('Metadata update error:', metadataError);
      // Continue anyway since main profile is saved
    }

    // Construct updated user object
    const user: User = {
      id: profile.id,
      phone: profile.phone,
      email: profile.email,
      name: profile.name,
      address: profile.address,
      isProfileComplete: true,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    logger.info('Registration completed successfully for user:', userId);

    return {
      success: true,
      user,
    };
  } catch (error: any) {
    logger.error('Registration exception:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat menyimpan profil',
    };
  }
}

/**
 * Check if user profile is complete
 */
export async function checkProfileComplete(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    return user.user_metadata?.is_profile_complete === true;
  } catch (error) {
    logger.error('Error checking profile completion:', error);
    return false;
  }
}
