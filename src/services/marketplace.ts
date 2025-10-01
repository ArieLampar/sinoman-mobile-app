/**
 * Marketplace Service
 * Handles product fetching, categories, and order placement
 * Currently uses mock data; replace with Supabase queries in production
 */

import { supabase } from './supabase';
import { logger } from '@utils/logger';
import type {
  Product,
  Category,
  MarketplaceFilter,
  PlaceOrderRequest,
  PlaceOrderResponse,
} from '@types';

// Mock Categories
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Sembako', icon: 'rice', productCount: 25, isActive: true },
  { id: '2', name: 'Protein', icon: 'food-drumstick', productCount: 18, isActive: true },
  { id: '3', name: 'Sayuran', icon: 'carrot', productCount: 30, isActive: true },
  { id: '4', name: 'Buah', icon: 'fruit-cherries', productCount: 22, isActive: true },
  { id: '5', name: 'Minuman', icon: 'cup', productCount: 15, isActive: true },
  { id: '6', name: 'Bumbu', icon: 'shaker', productCount: 20, isActive: true },
];

// Mock Products with Indonesian market items
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Beras Premium 5kg',
    description: 'Beras premium kualitas terbaik, pulen dan wangi',
    price: 75000,
    originalPrice: 85000,
    discount: 12,
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
    ],
    category: 'Sembako',
    categoryId: '1',
    stock: 50,
    unit: 'kg',
    rating: 4.8,
    reviewCount: 120,
    isAvailable: true,
    tags: ['beras', 'sembako', 'premium'],
  },
  {
    id: '2',
    name: 'Minyak Goreng 2L',
    description: 'Minyak goreng berkualitas untuk memasak sehari-hari',
    price: 32000,
    originalPrice: 35000,
    discount: 9,
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    ],
    category: 'Sembako',
    categoryId: '1',
    stock: 80,
    unit: 'liter',
    rating: 4.5,
    reviewCount: 85,
    isAvailable: true,
    tags: ['minyak', 'sembako'],
  },
  {
    id: '3',
    name: 'Gula Pasir 1kg',
    description: 'Gula pasir putih bersih',
    price: 14000,
    images: [
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    ],
    category: 'Sembako',
    categoryId: '1',
    stock: 100,
    unit: 'kg',
    rating: 4.6,
    reviewCount: 95,
    isAvailable: true,
    tags: ['gula', 'sembako'],
  },
  {
    id: '4',
    name: 'Telur Ayam Negeri 1kg',
    description: 'Telur ayam segar dari peternakan lokal',
    price: 28000,
    images: [
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
    ],
    category: 'Protein',
    categoryId: '2',
    stock: 60,
    unit: 'kg',
    rating: 4.7,
    reviewCount: 110,
    isAvailable: true,
    tags: ['telur', 'protein'],
  },
  {
    id: '5',
    name: 'Ayam Potong 1kg',
    description: 'Ayam potong segar, bersih dan higienis',
    price: 38000,
    originalPrice: 42000,
    discount: 10,
    images: [
      'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400',
    ],
    category: 'Protein',
    categoryId: '2',
    stock: 40,
    unit: 'kg',
    rating: 4.9,
    reviewCount: 145,
    isAvailable: true,
    tags: ['ayam', 'protein', 'daging'],
  },
  {
    id: '6',
    name: 'Daging Sapi 500g',
    description: 'Daging sapi pilihan, segar dan empuk',
    price: 75000,
    images: [
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400',
    ],
    category: 'Protein',
    categoryId: '2',
    stock: 25,
    unit: 'gram',
    rating: 4.8,
    reviewCount: 88,
    isAvailable: true,
    tags: ['daging', 'protein', 'sapi'],
  },
  {
    id: '7',
    name: 'Kangkung Segar 1 ikat',
    description: 'Kangkung segar dari petani lokal',
    price: 3000,
    images: [
      'https://images.unsplash.com/photo-1515363578674-99402b8c9c68?w=400',
    ],
    category: 'Sayuran',
    categoryId: '3',
    stock: 150,
    unit: 'ikat',
    rating: 4.4,
    reviewCount: 65,
    isAvailable: true,
    tags: ['sayur', 'kangkung', 'segar'],
  },
  {
    id: '8',
    name: 'Bayam 1 ikat',
    description: 'Bayam hijau segar kaya nutrisi',
    price: 3500,
    images: [
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
    ],
    category: 'Sayuran',
    categoryId: '3',
    stock: 120,
    unit: 'ikat',
    rating: 4.5,
    reviewCount: 72,
    isAvailable: true,
    tags: ['sayur', 'bayam', 'segar'],
  },
  {
    id: '9',
    name: 'Wortel 500g',
    description: 'Wortel segar manis dan renyah',
    price: 8000,
    images: [
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
    ],
    category: 'Sayuran',
    categoryId: '3',
    stock: 90,
    unit: 'gram',
    rating: 4.6,
    reviewCount: 80,
    isAvailable: true,
    tags: ['sayur', 'wortel', 'segar'],
  },
  {
    id: '10',
    name: 'Jeruk Manis 1kg',
    description: 'Jeruk manis segar kaya vitamin C',
    price: 25000,
    images: [
      'https://images.unsplash.com/photo-1547514701-42782101795e?w=400',
    ],
    category: 'Buah',
    categoryId: '4',
    stock: 70,
    unit: 'kg',
    rating: 4.7,
    reviewCount: 92,
    isAvailable: true,
    tags: ['buah', 'jeruk', 'segar'],
  },
  {
    id: '11',
    name: 'Pisang Cavendish 1kg',
    description: 'Pisang cavendish matang sempurna',
    price: 18000,
    images: [
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    ],
    category: 'Buah',
    categoryId: '4',
    stock: 85,
    unit: 'kg',
    rating: 4.5,
    reviewCount: 78,
    isAvailable: true,
    tags: ['buah', 'pisang', 'segar'],
  },
  {
    id: '12',
    name: 'Apel Fuji 1kg',
    description: 'Apel fuji import, manis dan segar',
    price: 45000,
    originalPrice: 50000,
    discount: 10,
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    ],
    category: 'Buah',
    categoryId: '4',
    stock: 55,
    unit: 'kg',
    rating: 4.9,
    reviewCount: 125,
    isAvailable: true,
    tags: ['buah', 'apel', 'import'],
  },
  {
    id: '13',
    name: 'Air Mineral 1500ml',
    description: 'Air mineral kemasan botol',
    price: 3500,
    images: [
      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
    ],
    category: 'Minuman',
    categoryId: '5',
    stock: 200,
    unit: 'botol',
    rating: 4.3,
    reviewCount: 150,
    isAvailable: true,
    tags: ['minuman', 'air'],
  },
  {
    id: '14',
    name: 'Teh Kotak 1 dus',
    description: 'Teh kotak isi 24 pack',
    price: 48000,
    images: [
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    ],
    category: 'Minuman',
    categoryId: '5',
    stock: 45,
    unit: 'dus',
    rating: 4.6,
    reviewCount: 88,
    isAvailable: true,
    tags: ['minuman', 'teh'],
  },
  {
    id: '15',
    name: 'Kecap Manis 600ml',
    description: 'Kecap manis kualitas premium',
    price: 18000,
    images: [
      'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=400',
    ],
    category: 'Bumbu',
    categoryId: '6',
    stock: 75,
    unit: 'botol',
    rating: 4.7,
    reviewCount: 95,
    isAvailable: true,
    tags: ['bumbu', 'kecap'],
  },
];

