// Supabase Auth
export {
  sendOtp,
  verifyOtp,
  signOut,
  getSession,
  refreshSession,
  onAuthStateChange,
} from './supabaseAuth';

// Registration
export {
  completeRegistration,
  checkProfileComplete,
} from './registration';

// Biometric Auth
export {
  isBiometricAvailable,
  authenticateWithBiometric,
  getSupportedBiometricTypes,
  getBiometricTypeName,
  hasBiometricHardware,
} from './biometric';

// Session Management
export {
  saveSession,
  getStoredSession,
  clearSession,
  isSessionValid,
  saveUserData,
  getStoredUserData,
  saveBiometricPreference,
  getBiometricPreference,
  updateLastActivity,
  getLastActivity,
  shouldTerminateSession,
} from './sessionManager';