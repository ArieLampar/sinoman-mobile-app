import React from 'react';
import { View, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { PromotionalBanner as BannerType } from '@types';
import { LinearGradient } from 'expo-linear-gradient';

interface PromotionalBannerProps {
  banner: BannerType;
  onPress?: (banner: BannerType) => void;
}

export const PromotionalBanner: React.FC<PromotionalBannerProps> = ({ banner, onPress }) => {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const bannerWidth = width - 32; // Account for screen padding

  const handlePress = () => {
    if (onPress) {
      onPress(banner);
    }
  };

  return (
    <Pressable onPress={handlePress} style={[styles.container, { width: bannerWidth }]}>
      {/* Background Image */}
      <Image
        source={{ uri: banner.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Gradient Overlay for text readability */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Title */}
          <Text variant="titleLarge" style={styles.title} numberOfLines={2}>
            {banner.title}
          </Text>

          {/* Description */}
          <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
            {banner.description}
          </Text>

          {/* Action Button */}
          {banner.actionLabel && (
            <Button
              mode="contained"
              onPress={handlePress}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              compact
            >
              {banner.actionLabel}
            </Button>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  content: {
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  buttonLabel: {
    fontSize: 12,
  },
});
