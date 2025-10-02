/**
 * Edit Profile Screen
 *
 * Form for editing user profile information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  SegmentedButtons,
  HelperText,
  Card,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useProfileStore } from '@/store/profileStore';
import { toastError, showSuccessToast } from '@utils/toast';

type Gender = 'male' | 'female' | 'other';

export const EditProfileScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { profile, isUpdatingProfile, updateProfile, fetchProfile } = useProfileStore();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [occupation, setOccupation] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [province, setProvince] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form with existing profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setEmail(profile.email || '');
      setDateOfBirth(profile.dateOfBirth || '');
      setGender((profile.gender as Gender) || 'male');
      setOccupation(profile.occupation || '');
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setPostalCode(profile.postalCode || '');
      setProvince(profile.province || '');
    }
  }, [profile]);

  /**
   * Validate name (required, min 3 chars)
   */
  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Nama lengkap wajib diisi';
    }
    if (name.trim().length < 3) {
      return 'Nama minimal 3 karakter';
    }
    return null;
  };

  /**
   * Validate email (optional, valid format)
   */
  const validateEmail = (email: string): string | null => {
    if (!email) return null; // Email is optional

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Format email tidak valid';
    }
    return null;
  };

  /**
   * Validate date of birth (YYYY-MM-DD format)
   */
  const validateDateOfBirth = (date: string): string | null => {
    if (!date) return null; // Optional

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return 'Format tanggal: YYYY-MM-DD';
    }
    return null;
  };

  /**
   * Validate all fields
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateName(fullName);
    if (nameError) newErrors.fullName = nameError;

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const dobError = validateDateOfBirth(dateOfBirth);
    if (dobError) newErrors.dateOfBirth = dobError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle save button press
   */
  const handleSave = async () => {
    if (!validateForm()) {
      toastError('Mohon periksa kembali data yang Anda masukkan');
      return;
    }

    const success = await updateProfile({
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender,
      occupation: occupation.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      province: province.trim() || undefined,
    });

    if (success) {
      showSuccessToast({
        title: 'Berhasil',
        message: 'Profil Anda berhasil diperbarui',
        onPress: () => {
          fetchProfile(); // Refresh profile data
          navigation.goBack();
        },
      });

      // Auto navigate back after toast
      setTimeout(() => {
        fetchProfile();
        navigation.goBack();
      }, 2000);
    } else {
      toastError('Terjadi kesalahan saat memperbarui profil');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Personal Information Section */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Informasi Pribadi</Text>

              {/* Full Name */}
              <TextInput
                label="Nama Lengkap *"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                style={styles.input}
                error={!!errors.fullName}
              />
              {errors.fullName && (
                <HelperText type="error" visible={!!errors.fullName}>
                  {errors.fullName}
                </HelperText>
              )}

              {/* Email */}
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                error={!!errors.email}
              />
              {errors.email && (
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email}
                </HelperText>
              )}

              {/* Date of Birth */}
              <TextInput
                label="Tanggal Lahir (YYYY-MM-DD)"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                mode="outlined"
                placeholder="1990-01-01"
                style={styles.input}
                error={!!errors.dateOfBirth}
              />
              {errors.dateOfBirth && (
                <HelperText type="error" visible={!!errors.dateOfBirth}>
                  {errors.dateOfBirth}
                </HelperText>
              )}

              {/* Gender */}
              <Text style={styles.label}>Jenis Kelamin</Text>
              <SegmentedButtons
                value={gender}
                onValueChange={(value) => setGender(value as Gender)}
                buttons={[
                  { value: 'male', label: 'Laki-laki' },
                  { value: 'female', label: 'Perempuan' },
                  { value: 'other', label: 'Lainnya' },
                ]}
                style={styles.segmentedButtons}
              />

              {/* Occupation */}
              <TextInput
                label="Pekerjaan"
                value={occupation}
                onChangeText={setOccupation}
                mode="outlined"
                style={styles.input}
              />
            </Card.Content>
          </Card>

          {/* Address Section */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Alamat</Text>

              {/* Address */}
              <TextInput
                label="Alamat Lengkap"
                value={address}
                onChangeText={setAddress}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              {/* City and Postal Code Row */}
              <View style={styles.row}>
                <TextInput
                  label="Kota"
                  value={city}
                  onChangeText={setCity}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
                <TextInput
                  label="Kode Pos"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                />
              </View>

              {/* Province */}
              <TextInput
                label="Provinsi"
                value={province}
                onChangeText={setProvince}
                mode="outlined"
                style={styles.input}
              />
            </Card.Content>
          </Card>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isUpdatingProfile}
            disabled={isUpdatingProfile}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
          >
            Simpan Perubahan
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 8,
    color: '#64748b',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  bottomPadding: {
    height: 100,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    borderRadius: 8,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
});
