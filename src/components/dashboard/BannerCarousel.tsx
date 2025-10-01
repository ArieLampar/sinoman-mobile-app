import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { PromotionalBanner as BannerType } from '@types';
import { PromotionalBanner } from './PromotionalBanner';

interface BannerCarouselProps {
  banners: BannerType[];
  onBannerPress?: (banner: BannerType) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, onBannerPress }) => {
  const { width } = Dimensions.get('window');
  const carouselRef = useRef(null);

  if (!banners || banners.length === 0) {
    return null; // Don't render if no banners
  }

  const handleBannerPress = (banner: BannerType) => {
    if (onBannerPress) {
      onBannerPress(banner);
    }
  };

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        width={width}
        height={180}
        data={banners}
        autoPlay={banners.length > 1} // Only auto-play if multiple banners
        autoPlayInterval={3000} // 3 seconds per banner
        scrollAnimationDuration={500}
        loop={banners.length > 1}
        pagingEnabled
        snapEnabled
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        renderItem={({ item }) => (
          <PromotionalBanner banner={item} onPress={handleBannerPress} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
});
