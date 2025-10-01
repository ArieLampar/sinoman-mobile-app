import React from 'react';
import { View, Pressable, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Badge } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useAppTheme } from '../../theme';

export interface BottomNavigationItem {
  key: string;
  label: string;
  icon: string;
  focusedIcon?: string;
  badge?: number | string;
  onPress: () => void;
}

interface BottomNavigationProps {
  items: BottomNavigationItem[];
  activeKey: string;
  style?: ViewStyle;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ items, activeKey, style }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const renderItem = (item: BottomNavigationItem, index: number) => {
    const isActive = item.key === activeKey;
    const isCenterItem = index === 2; // Center item (QR Scanner) should be emphasized
    const scale = useSharedValue(1);

    // Center item gets larger icons
    const iconSize = isCenterItem ? (isActive ? 28 : 26) : 24;
    const iconColor = isActive
      ? theme.custom.colors.brand.primary
      : theme.custom.colors.neutral.gray500;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withTiming(0.95, { duration: 100 });
    };

    const handlePressOut = () => {
      scale.value = withTiming(1, { duration: 100 });
    };

    const handlePress = () => {
      item.onPress();
    };

    return (
      <Pressable
        key={item.key}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.item}
      >
        <Animated.View style={[styles.itemContent, animatedStyle]}>
          <View style={styles.iconContainer}>
            <Icon
              name={isActive && item.focusedIcon ? item.focusedIcon : item.icon}
              size={iconSize}
              color={iconColor}
            />
            {item.badge !== undefined && item.badge !== 0 && (
              <Badge
                style={[
                  styles.badge,
                  { backgroundColor: theme.custom.colors.semantic.error },
                ]}
                size={16}
                visible={true}
              >
                {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
              </Badge>
            )}
          </View>
          <Text
            style={[
              styles.label,
              {
                color: iconColor,
                fontSize: theme.custom.typography.caption.fontSize,
                fontFamily: theme.custom.fontFamilies.regular,
              },
            ]}
          >
            {item.label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          height: theme.custom.layoutSpacing.bottomTabHeight + insets.bottom,
          borderTopColor: theme.custom.colors.surface.border,
          backgroundColor: theme.custom.colors.surface.background,
        },
        style,
      ]}
    >
      {items.map((item, index) => renderItem(item, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: -2 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
  },
  label: {
    textAlign: 'center',
    letterSpacing: 0.25,
  },
});

export type { BottomNavigationProps };
