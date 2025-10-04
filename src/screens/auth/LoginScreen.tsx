import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthScreenProps } from '@types';
import { PhoneInput } from '@components/forms/PhoneInput';
import { Button } from '@components/common/Button';
import { useAuthStore } from '@store/authStore';
import { validatePhoneNumber, getPhoneValidationError } from '@utils/validators';
import { logger } from '@utils/logger';

export const LoginScreen: React.FC<AuthScreenProps<'Login'>> = ({ navigation }) => {
  const theme = useTheme();
  const { sendOtp, isLoading, error: authError } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    // Validate phone number
    const validationError = getPhoneValidationError(phone);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    logger.info('Sending OTP to:', phone);

    // Send OTP
    const result = await sendOtp(phone);

    logger.info('[LoginScreen] sendOtp result:', JSON.stringify(result));
    logger.info('[LoginScreen] result.success:', result.success);

    if (result.success) {
      logger.info('[LoginScreen] Navigating to OTP screen with phone:', phone);
      // Navigate to OTP screen
      navigation.navigate('OTP', { phone });
      logger.info('[LoginScreen] Navigation called');
    } else {
      logger.error('[LoginScreen] OTP send failed:', result.error);
      setError(result.error || 'Gagal mengirim kode OTP');
    }
  };

  const isPhoneValid = validatePhoneNumber(phone);
  const displayError = error || authError;

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
              <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>
                Sinoman
              </Text>
              <Text variant="headlineSmall" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
                Selamat Datang
              </Text>
              <Text
                variant="bodyLarge"
                style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
              >
                Masukkan nomor telepon Anda untuk melanjutkan
              </Text>
            </View>

            {/* Phone Input */}
            <View style={styles.formContainer}>
              <PhoneInput
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setError(null);
                }}
                onSubmitEditing={handleSendOtp}
                error={displayError || undefined}
                disabled={isLoading}
                autoFocus
              />
            </View>

            {/* Send OTP Button */}
            <View style={styles.buttonContainer}>
              <Button
                onPress={handleSendOtp}
                loading={isLoading}
                disabled={!isPhoneValid || isLoading}
                fullWidth
                size="large"
              >
                Kirim Kode OTP
              </Button>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text
                variant="bodySmall"
                style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}
              >
                Dengan melanjutkan, Anda menyetujui{' '}
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                  Syarat & Ketentuan
                </Text>{' '}
                dan{' '}
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                  Kebijakan Privasi
                </Text>{' '}
                kami
              </Text>
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
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    marginTop: 8,
  },
  formContainer: {
    marginBottom: 24,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});