/**
 * Fetch all categories
 * TODO: Replace with Supabase query
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    logger.info('Fetched categories', { count: MOCK_CATEGORIES.length });
    return MOCK_CATEGORIES;

    // TODO: Implement Supabase query
    // const { data, error } = await supabase
    //   .from('categories')
    //   .select('*')
    //   .eq('isActive', true)
    //   .order('name');
    //
    // if (error) throw error;
    // return data;
  } catch (error) {
    logger.error('Failed to fetch categories', error);
    throw error;
  }
}

/**
 * Fetch products with optional filtering
 * TODO: Replace with Supabase query
 */
export async function fetchProducts(filter?: MarketplaceFilter): Promise<Product[]> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filtered = [...MOCK_PRODUCTS];

    // Filter by category
    if (filter?.categoryId) {
      filtered = filtered.filter(p => p.categoryId === filter.categoryId);
    }

    // Search query
    if (filter?.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.includes(query))
      );
    }

    // Price range
    if (filter?.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filter.minPrice!);
    }
    if (filter?.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filter.maxPrice!);
    }

    // Filter by tags
    if (filter?.tags && filter.tags.length > 0) {
      filtered = filtered.filter(p =>
        p.tags?.some(tag => filter.tags!.includes(tag))
      );
    }

    logger.info('Fetched products', { count: filtered.length, filter });
    return filtered;

    // TODO: Implement Supabase query
    // let query = supabase
    //   .from('products')
    //   .select('*')
    //   .eq('isAvailable', true);
    //
    // if (filter?.categoryId) {
    //   query = query.eq('categoryId', filter.categoryId);
    // }
    //
    // if (filter?.searchQuery) {
    //   query = query.or(`name.ilike.%${filter.searchQuery}%,description.ilike.%${filter.searchQuery}%`);
    // }
    //
    // const { data, error } = await query.order('name');
    // if (error) throw error;
    // return data;
  } catch (error) {
    logger.error('Failed to fetch products', error);
    throw error;
  }
}

