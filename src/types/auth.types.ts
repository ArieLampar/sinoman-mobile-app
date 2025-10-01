import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  address?: string;
  isProfileComplete?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  // User & Session
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Biometric
  isBiometricEnabled: boolean;
  biometricAvailable: boolean;

  // Actions
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string; isProfileComplete?: boolean }>;
  completeRegistration: (data: RegistrationData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  enableBiometric: (enabled: boolean) => Promise<void>;
  authenticateWithBiometric: () => Promise<{ success: boolean; error?: string }>;

  // State Setters
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setBiometricAvailable: (available: boolean) => void;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface OtpResponse {
  success: boolean;
  error?: string;
  isProfileComplete?: boolean;
}

export interface RegistrationData {
  name: string;
  email?: string;
  address?: string;
}

export interface RegistrationRequest extends RegistrationData {
  userId: string;
}

export interface RegistrationResponse {
  success: boolean;
  error?: string;
  user?: User;
}

export interface SessionData {
  session: Session | null;
  user: User | null;
}

// Convert Supabase User to our User type
export function toUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    phone: supabaseUser.phone || '',
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name,
    address: supabaseUser.user_metadata?.address,
    isProfileComplete: supabaseUser.user_metadata?.is_profile_complete ?? false,
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at,
  };
}