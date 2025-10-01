/**
 * Marketplace Store
 * Zustand store for marketplace state management with MMKV persistence and dynamic encryption
 */

import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import * as marketplaceService from '@services/marketplace';
import { logger } from '@utils/logger';
import { SECURITY } from '@utils/constants';
import { getSecureItem, setSecureItem, generateEncryptionKey } from '@services/security';
import type {
  Product,
  Category,
  Cart,
  CartItem,
  MarketplaceState,
  MarketplaceFilter,
  PlaceOrderRequest,
} from '@types';

// MMKV storage for cart persistence (initialized lazily with dynamic key)
let storage: MMKV | null = null;

/**
 * Get or create encryption key for cart storage
 */
async function getOrCreateCartEncryptionKey(): Promise<string> {
  try {
    let key = await getSecureItem(SECURITY.SECURE_KEYS.MMKV_CART_KEY);

    if (!key) {
      // Generate new 256-bit encryption key
      key = await generateEncryptionKey();
      await setSecureItem(SECURITY.SECURE_KEYS.MMKV_CART_KEY, key);
      logger.info('MMKV cart encryption key generated');
    }

    return key;
  } catch (error: any) {
    logger.error('Get cart encryption key error:', error);
    throw error;
  }
}

/**
 * Get initialized cart storage instance
 */
async function getCartStorage(): Promise<MMKV> {
  if (storage) return storage;

  const encryptionKey = await getOrCreateCartEncryptionKey();
  storage = new MMKV({
    id: 'marketplace-cart',
    encryptionKey, // Dynamic encryption key from secure storage
  });

  return storage;
}

/**
 * Calculate cart totals
 */
function calculateCart(items: CartItem[]): Cart {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.11); // 11% PPN
  const shippingFee = items.length > 0 ? 10000 : 0; // Flat shipping fee
  const discount = 0; // TODO: Implement discount logic
  const total = subtotal + tax + shippingFee - discount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    subtotal,
    tax,
    shippingFee,
    discount,
    total,
    itemCount,
  };
}

/**
 * Load cart from MMKV storage
 */
async function loadCartFromStorage(): Promise<CartItem[]> {
  try {
    const store = await getCartStorage();
    const cartJson = store.getString('@sinoman:cart');
    if (!cartJson) return [];

    const items = JSON.parse(cartJson) as CartItem[];
    logger.info('Cart loaded from storage', { itemCount: items.length });
    return items;
  } catch (error) {
    logger.error('Failed to load cart from storage', error);
    return [];
  }
}

/**
 * Save cart to MMKV storage
 */
async function saveCartToStorage(items: CartItem[]): Promise<void> {
  try {
    const store = await getCartStorage();
    store.set('@sinoman:cart', JSON.stringify(items));
    logger.info('Cart saved to storage', { itemCount: items.length });
  } catch (error) {
    logger.error('Failed to save cart to storage', error);
  }
}

/**
 * Marketplace Store
 */
export const useMarketplaceStore = create<MarketplaceState>((set, get) => {
  // Initialize cart asynchronously
  loadCartFromStorage().then(items => {
    set({ cart: calculateCart(items) });
  });

  return {
    // Initial State
    products: [],
    categories: [],
    selectedCategory: null,
    searchQuery: '',
    viewMode: 'grid',
    cart: calculateCart([]), // Start with empty cart, will be loaded async
    isLoadingProducts: false,
    isPlacingOrder: false,
    error: null,

  // Product Actions
  fetchProducts: async (filter?: MarketplaceFilter) => {
    set({ isLoadingProducts: true, error: null });
    try {
      const products = await marketplaceService.fetchProducts(filter);
      set({ products, isLoadingProducts: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      set({ error: errorMessage, isLoadingProducts: false });
      logger.error('Fetch products failed', error);
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await marketplaceService.fetchCategories();
      set({ categories });
    } catch (error) {
      logger.error('Fetch categories failed', error);
    }
  },

  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategory: categoryId });
    // Fetch products with the new category filter
    const { searchQuery } = get();
    get().fetchProducts({
      categoryId,
      searchQuery: searchQuery || undefined,
    });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setViewMode: (mode: 'grid' | 'list') => {
    set({ viewMode: mode });
  },

  // Cart Actions
  addToCart: (product: Product, quantity: number, notes?: string) => {
    const { cart } = get();
    const existingIndex = cart.items.findIndex(
      item => item.product.id === product.id
    );

    let newItems: CartItem[];

    if (existingIndex >= 0) {
      // Update existing item
      newItems = [...cart.items];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + quantity,
        notes: notes || newItems[existingIndex].notes,
      };
      logger.info('Updated cart item', { productId: product.id, newQuantity: newItems[existingIndex].quantity });
    } else {
      // Add new item
      newItems = [
        ...cart.items,
        {
          product,
          quantity,
          notes,
          addedAt: new Date().toISOString(),
        },
      ];
      logger.info('Added to cart', { productId: product.id, quantity });
    }

    const newCart = calculateCart(newItems);
    saveCartToStorage(newItems); // Async but not awaited (fire and forget)
    set({ cart: newCart });
  },

  removeFromCart: (productId: string) => {
    const { cart } = get();
    const newItems = cart.items.filter(item => item.product.id !== productId);
    const newCart = calculateCart(newItems);
    saveCartToStorage(newItems); // Async but not awaited
    set({ cart: newCart });
    logger.info('Removed from cart', { productId });
  },

  updateCartItemQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    const { cart } = get();
    const newItems = cart.items.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    );

    const newCart = calculateCart(newItems);
    saveCartToStorage(newItems); // Async but not awaited
    set({ cart: newCart });
    logger.info('Updated cart quantity', { productId, quantity });
  },

  clearCart: () => {
    saveCartToStorage([]); // Async but not awaited
    set({ cart: calculateCart([]) });
    logger.info('Cart cleared');
  },

  getCartItemCount: () => {
    return get().cart.itemCount;
  },

  placeOrder: async (request: PlaceOrderRequest) => {
    set({ isPlacingOrder: true, error: null });
    try {
      const response = await marketplaceService.placeOrder(request);

      if (response.success) {
        // Clear cart after successful order
        get().clearCart();
        logger.info('Order placed successfully', { orderId: response.orderId });
      } else {
        set({ error: response.error || 'Failed to place order' });
      }

      set({ isPlacingOrder: false });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      set({ error: errorMessage, isPlacingOrder: false });
      logger.error('Place order failed', error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
  };
});