/**
 * Get a single product by ID
 * TODO: Replace with Supabase query
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const product = MOCK_PRODUCTS.find(p => p.id === productId);

    if (product) {
      logger.info('Fetched product by ID', { productId, productName: product.name });
    } else {
      logger.warn('Product not found', { productId });
    }

    return product || null;

    // TODO: Implement Supabase query
    // const { data, error } = await supabase
    //   .from('products')
    //   .select('*')
    //   .eq('id', productId)
    //   .eq('isAvailable', true)
    //   .single();
    //
    // if (error) {
    //   if (error.code === 'PGRST116') {
    //     // Not found
    //     return null;
    //   }
    //   throw error;
    // }
    // return data;
  } catch (error) {
    logger.error('Failed to fetch product by ID', error);
    throw error;
  }
}

/**
 * Place an order
 * TODO: Save to Supabase and integrate with payment
 */
export async function placeOrder(request: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  try {
    // Calculate order totals
    const subtotal = request.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.11); // 11% PPN
    const shippingFee = 10000; // Flat shipping fee
    const total = subtotal + tax + shippingFee;

    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const order = {
      id: `ORD-${Date.now()}`,
      userId: 'mock-user-id', // TODO: Get from auth state
      items: request.items,
      subtotal,
      tax,
      shippingFee,
      total,
      shippingAddress: request.shippingAddress,
      paymentMethod: request.paymentMethod,
      status: 'pending' as const,
      notes: request.notes,
      createdAt: new Date().toISOString(),
    };

    logger.info('Order placed successfully', { orderId: order.id, total });

    return {
      success: true,
      orderId: order.id,
      order,
    };

    // TODO: Implement Supabase mutation
    // const { data, error } = await supabase
    //   .from('orders')
    //   .insert([{
    //     user_id: userId,
    //     items: request.items,
    //     subtotal,
    //     tax,
    //     shipping_fee: shippingFee,
    //     total,
    //     shipping_address: request.shippingAddress,
    //     payment_method: request.paymentMethod,
    //     status: 'pending',
    //     notes: request.notes,
    //   }])
    //   .select()
    //   .single();
    //
    // if (error) throw error;
    // return { success: true, orderId: data.id, order: data };
  } catch (error) {
    logger.error('Failed to place order', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to place order',
    };
  }
}
