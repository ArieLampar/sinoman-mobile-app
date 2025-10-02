/**
 * Product Detail Screen
 * Displays detailed product information with image carousel and add-to-cart
 * Optimized with memoization and expo-image for better performance
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  IconButton,
  TextInput,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList, Product } from '@types';
import { useMarketplaceStore } from '@store/marketplaceStore';
import { formatCurrency } from '@utils/formatters';
import { ImagePresets, BlurhashPresets } from '@utils/imageCache';
import * as marketplaceService from '@services/marketplace';
import { toastError, showSuccessToast } from '@utils/toast';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

export const ProductDetailScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProductDetailRouteProp>();

  const { productId, product: routeProduct } = route.params;
  const { addToCart, products } = useMarketplaceStore();

  const [product, setProduct] = useState<Product | null>(routeProduct || null);
  const [isLoading, setIsLoading] = useState(!routeProduct);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch product if not provided in route params
  useEffect(() => {
    if (!routeProduct) {
      const loadProduct = async () => {
        setIsLoading(true);
        try {
          // First check if product is already in store
          let foundProduct = products.find(p => p.id === productId);

          if (!foundProduct) {
            // If not in store, fetch product by ID from service
            foundProduct = await marketplaceService.getProductById(productId);
          }

          if (foundProduct) {
            setProduct(foundProduct);
          } else {
            // Product not found
            toastError('Produk yang Anda cari tidak tersedia');
            navigation.goBack();
          }
        } catch (error) {
          toastError('Gagal memuat detail produk. Silakan coba lagi.');
          navigation.goBack();
        } finally {
          setIsLoading(false);
        }
      };

      loadProduct();
    }
  }, [routeProduct, productId, products, navigation]);

  // Memoize callbacks and calculations
  const handleQuantityChange = useCallback((delta: number) => {
    if (!product) return;
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  }, [product, quantity]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart(product, quantity, notes);
    showSuccessToast({
      title: 'Ditambahkan ke Keranjang',
      message: `${quantity} ${product.unit} ${product.name} ditambahkan`,
      onPress: () => navigation.navigate('Cart'),
    });
  }, [product, quantity, notes, addToCart, navigation]);

  const discountAmount = useMemo(() =>
    product?.originalPrice ? product.originalPrice - product.price : 0,
    [product?.originalPrice, product?.price]
  );

  const totalPrice = useMemo(() =>
    product ? product.price * quantity : 0,
    [product?.price, quantity]
  );

  // Show loading state
  if (isLoading || !product) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading product details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        {/* Image Carousel */}
        <View style={styles.imageCarousel}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const slideIndex = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentImageIndex(slideIndex);
            }}
            scrollEventThrottle={16}
          >
            {product.images.map((imageUri, index) => (
              <Image
                key={index}
                source={{ uri: imageUri }}
                style={styles.image}
                contentFit="cover"
                {...ImagePresets.highPriority}
                placeholder={{ blurhash: BlurhashPresets.product }}
                priority={index === 0 ? 'high' : 'normal'}
              />
            ))}
          </ScrollView>

          {/* Image Indicator */}
          {product.images.length > 1 && (
            <View style={styles.imageIndicator}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    {
                      backgroundColor:
                        index === currentImageIndex
                          ? theme.colors.primary
                          : theme.colors.surfaceDisabled,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Discount Badge */}
          {product.discount && product.discount > 0 && (
            <View
              style={[styles.discountBadge, { backgroundColor: theme.colors.error }]}
            >
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Title and Category */}
          <Text variant="headlineSmall" style={styles.title}>
            {product.name}
          </Text>
          <Text variant="bodyMedium" style={styles.category}>
            {product.category}
          </Text>

          {/* Rating */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              <Text variant="titleMedium">⭐ {product.rating}</Text>
              <Text variant="bodyMedium" style={styles.reviewCount}>
                ({product.reviewCount} reviews)
              </Text>
            </View>
          )}

          <Divider style={styles.divider} />

          {/* Price */}
          <View style={styles.priceContainer}>
            <View>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {formatCurrency(product.price)}
              </Text>
              <Text variant="bodySmall" style={styles.priceUnit}>
                per {product.unit}
              </Text>
            </View>
            {product.originalPrice && (
              <View style={styles.discountInfo}>
                <Text variant="bodyLarge" style={styles.originalPrice}>
                  {formatCurrency(product.originalPrice)}
                </Text>
                <Text variant="bodySmall" style={[styles.savings, { color: theme.colors.error }]}>
                  Save {formatCurrency(discountAmount)}
                </Text>
              </View>
            )}
          </View>

          {/* Stock */}
          <View style={styles.stockContainer}>
            <Text variant="bodyMedium">
              Stock Available: {product.stock} {product.unit}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Description
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {product.description}
            </Text>
          </View>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                  <Text variant="bodySmall">#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <Divider style={styles.divider} />

          {/* Quantity Control */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quantity
            </Text>
            <View style={styles.quantityControl}>
              <IconButton
                icon="minus"
                mode="contained-tonal"
                size={20}
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              />
              <View style={styles.quantityDisplay}>
                <Text variant="headlineSmall">{quantity}</Text>
                <Text variant="bodySmall" style={styles.quantityUnit}>
                  {product.unit}
                </Text>
              </View>
              <IconButton
                icon="plus"
                mode="contained-tonal"
                size={20}
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Notes (Optional)
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Add special instructions or notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.bottomBarContent}>
          <View style={styles.totalContainer}>
            <Text variant="bodySmall" style={styles.totalLabel}>
              Total Price
            </Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
              {formatCurrency(totalPrice)}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleAddToCart}
            style={styles.addToCartButton}
            contentStyle={styles.addToCartButtonContent}
            disabled={!product.isAvailable}
          >
            {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  imageCarousel: {
    position: 'relative',
  },
  image: {
    width,
    height: width,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    opacity: 0.7,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewCount: {
    marginLeft: 8,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceUnit: {
    opacity: 0.7,
    marginTop: 2,
  },
  discountInfo: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  savings: {
    marginTop: 2,
  },
  stockContainer: {
    marginTop: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    alignItems: 'center',
    marginHorizontal: 24,
    minWidth: 60,
  },
  quantityUnit: {
    opacity: 0.7,
    marginTop: -4,
  },
  notesInput: {
    minHeight: 80,
  },
  bottomBar: {
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    opacity: 0.7,
    marginBottom: 2,
  },
  addToCartButton: {
    marginLeft: 16,
  },
  addToCartButtonContent: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
