import { supabase } from '../supabase';
import { logger } from '@utils/logger';
import type { RegistrationRequest, RegistrationResponse, User } from '../../types/auth.types';

/**
 * Complete user registration by updating profile with name, email, and address
 */
export async function completeRegistration(data: RegistrationRequest): Promise<RegistrationResponse> {
  try {
    const { userId, name, email, address } = data;

    // Update user metadata with profile information
    const { data: updatedUser, error } = await supabase.auth.updateUser({
      data: {
        name,
        email: email || undefined,
        address: address || undefined,
        is_profile_complete: true,
      },
    });

    if (error) {
      logger.error('Registration error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!updatedUser.user) {
      return {
        success: false,
        error: 'Failed to update user profile',
      };
    }

    // Convert to our User type
    const user: User = {
      id: updatedUser.user.id,
      phone: updatedUser.user.phone || '',
      email: updatedUser.user.email,
      name: updatedUser.user.user_metadata?.name,
      address: updatedUser.user.user_metadata?.address,
      isProfileComplete: true,
      createdAt: updatedUser.user.created_at,
      updatedAt: updatedUser.user.updated_at,
    };

    return {
      success: true,
      user,
    };
  } catch (error: any) {
    logger.error('Registration exception:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
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
