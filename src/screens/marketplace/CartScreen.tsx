/**
 * Cart Screen
 * Displays cart items with quantity controls and checkout summary
 */

import React from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@types';
import { useMarketplaceStore } from '@store/marketplaceStore';
import { CartItem } from '@components/marketplace/CartItem';
import { formatCurrency } from '@utils/formatters';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

export const CartScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { cart, updateCartItemQuantity, removeFromCart, clearCart } =
    useMarketplaceStore();

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearCart,
        },
      ]
    );
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  // Empty cart state
  if (cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Shopping Cart
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text variant="displaySmall" style={styles.emptyIcon}>
            🛒
          </Text>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Your Cart is Empty
          </Text>
          <Text variant="bodyLarge" style={styles.emptyDescription}>
            Add some products to get started
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.shopButton}
          >
            Start Shopping
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium" style={styles.title}>
            Shopping Cart
          </Text>
          <Text variant="bodyMedium" style={styles.itemCount}>
            {cart.itemCount} item{cart.itemCount > 1 ? 's' : ''}
          </Text>
        </View>
        <Button mode="text" onPress={handleClearCart} textColor={theme.colors.error}>
          Clear All
        </Button>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cart.items}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onQuantityChange={updateCartItemQuantity}
            onRemove={removeFromCart}
          />
        )}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Summary Section */}
      <View style={[styles.summaryContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.summaryContent}>
          <Text variant="titleLarge" style={styles.summaryTitle}>
            Order Summary
          </Text>

          {/* Subtotal */}
          <View style={styles.summaryRow}>
            <Text variant="bodyLarge">Subtotal</Text>
            <Text variant="bodyLarge">{formatCurrency(cart.subtotal)}</Text>
          </View>

          {/* Tax */}
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>
              Tax (11%)
            </Text>
            <Text variant="bodyMedium">{formatCurrency(cart.tax)}</Text>
          </View>

          {/* Shipping */}
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>
              Shipping Fee
            </Text>
            <Text variant="bodyMedium">{formatCurrency(cart.shippingFee)}</Text>
          </View>

          {/* Discount (if applicable) */}
          {cart.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={[styles.summaryLabel, { color: theme.colors.primary }]}>
                Discount
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                -{formatCurrency(cart.discount)}
              </Text>
            </View>
          )}

          <Divider style={styles.summaryDivider} />

          {/* Total */}
          <View style={styles.totalRow}>
            <Text variant="titleLarge" style={styles.totalLabel}>
              Total
            </Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
              {formatCurrency(cart.total)}
            </Text>
          </View>

          {/* Checkout Button */}
          <Button
            mode="contained"
            onPress={handleCheckout}
            style={styles.checkoutButton}
            contentStyle={styles.checkoutButtonContent}
          >
            Proceed to Checkout
          </Button>

          {/* Info Text */}
          <Text variant="bodySmall" style={styles.infoText}>
            Secure checkout with multiple payment options
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  itemCount: {
    opacity: 0.7,
    marginTop: 2,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  shopButton: {
    minWidth: 200,
  },
  summaryContainer: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryContent: {
    padding: 16,
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    opacity: 0.7,
  },
  summaryDivider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  checkoutButton: {
    marginVertical: 8,
  },
  checkoutButtonContent: {
    paddingVertical: 6,
  },
  infoText: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 8,
  },
});
