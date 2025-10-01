import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, ViewStyle, KeyboardTypeOptions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useAppTheme } from '../../theme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  value,
  onChangeText,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled,
  ...props
}, ref) => {
  const theme = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const labelPosition = useSharedValue(value ? 1 : 0);

  const animatedLabelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withTiming(labelPosition.value === 1 ? -24 : 0, { duration: 200 }) },
      { scale: withTiming(labelPosition.value === 1 ? 0.85 : 1, { duration: 200 }) },
    ],
  }));

  const handleFocus = () => {
    setIsFocused(true);
    labelPosition.value = 1;
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) labelPosition.value = 0;
  };

  const borderColor = error
    ? theme.custom.colors.semantic.error
    : isFocused
    ? theme.custom.colors.brand.primary
    : theme.custom.colors.neutral.gray300;

  const labelColor = error
    ? theme.custom.colors.semantic.error
    : isFocused
    ? theme.custom.colors.brand.primary
    : theme.custom.colors.neutral.gray500;

  return (
    <View style={[styles.container, props.style]}>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            borderRadius: theme.custom.layoutSpacing.borderRadius.md,
            minHeight: theme.custom.layoutSpacing.minTouchTarget,
            height: props.multiline ? undefined : 56,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            {
              color: labelColor,
              fontSize: theme.custom.typography.bodyBase.fontSize,
              fontFamily: theme.custom.fontFamilies.regular,
              backgroundColor: theme.custom.colors.surface.background,
            },
            animatedLabelStyle,
          ]}
        >
          {label}
        </Animated.Text>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={theme.custom.colors.neutral.gray500}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              fontSize: theme.custom.typography.bodyBase.fontSize,
              fontFamily: theme.custom.fontFamilies.regular,
              color: theme.custom.colors.neutral.gray900,
            },
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            props.multiline && { height: (props.numberOfLines || 4) * 24 },
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          placeholderTextColor={theme.custom.colors.neutral.gray500}
          {...props}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            <Icon name={rightIcon} size={20} color={theme.custom.colors.neutral.gray500} />
          </Pressable>
        )}
      </View>
      {error && (
        <Text
          style={[
            styles.errorText,
            {
              fontSize: theme.custom.typography.caption.fontSize,
              fontFamily: theme.custom.fontFamilies.regular,
              color: theme.custom.colors.semantic.error,
            },
          ]}
        >
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text
          style={[
            styles.helperText,
            {
              fontSize: theme.custom.typography.caption.fontSize,
              fontFamily: theme.custom.fontFamilies.regular,
              color: theme.custom.colors.neutral.gray500,
            },
          ]}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    borderWidth: 1,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  label: {
    position: 'absolute',
    left: 16,
    paddingHorizontal: 2,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    padding: 4,
  },
  errorText: {
    marginTop: 4,
  },
  helperText: {
    marginTop: 4,
  },
});

export type { InputProps };
