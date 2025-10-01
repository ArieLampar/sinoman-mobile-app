/**
 * Marketplace Type Definitions
 * Core interfaces for e-commerce functionality
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  categoryId: string;
  stock: number;
  unit: string;
  rating?: number;
  reviewCount?: number;
  isAvailable: boolean;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  total: number;
  itemCount: number;
}

export interface Address {
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface MarketplaceFilter {
  categoryId?: string | null;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}

export interface PlaceOrderRequest {
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: string;
  notes?: string;
}

export interface PlaceOrderResponse {
  success: boolean;
  orderId?: string;
  order?: Order;
  error?: string;
}

export interface MarketplaceState {
  products: Product[];
  categories: Category[];
  selectedCategory: string | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  cart: Cart;
  isLoadingProducts: boolean;
  isPlacingOrder: boolean;
  error: string | null;

  // Actions
  fetchProducts: (filter?: MarketplaceFilter) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  addToCart: (product: Product, quantity: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  placeOrder: (request: PlaceOrderRequest) => Promise<PlaceOrderResponse>;
}
