/**
 * Profile and User Settings Types
 */

export interface UserProfile {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
  memberNumber: string;
  memberSince: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  profilePhotoUrl?: string;
  kycStatus: KYCStatus;
  membershipTier: MembershipTier;
  isActive: boolean;
  lastLoginAt?: string;
}

export enum KYCStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum MembershipTier {
  BASIC = 'basic',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
}

export interface UpdateProfilePhotoRequest {
  photoUri: string;
  mimeType: string;
}

export interface AppSettings {
  // Security
  biometricEnabled: boolean;
  autoLockEnabled: boolean;
  autoLockDuration: number; // in minutes

  // Notifications
  pushNotificationsEnabled: boolean;
  transactionNotificationsEnabled: boolean;
  promotionalNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;

  // Preferences
  language: 'id' | 'en';
  theme: 'light' | 'dark' | 'system';
  currency: 'IDR';

  // Privacy
  showBalanceOnHome: boolean;
  showTransactionHistory: boolean;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  transactionAlerts: boolean;
  promotionalAlerts: boolean;
  securityAlerts: boolean;
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  twoFactorEnabled: boolean;
  lastPasswordChange?: string;
}

// Zustand Store State
export interface ProfileState {
  // User profile
  profile: UserProfile | null;
  isLoadingProfile: boolean;

  // Settings
  settings: AppSettings;
  isLoadingSettings: boolean;

  // Update states
  isUpdatingProfile: boolean;
  isUpdatingPhoto: boolean;
  isUpdatingSettings: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  updateProfilePhoto: (data: UpdateProfilePhotoRequest) => Promise<boolean>;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<boolean>;
  toggleBiometric: (enabled: boolean) => Promise<boolean>;
  toggleNotification: (type: keyof NotificationPreferences, enabled: boolean) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export interface ProfileMenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  onPress?: () => void;
  badge?: string | number;
  dangerous?: boolean;
}

export interface ProfileSection {
  title?: string;
  items: ProfileMenuItem[];
}
