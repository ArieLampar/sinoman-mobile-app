import React, { useRef, useState, useEffect } from 'react';
import { logger } from '@utils/logger';
import { View, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { VALIDATION } from '@utils/constants';

interface OTPInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onComplete?: (otp: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  enableAutoRead?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChangeText,
  onComplete,
  length = VALIDATION.OTP_LENGTH,
  error,
  disabled = false,
  autoFocus = true,
  enableAutoRead = true,
}) => {
  const theme = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(autoFocus ? 0 : -1);

  // Convert value string to array of digits
  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  useEffect(() => {
    // Auto-focus first input on mount
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    // SMS auto-read disabled for Expo managed workflow
    // Users will need to manually enter OTP
    if (Platform.OS === 'android' && enableAutoRead) {
      logger.info('SMS auto-read not available in Expo managed workflow');
      // TODO: Implement with expo-dev-client or use Expo SMS Retriever when available
    }
  }, [enableAutoRead]);

  useEffect(() => {
    // Trigger onComplete when all digits are filled
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChangeText = (text: string, index: number) => {
    // Only accept digits
    const digit = text.replace(/\D/g, '');

    if (digit.length === 0) {
      // Handle backspace
      const newValue = value.slice(0, index) + value.slice(index + 1);
      onChangeText(newValue);

      // Move to previous input
      if (index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    } else {
      // Handle digit input
      const lastDigit = digit[digit.length - 1];
      const newValue = value.slice(0, index) + lastDigit + value.slice(index + 1);
      onChangeText(newValue);

      // Move to next input
      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      // If current input is empty and backspace is pressed, move to previous
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBoxPress = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const getBoxStyle = (index: number) => {
    const isFilled = !!digits[index];
    const isFocused = focusedIndex === index;
    const hasError = !!error;

    return [
      styles.box,
      {
        borderColor: hasError
          ? theme.colors.error
          : isFocused
          ? theme.colors.primary
          : theme.colors.outline,
        backgroundColor: isFilled
          ? theme.colors.primaryContainer
          : theme.colors.surface,
        borderWidth: isFocused ? 2 : 1,
      },
    ];
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {digits.map((digit, index) => (
          <Pressable
            key={index}
            onPress={() => handleBoxPress(index)}
            style={getBoxStyle(index)}
            disabled={disabled}
          >
            <TextInput
              ref={(ref) => (inputRefs.current[index] = ref)}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!disabled}
              style={[
                styles.input,
                {
                  color: theme.colors.onSurface,
                },
              ]}
              textAlign="center"
            />
          </Pressable>
        ))}
      </View>

      {error && (
        <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: '100%',
    fontSize: 24,
    fontWeight: '600',
    padding: 0,
  },
  errorText: {
    marginTop: 8,
    textAlign: 'center',
  },
});