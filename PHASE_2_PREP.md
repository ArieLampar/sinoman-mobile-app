# Phase 2 Preparation: Authentication System

This document outlines what needs to be implemented in Phase 2 (Day 3-4) for the Authentication System.

---

## 🎯 Phase 2 Objectives

Implement complete authentication flow:
- Phone number login with OTP
- Biometric authentication (TouchID/FaceID/Fingerprint)
- Session management with Supabase
- Secure token storage
- Auto-logout functionality

---

## 📋 Phase 2 Task Breakdown

### Day 3: Core Authentication

#### Task 3.1: Auth Store (Zustand)
**File**: `src/store/authStore.ts`

**State Shape:**
```typescript
interface AuthState {
  // User & Session
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  enableBiometric: () => Promise<void>;

  // State Setters
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}
```

**Requirements:**
- Persist auth state to AsyncStorage
- Handle token refresh
- Clear state on logout
- Error handling for all async actions

---

#### Task 3.2: Login Screen
**File**: `src/screens/auth/LoginScreen.tsx`

**Features:**
- Phone number input with +62 prefix
- Indonesian phone validation (8xxxxxxxxxx format)
- Loading state during OTP send
- Error message display
- Auto-focus on input
- Keyboard optimization (number pad)

**UI Elements:**
- App logo
- Welcome message
- Phone input field with country code
- "Send OTP" button
- Terms & conditions link
- Loading indicator

**Validation:**
- Phone must start with 8
- Length: 10-13 digits
- Only numbers allowed
- Required field

**Example:**
```
┌─────────────────────────┐
│      [Sinoman Logo]     │
│                         │
│   Welcome Back!         │
│   Enter phone number    │
│                         │
│  ┌───────────────────┐  │
│  │ +62 | 812345678   │  │
│  └───────────────────┘  │
│                         │
│  [   Send OTP Code   ]  │
│                         │
│  By continuing, you     │
│  agree to our Terms     │
└─────────────────────────┘
```

---

#### Task 3.3: OTP Verification Screen
**File**: `src/screens/auth/OTPScreen.tsx`

**Features:**
- 6-digit OTP input
- Auto-advance between input boxes
- Auto-submit when 6 digits entered
- Countdown timer (5 minutes = 300 seconds)
- Resend OTP button (disabled until timer ends)
- Auto-fill from SMS (Android)
- Loading state during verification
- Error handling

**UI Elements:**
- Phone number display (masked: +62 812****678)
- OTP input boxes (6 boxes, 1 digit each)
- Countdown timer
- "Resend OTP" button
- "Verify" button
- Loading indicator
- Error message display

**Validation:**
- Must be exactly 6 digits
- Only numbers allowed
- Required field

**Example:**
```
┌─────────────────────────┐
│   Verify Phone Number   │
│                         │
│  Code sent to:          │
│  +62 812****678         │
│                         │
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐│
│  │1│ │2│ │3│ │4│ │5│ │6││
│  └─┘ └─┘ └─┘ └─┘ └─┘ └─┘│
│                         │
│  Resend OTP in 04:32    │
│                         │
│  [     Verify Code    ] │
└─────────────────────────┘
```

---

#### Task 3.4: Supabase Auth Integration
**File**: `src/services/auth/supabaseAuth.ts`

**Functions to Implement:**

```typescript
// Send OTP to phone number
export async function sendOtp(phone: string): Promise<{ error?: string }> {
  const formattedPhone = `+62${phone}`;
  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      channel: 'sms',
    },
  });
  return { error: error?.message };
}

// Verify OTP code
export async function verifyOtp(
  phone: string,
  token: string
): Promise<{ session?: Session; error?: string }> {
  const formattedPhone = `+62${phone}`;
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: 'sms',
  });
  return { session: data.session, error: error?.message };
}

// Sign out
export async function signOut(): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message };
}

// Get current session
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Listen to auth state changes
export function onAuthStateChange(
  callback: (session: Session | null) => void
): { unsubscribe: () => void } {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session);
  });
  return { unsubscribe: data.subscription.unsubscribe };
}
```

---

### Day 4: Advanced Authentication

#### Task 4.1: Biometric Authentication
**File**: `src/services/auth/biometric.ts`

**Requirements:**
- Install: `expo-local-authentication`
- Check if biometric available
- Authenticate with biometric
- Store biometric preference
- Fallback to OTP if biometric fails

**Functions:**
```typescript
export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
}

export async function authenticateWithBiometric(): Promise<{
  success: boolean;
  error?: string;
}> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Login to Sinoman',
    fallbackLabel: 'Use Phone Number',
    cancelLabel: 'Cancel',
  });
  return {
    success: result.success,
    error: result.error,
  };
}
```

---

#### Task 4.2: Session Management
**File**: `src/services/auth/sessionManager.ts`

**Features:**
- Session persistence to AsyncStorage
- Auto-refresh token before expiry
- Session validation on app start
- Auto-logout after 15 minutes inactivity
- Last activity tracking

