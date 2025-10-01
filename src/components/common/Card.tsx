import React from 'react';
import { View, Pressable, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useAppTheme } from '../../theme';

export type CardVariant = 'standard' | 'elevated' | 'glassmorphism';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'standard',
  onPress,
  style,
  contentStyle,
  disabled,
}) => {
  const theme = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const renderCard = () => {
    if (variant === 'glassmorphism') {
      return (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.glassmorphism,
            {
              borderRadius: theme.custom.layoutSpacing.borderRadius.lg,
              borderColor: theme.custom.colors.overlay.light,
            },
            style,
          ]}
        >
          <View style={[styles.content, { padding: theme.custom.componentSpacing.cardPadding }, contentStyle]}>
            {children}
          </View>
        </LinearGradient>
      );
    }

    return (
      <Surface
        elevation={variant === 'elevated' ? 4 : 1}
        style={[
          variant === 'elevated' ? styles.elevated : styles.standard,
          {
            borderRadius: variant === 'elevated'
              ? theme.custom.layoutSpacing.borderRadius.lg
              : theme.custom.layoutSpacing.borderRadius.md,
            backgroundColor: theme.custom.colors.surface.elevated,
          },
          style,
        ]}
      >
        <View style={[styles.content, { padding: theme.custom.componentSpacing.cardPadding }, contentStyle]}>
          {children}
        </View>
      </Surface>
    );
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View style={animatedStyle}>{renderCard()}</Animated.View>
      </Pressable>
    );
  }

  return renderCard();
};

const styles = StyleSheet.create({
  standard: {
    backgroundColor: '#FFFFFF',
  },
  elevated: {
    backgroundColor: '#FFFFFF',
  },
  glassmorphism: {
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  content: {
    // Default padding will be overridden by theme
  },
});

export type { CardProps };
