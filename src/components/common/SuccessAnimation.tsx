import React, { useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { successNotification } from '../../utils/haptics';

interface SuccessAnimationProps {
  visible: boolean;
  title?: string;
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  visible,
  title = 'Berhasil!',
  message,
  onComplete,
  duration = 2000,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      successNotification();

      // Animate icon entrance with spring and rotation
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );

      iconRotation.value = withSpring(360, {
        damping: 10,
        stiffness: 100,
      });

      // Fade in container
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });

      // Auto-hide after duration
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        scale.value = withTiming(0, { duration: 300 });
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Reset values when hidden
      scale.value = 0;
      opacity.value = 0;
      iconRotation.value = 0;
    }
  }, [visible, duration, onComplete]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${iconRotation.value}deg` }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: theme.colors.surface },
            animatedContainerStyle,
          ]}
        >
          <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
            <Icon name="check-circle" size={64} color={theme.colors.primary} />
          </Animated.View>

          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>

          {message && (
            <Text
              variant="bodyMedium"
              style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
            >
              {message}
            </Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
