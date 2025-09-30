import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Switch } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SettingsItemProps {
  icon: string;
  label: string;
  description?: string;
  type?: 'switch' | 'navigation';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  disabled?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  description,
  type = 'navigation',
  value,
  onValueChange,
  onPress,
  disabled = false,
}) => {
  const theme = useTheme();

  const handlePress = () => {
    if (type === 'switch' && onValueChange) {
      onValueChange(!value);
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Icon name={icon} size={24} color={theme.colors.onSurface} />
        <View style={styles.textContainer}>
          <Text
            variant="bodyLarge"
            style={[
              styles.label,
              {
                color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurface,
              },
            ]}
          >
            {label}
          </Text>
          {description && (
            <Text
              variant="bodySmall"
              style={[
                styles.description,
                {
                  color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.right}>
        {type === 'switch' ? (
          <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
        ) : (
          <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 64,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontWeight: '500',
  },
  description: {
    lineHeight: 18,
  },
  right: {
    marginLeft: 16,
  },
});
