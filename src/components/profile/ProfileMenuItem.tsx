import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Badge, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ProfileMenuItem as ProfileMenuItemType } from '@types';

interface ProfileMenuItemProps {
  item: ProfileMenuItemType;
  showDivider?: boolean;
}

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ item, showDivider = true }) => {
  const theme = useTheme();

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.left}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: item.dangerous
                  ? theme.colors.errorContainer
                  : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Icon
              name={item.icon}
              size={24}
              color={item.dangerous ? theme.colors.error : theme.colors.onSurfaceVariant}
            />
          </View>
          <Text
            variant="bodyLarge"
            style={[
              styles.label,
              {
                color: item.dangerous ? theme.colors.error : theme.colors.onSurface,
              },
            ]}
          >
            {item.label}
          </Text>
        </View>

        <View style={styles.right}>
          {item.badge && (
            <Badge style={[styles.badge, { backgroundColor: theme.colors.errorContainer }]}>
              {item.badge}
            </Badge>
          )}
          <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
        </View>
      </TouchableOpacity>
      {showDivider && <Divider />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    fontWeight: '600',
  },
});
