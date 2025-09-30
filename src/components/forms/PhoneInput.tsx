import React, { useState } from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import { validatePhoneNumber, getPhoneValidationError } from '@utils/validators';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  onSubmitEditing,
  error,
  disabled = false,
  autoFocus = true,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');

    // Remove leading 0 if present (user might type 08xxx)
    const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;

    // Limit to 13 digits (Indonesian phone max length)
    const limited = withoutLeadingZero.substring(0, 13);

    onChangeText(limited);
  };

  const showError = error && !isFocused;

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Nomor Telepon"
        value={value}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={onSubmitEditing}
        disabled={disabled}
        autoFocus={autoFocus}
        keyboardType="phone-pad"
        returnKeyType="done"
        textContentType="telephoneNumber"
        autoComplete="tel"
        maxLength={13}
        error={showError}
        left={
          <TextInput.Affix
            text="+62"
            textStyle={[
              styles.prefix,
              {
                color: isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant,
              },
            ]}
          />
        }
        style={styles.input}
        outlineStyle={styles.outline}
      />

      {showError && (
        <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      <Text variant="bodySmall" style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
        Contoh: 812345678 (tanpa 0 di depan)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    fontSize: 16,
  },
  outline: {
    borderRadius: 8,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 12,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 12,
  },
});