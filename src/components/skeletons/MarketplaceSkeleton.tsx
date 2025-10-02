import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Account for padding and gap

export const MarketplaceSkeleton: React.FC = () => {
  return (
    <SkeletonPlaceholder borderRadius={8}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBar} />

        {/* Categories */}
        <View style={styles.categories}>
          <View style={styles.categoryChip} />
          <View style={styles.categoryChip} />
          <View style={styles.categoryChip} />
        </View>

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {/* Row 1 */}
          <View style={styles.productRow}>
            <View style={styles.productCard} />
            <View style={styles.productCard} />
          </View>

          {/* Row 2 */}
          <View style={styles.productRow}>
            <View style={styles.productCard} />
            <View style={styles.productCard} />
          </View>

          {/* Row 3 */}
          <View style={styles.productRow}>
            <View style={styles.productCard} />
            <View style={styles.productCard} />
          </View>
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  searchBar: {
    height: 48,
    borderRadius: 8,
    marginBottom: 16,
  },
  categories: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  categoryChip: {
    width: 80,
    height: 36,
    borderRadius: 18,
  },
  productGrid: {
    gap: 16,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 8,
  },
});
