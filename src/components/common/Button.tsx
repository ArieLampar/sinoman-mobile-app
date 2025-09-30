import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton, useTheme } from 'react-native-paper';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  children: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}) => {
  const theme = useTheme();

  const getButtonMode = (): 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal' => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'contained-tonal';
      case 'outline':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (size) {
      case 'small':
        return { ...baseStyle, minHeight: 32 };
      case 'large':
        return { ...baseStyle, minHeight: 56 };
      case 'medium':
      default:
        return { ...baseStyle, minHeight: 44 };
    }
  };

  const getContentStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingVertical: 4, paddingHorizontal: 12 };
      case 'large':
        return { paddingVertical: 14, paddingHorizontal: 24 };
      case 'medium':
      default:
        return { paddingVertical: 10, paddingHorizontal: 20 };
    }
  };

  const getLabelStyle = () => {
    switch (size) {
      case 'small':
        return { fontSize: 14 };
      case 'large':
        return { fontSize: 18, fontWeight: '600' as const };
      case 'medium':
      default:
        return { fontSize: 16, fontWeight: '600' as const };
    }
  };

  return (
    <PaperButton
      mode={getButtonMode()}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={icon}
      style={[styles.button, getButtonStyle(), style]}
      contentStyle={[styles.content, getContentStyle()]}
      labelStyle={[styles.label, getLabelStyle()]}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    letterSpacing: 0.5,
  },
});