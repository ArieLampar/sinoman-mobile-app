import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { useAuthStore } from '@store/authStore';
import { Button, Input } from '@components/common';
import { useAppTheme } from '@theme';
import {
  getNameValidationError,
  getEmailValidationError,
  getAddressValidationError,
} from '@utils/validators';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useAppTheme();
  const { completeRegistration, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [addressError, setAddressError] = useState('');

  const handleSubmit = async () => {
    // Validate all fields
    const nameErr = getNameValidationError(name);
    const emailErr = getEmailValidationError(email);
    const addressErr = getAddressValidationError(address);

    setNameError(nameErr || '');
    setEmailError(emailErr || '');
    setAddressError(addressErr || '');

    // Stop if there are validation errors
    if (nameErr) {
      return;
    }

    // Complete registration
    const result = await completeRegistration({
      name: name.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
    });

    if (result.success) {
      // Navigation will happen automatically via auth state change
      // User will be redirected to main app
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (nameError) {
      setNameError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleAddressChange = (text: string) => {
    setAddress(text);
    if (addressError) {
      setAddressError('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { padding: theme.custom.componentSpacing.screenPadding }]}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: theme.custom.spacing.xl }]}>
            <Text
              variant="headlineMedium"
              style={[
                styles.title,
                {
                  color: theme.custom.colors.neutral.gray900,
                  marginBottom: theme.custom.spacing.sm,
                },
              ]}
            >
              Lengkapi Profil Anda
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.subtitle,
                {
                  color: theme.custom.colors.neutral.gray600,
                },
              ]}
            >
              Kami memerlukan beberapa informasi untuk melengkapi akun Anda
            </Text>
          </View>

          {/* Form */}
          <View style={[styles.form, { gap: theme.custom.spacing.lg }]}>
            {/* Name Input */}
            <Input
              label="Nama Lengkap *"
              value={name}
              onChangeText={handleNameChange}
              error={nameError}
              placeholder="Masukkan nama lengkap Anda"
              leftIcon="account"
              autoCapitalize="words"
              autoComplete="name"
              disabled={isLoading}
            />

            {/* Email Input */}
            <Input
              label="Email (Opsional)"
              value={email}
              onChangeText={handleEmailChange}
              error={emailError}
              placeholder="contoh@email.com"
              leftIcon="email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              disabled={isLoading}
            />

            {/* Address Input */}
            <Input
              label="Alamat (Opsional)"
              value={address}
              onChangeText={handleAddressChange}
              error={addressError}
              placeholder="Masukkan alamat lengkap Anda"
              leftIcon="map-marker"
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
              disabled={isLoading}
            />
          </View>

          {/* Submit Button */}
          <View style={[styles.buttonContainer, { marginTop: theme.custom.spacing['2xl'] }]}>
            <Button
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading || !name.trim()}
              fullWidth
              size="large"
            >
              Lanjutkan
            </Button>
          </View>

          {/* Footer Note */}
          <View style={[styles.footer, { marginTop: theme.custom.spacing.xl }]}>
            <Text
              variant="bodySmall"
              style={[
                styles.footerText,
                {
                  color: theme.custom.colors.neutral.gray500,
                  textAlign: 'center',
                },
              ]}
            >
              * Wajib diisi
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    lineHeight: 20,
  },
});
