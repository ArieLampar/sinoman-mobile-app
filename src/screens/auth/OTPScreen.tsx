import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthScreenProps } from '@types';
import { OTPInput } from '@components/forms/OTPInput';
import { Button } from '@components/common/Button';
import { useAuthStore } from '@store/authStore';
import { validateOtp, getOtpValidationError } from '@utils/validators';
import { maskPhoneNumber } from '@utils/formatters';
import { formatTimeRemaining } from '@utils/formatters';
import { VALIDATION } from '@utils/constants';
import { logger } from '@utils/logger';

export const OTPScreen: React.FC<AuthScreenProps<'OTP'>> = ({ navigation, route }) => {
  const { phone } = route.params;
  const theme = useTheme();
  const { verifyOtp, sendOtp, isLoading, error: authError } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(VALIDATION.OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleVerifyOtp = async () => {
    // Validate OTP
    const validationError = getOtpValidationError(otp);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    logger.info('Verifying OTP for:', phone);

    // Verify OTP
    const result = await verifyOtp(phone, otp);

    if (!result.success) {
      setError(result.error || 'Kode OTP tidak valid');
      return;
    }

    // Check if profile is complete
    if (result.isProfileComplete === false) {
      // Navigate to registration screen to complete profile
      navigation.navigate('Register');
    }
    // If profile is complete, auth store will handle navigation via RootNavigator
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    logger.info('Resending OTP to:', phone);

    setOtp('');
    setError(null);
    setCanResend(false);
    setTimeRemaining(VALIDATION.OTP_EXPIRY_SECONDS);

    const result = await sendOtp(phone);

    if (!result.success) {
      setError(result.error || 'Gagal mengirim ulang kode OTP');
    }
  };

  const handleOtpComplete = (code: string) => {
    // Auto-verify when all digits entered
    setOtp(code);
    // Small delay for better UX
    setTimeout(() => {
      if (validateOtp(code)) {
        handleVerifyOtp();
      }
    }, 300);
  };

  const isOtpValid = validateOtp(otp);
  const displayError = error || authError;
  const maskedPhone = maskPhoneNumber(phone);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                Verifikasi Nomor Telepon
              </Text>
              <Text
                variant="bodyLarge"
                style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
              >
                Masukkan kode 6 digit yang dikirim ke
              </Text>
              <Text
                variant="titleMedium"
                style={[styles.phoneNumber, { color: theme.colors.primary }]}
              >
                {maskedPhone}
              </Text>
            </View>

            {/* OTP Input */}
            <View style={styles.formContainer}>
              <OTPInput
                value={otp}
                onChangeText={(text) => {
                  setOtp(text);
                  setError(null);
                }}
                onComplete={handleOtpComplete}
                error={displayError || undefined}
                disabled={isLoading}
                autoFocus
                enableAutoRead={true}
              />
            </View>

            {/* Timer & Resend */}
            <View style={styles.timerContainer}>
              {!canResend ? (
                <Text
                  variant="bodyMedium"
                  style={[styles.timerText, { color: theme.colors.onSurfaceVariant }]}
                >
                  Kirim ulang kode dalam {formatTimeRemaining(timeRemaining)}
                </Text>
              ) : (
                <Button
                  onPress={handleResendOtp}
                  variant="text"
                  disabled={isLoading}
                >
                  Kirim Ulang Kode OTP
                </Button>
              )}
            </View>

            {/* Verify Button */}
            <View style={styles.buttonContainer}>
              <Button
                onPress={handleVerifyOtp}
                loading={isLoading}
                disabled={!isOtpValid || isLoading}
                fullWidth
                size="large"
              >
                Verifikasi
              </Button>
            </View>

            {/* Back Button */}
            <View style={styles.backButtonContainer}>
              <Button
                onPress={() => navigation.goBack()}
                variant="outline"
                disabled={isLoading}
                fullWidth
              >
                Ubah Nomor Telepon
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontWeight: '600',
    marginTop: 4,
  },
  formContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 48,
    justifyContent: 'center',
  },
  timerText: {
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  backButtonContainer: {
    marginBottom: 16,
  },
});