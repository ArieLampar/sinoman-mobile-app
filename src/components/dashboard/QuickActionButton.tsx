import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onPress,
  color,
}) => {
  const theme = useTheme();
  const backgroundColor = color || theme.colors.primaryContainer;
  const iconColor = color ? '#FFFFFF' : theme.colors.primary;

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Surface style={[styles.surface, { backgroundColor }]} elevation={1}>
        <Icon name={icon} size={28} color={iconColor} />
      </Surface>
      <Text variant="bodySmall" style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
    maxWidth: 90,
  },
  surface: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    lineHeight: 16,
  },
});