/**
 * ProductCard Component
 * Displays product information in grid or list view
 */

import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text, Badge, useTheme } from 'react-native-paper';
import type { Product } from '@types';
import { formatCurrency } from '@utils/formatters';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  viewMode = 'grid',
}) => {
  const theme = useTheme();

  if (viewMode === 'list') {
    return (
      <Pressable
        onPress={() => onPress(product)}
        style={[styles.listContainer, { backgroundColor: theme.colors.surface }]}
      >
        <Image
          source={{ uri: product.images[0] }}
          style={styles.listImage}
          resizeMode="cover"
        />
        <View style={styles.listContent}>
          <Text variant="titleMedium" numberOfLines={2}>
            {product.name}
          </Text>
          <Text variant="bodySmall" numberOfLines={1} style={styles.category}>
            {product.category}
          </Text>
          <View style={styles.priceRow}>
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              {formatCurrency(product.price)}
            </Text>
            {product.originalPrice && (
              <Text variant="bodySmall" style={styles.originalPrice}>
                {formatCurrency(product.originalPrice)}
              </Text>
            )}
          </View>
          {product.rating && (
            <View style={styles.ratingRow}>
              <Text variant="bodySmall">⭐ {product.rating}</Text>
              <Text variant="bodySmall" style={styles.reviewCount}>
                ({product.reviewCount})
              </Text>
            </View>
          )}
        </View>
        {product.discount && product.discount > 0 && (
          <Badge style={[styles.discountBadge, { backgroundColor: theme.colors.error }]}>
            -{product.discount}%
          </Badge>
        )}
      </Pressable>
    );
  }

  // Grid view
  return (
    <Pressable
      onPress={() => onPress(product)}
      style={[styles.gridContainer, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.gridImage}
          resizeMode="cover"
        />
        {product.discount && product.discount > 0 && (
          <Badge style={[styles.gridDiscountBadge, { backgroundColor: theme.colors.error }]}>
            -{product.discount}%
          </Badge>
        )}
      </View>
      <View style={styles.gridContent}>
        <Text variant="bodyMedium" numberOfLines={2} style={styles.productName}>
          {product.name}
        </Text>
        <Text variant="bodySmall" numberOfLines={1} style={styles.category}>
          {product.category}
        </Text>
        <View style={styles.gridPriceRow}>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
            {formatCurrency(product.price)}
          </Text>
        </View>
        {product.originalPrice && (
          <Text variant="bodySmall" style={styles.originalPrice}>
            {formatCurrency(product.originalPrice)}
          </Text>
        )}
        {product.rating && (
          <View style={styles.ratingRow}>
            <Text variant="bodySmall">⭐ {product.rating}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // List View Styles
  listContainer: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },

  // Grid View Styles
  gridContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 150,
  },
  gridContent: {
    padding: 12,
  },
  productName: {
    marginBottom: 4,
    minHeight: 40,
  },
  category: {
    opacity: 0.6,
    marginBottom: 4,
  },

  // Common Styles
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
    marginLeft: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewCount: {
    marginLeft: 4,
    opacity: 0.6,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  gridDiscountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
