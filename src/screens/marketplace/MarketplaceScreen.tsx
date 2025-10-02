/**
 * Marketplace Screen
 * Main shopping interface with product grid/list, search, filters, and cart
 * Optimized with memoization and FlatList performance props
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, ScrollView, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Searchbar,
  SegmentedButtons,
  Chip,
  FAB,
  Text,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Product } from '@types';
import { useMarketplaceStore } from '@store/marketplaceStore';
import { ProductCard } from '@components/marketplace/ProductCard';
import { MarketplaceSkeleton } from '@components/skeletons';
import { useAnalytics } from '@hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MarketplaceScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // Track analytics
  useAnalytics('Marketplace');

  const {
    products,
    categories,
    selectedCategory,
    viewMode,
    cart,
    isLoadingProducts,
    fetchProducts,
    fetchCategories,
    setSelectedCategory,
    setSearchQuery,
    setViewMode,
  } = useMarketplaceStore();

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCategories(), fetchProducts()]);
      setIsInitialLoad(false);
    };
    loadData();
  }, []);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleSearch = useCallback(() => {
    setSearchQuery(localSearchQuery);
    fetchProducts({
      searchQuery: localSearchQuery,
      categoryId: selectedCategory,
    });
  }, [localSearchQuery, selectedCategory, setSearchQuery, fetchProducts]);

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, [setSelectedCategory]);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', {
      productId: product.id,
      product,
    });
  }, [navigation]);

  const handleCartPress = useCallback(() => {
    navigation.navigate('Cart');
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    fetchProducts({ categoryId: selectedCategory });
  }, [fetchProducts, selectedCategory]);

  // Memoize renderItem to prevent recreation on every render
  const renderItem: ListRenderItem<Product> = useCallback(
    ({ item }) => (
      <ProductCard
        product={item}
        viewMode={viewMode}
        onPress={handleProductPress}
      />
    ),
    [viewMode, handleProductPress]
  );

  // Memoize keyExtractor
  const keyExtractor = useCallback((item: Product) => item.id, []);

  // Calculate item layout for better performance
  const getItemLayout = useCallback(
    (_data: Product[] | null | undefined, index: number) => ({
      length: viewMode === 'grid' ? 240 : 130,
      offset: (viewMode === 'grid' ? 240 : 130) * index,
      index,
    }),
    [viewMode]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Marketplace
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Cari produk..."
          value={localSearchQuery}
          onChangeText={setLocalSearchQuery}
          onSubmitEditing={handleSearch}
          onIconPress={handleSearch}
          style={styles.searchbar}
        />
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'grid' | 'list')}
          buttons={[
            {
              value: 'grid',
              icon: 'view-grid',
              label: 'Grid',
            },
            {
              value: 'list',
              icon: 'view-list',
              label: 'List',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          <Chip
            selected={selectedCategory === null}
            onPress={() => handleCategorySelect(null)}
            style={styles.chip}
          >
            Semua
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={selectedCategory === category.id}
              onPress={() => handleCategorySelect(category.id)}
              icon={category.icon}
              style={styles.chip}
            >
              {category.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      {isLoadingProducts && isInitialLoad ? (
        <MarketplaceSkeleton />
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleLarge" style={styles.emptyTitle}>
            No Products Found
          </Text>
          <Text variant="bodyMedium" style={styles.emptyDescription}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshing={isLoadingProducts}
          onRefresh={handleRefresh}
          // Performance optimizations
          windowSize={5}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          getItemLayout={getItemLayout}
        />
      )}

      {/* Cart FAB */}
      {cart.itemCount > 0 && (
        <FAB
          icon="cart"
          label={`${cart.itemCount} item${cart.itemCount > 1 ? 's' : ''}`}
          onPress={handleCartPress}
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchbar: {
    elevation: 2,
  },
  viewModeContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  segmentedButtons: {
    maxWidth: 300,
  },
  categoriesContainer: {
    marginBottom: 12,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  productsList: {
    paddingBottom: 100, // Space for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