**Functions:**
```typescript
export async function saveSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export async function getStoredSession(): Promise<Session | null> {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
  return stored ? JSON.parse(stored) : null;
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
  await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
}

export async function isSessionValid(session: Session): Promise<boolean> {
  if (!session || !session.expires_at) return false;
  const expiresAt = new Date(session.expires_at);
  const now = new Date();
  return expiresAt > now;
}
```

---

#### Task 4.3: Auto-Logout Timer
**File**: `src/hooks/useInactivityTimer.ts`

**Features:**
- Track user activity (taps, scrolls)
- Auto-logout after 15 minutes inactivity
- Reset timer on activity
- Warning before logout (optional)

**Implementation:**
```typescript
export function useInactivityTimer(timeoutMinutes: number = 15) {
  const authStore = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      authStore.signOut();
    }, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        resetTimer();
      }
    });

    return () => subscription.remove();
  }, [resetTimer]);

  return { resetTimer };
}
```

---

#### Task 4.4: Protected Routes
**File**: `src/navigation/RootNavigator.tsx` (Update)

**Update RootNavigator to use auth store:**
```typescript
export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
```

---

## 📦 Additional Dependencies Needed

Add to `package.json`:
```bash
npm install expo-local-authentication
npm install @react-native-community/hooks
```

---

## 🎨 UI Components to Create

### 1. PhoneInput Component
**File**: `src/components/forms/PhoneInput.tsx`

Features:
- Country code prefix (+62)
- Number-only keyboard
- Format validation
- Error state styling

### 2. OTPInput Component
**File**: `src/components/forms/OTPInput.tsx`

Features:
- 6 separate input boxes
- Auto-advance
- Auto-submit
- Paste support
- Backspace handling

### 3. Button Component
**File**: `src/components/common/Button.tsx`

Variants:
- Primary (filled)
- Secondary (outlined)
- Text (transparent)
- Loading state
- Disabled state

### 4. ErrorMessage Component
**File**: `src/components/common/ErrorMessage.tsx`

Features:
- Error icon
- Error text
- Dismissible
- Animation

---

## 🧪 Testing Checklist

### Login Screen Tests
- [ ] Phone input accepts only numbers
- [ ] Validation prevents invalid phone format
- [ ] "Send OTP" button disabled when input invalid
- [ ] Loading state shows during OTP send
- [ ] Error message displays on failure
- [ ] Success navigates to OTP screen

### OTP Screen Tests
- [ ] 6 input boxes render correctly
- [ ] Auto-advance between boxes
- [ ] Auto-submit when 6 digits entered
- [ ] Countdown timer works
- [ ] Resend button enables after timer
- [ ] Error handling for wrong OTP
- [ ] Success navigates to main app

### Biometric Tests
- [ ] Check availability on device
- [ ] Prompt appears correctly
- [ ] Success logs user in
- [ ] Fallback to OTP works
- [ ] Can disable biometric in settings

### Session Tests
- [ ] Session persists across app restarts
- [ ] Token refresh works automatically
- [ ] Invalid session redirects to login
- [ ] Logout clears all session data
- [ ] Auto-logout after 15 minutes works

---

## 🔐 Security Considerations

### Phone Number Security
- Never display full phone number
- Mask format: +62 812****678
- Validate on both client and server
- Rate limit OTP requests

### Token Security
- Store in secure AsyncStorage
- Never log tokens
- Implement token rotation
- Clear on logout

### OTP Security
- 6 digits minimum
- 5-minute expiration
- Rate limit attempts
- Clear after use

---

## 📊 Success Metrics Phase 2

- [ ] User can login with phone + OTP
- [ ] OTP arrives within 30 seconds
- [ ] Biometric login works (if available)
- [ ] Session persists across app restarts
- [ ] Auto-logout works after 15 minutes
- [ ] All error cases handled gracefully
- [ ] No tokens logged in production
- [ ] Auth state synced with Supabase

---

## 🚀 Phase 2 Completion Criteria

### Must Have:
- ✅ Login screen with phone input
- ✅ OTP verification screen
- ✅ Supabase auth integration
- ✅ Session persistence
- ✅ Auth state management (Zustand)
- ✅ Protected route navigation

### Should Have:
- ✅ Biometric authentication
- ✅ Auto-logout timer
- ✅ Token refresh logic
- ✅ Error handling

### Nice to Have:
- 🎯 Logout warning before auto-logout
- 🎯 "Remember me" option
- 🎯 Multiple device management
- 🎯 SMS auto-read (Android)

---

## 📚 References

- [Supabase Auth Docs](https://supabase.io/docs/guides/auth)
- [Expo Local Authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
- [React Navigation Auth Flow](https://reactnavigation.org/docs/auth-flow)
- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)

---

## 💡 Tips for Phase 2

1. **Test with real Supabase project**: Ensure OTP delivery works
2. **Test on physical device**: Biometric only works on real devices
3. **Handle network errors**: OTP might fail due to connectivity
4. **Use TypeScript strict mode**: Catch errors early
5. **Log strategically**: Debug auth flow without exposing tokens
6. **Test edge cases**: Expired sessions, invalid OTPs, network timeouts

---

**Ready to start Phase 2?** Let's build the authentication system! 🔐🚀