/**
 * Order Confirmation Screen
 * Displays order success message and details
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Divider,
  useTheme,
  Card,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@types';
import { formatCurrency } from '@utils/formatters';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderConfirmation'>;
type OrderConfirmationRouteProp = RouteProp<RootStackParamList, 'OrderConfirmation'>;

export const OrderConfirmationScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderConfirmationRouteProp>();

  const { order } = route.params;

  const handleContinueShopping = () => {
    // Navigate to main tab (Marketplace)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const getPaymentMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      transfer: 'Bank Transfer',
      va: 'Virtual Account',
      ewallet: 'E-Wallet',
      cod: 'Cash on Delivery',
    };
    return labels[method] || method;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return theme.colors.secondary;
      case 'processing':
        return theme.colors.tertiary;
      case 'delivered':
        return theme.colors.primary;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Icon and Message */}
        <View style={styles.successContainer}>
          <Text variant="displayMedium" style={styles.successIcon}>
            ✅
          </Text>
          <Text variant="headlineMedium" style={styles.successTitle}>
            Order Placed Successfully!
          </Text>
          <Text variant="bodyLarge" style={styles.successMessage}>
            Thank you for your order. We'll process it shortly.
          </Text>
        </View>

        {/* Order ID Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Order Information
            </Text>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Order ID:
              </Text>
              <Text variant="titleMedium" style={styles.orderId}>
                {order.id}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Status:
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) },
                ]}
              >
                <Text variant="bodyMedium" style={styles.statusText}>
                  {order.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Date:
              </Text>
              <Text variant="bodyMedium">
                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Shipping Address Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Shipping Address
            </Text>
            <Text variant="bodyLarge" style={styles.addressName}>
              {order.shippingAddress.recipientName}
            </Text>
            <Text variant="bodyMedium" style={styles.addressPhone}>
              {order.shippingAddress.phone}
            </Text>
            <Text variant="bodyMedium" style={styles.addressText}>
              {order.shippingAddress.street}
            </Text>
            <Text variant="bodyMedium" style={styles.addressText}>
              {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
              {order.shippingAddress.postalCode}
            </Text>
          </Card.Content>
        </Card>

        {/* Payment Method Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Payment Method
            </Text>
            <Text variant="bodyLarge">
              {getPaymentMethodLabel(order.paymentMethod)}
            </Text>
            {order.paymentMethod !== 'cod' && (
              <Text variant="bodySmall" style={styles.paymentNote}>
                Please complete payment within 24 hours
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Order Items Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Order Items ({order.items.length})
            </Text>
            {order.items.map((item) => (
              <View key={item.product.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text variant="bodyLarge" numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.itemQuantity}>
                    {item.quantity} {item.product.unit} × {formatCurrency(item.product.price)}
                  </Text>
                  {item.notes && (
                    <Text variant="bodySmall" style={styles.itemNotes}>
                      Note: {item.notes}
                    </Text>
                  )}
                </View>
                <Text variant="titleMedium">
                  {formatCurrency(item.product.price * item.quantity)}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Order Summary Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Order Summary
            </Text>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Subtotal</Text>
              <Text variant="bodyMedium">{formatCurrency(order.subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Tax (11%)
              </Text>
              <Text variant="bodyMedium">{formatCurrency(order.tax)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Shipping Fee
              </Text>
              <Text variant="bodyMedium">{formatCurrency(order.shippingFee)}</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text variant="titleLarge" style={styles.totalLabel}>
                Total
              </Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {formatCurrency(order.total)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Additional Notes */}
        {order.notes && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Order Notes
              </Text>
              <Text variant="bodyMedium">{order.notes}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Info Message */}
        <View style={styles.infoMessage}>
          <Text variant="bodyMedium" style={styles.infoMessageText}>
            📧 Order confirmation has been sent to your email
          </Text>
          <Text variant="bodyMedium" style={styles.infoMessageText}>
            📱 Track your order status in the Orders section
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="contained"
          onPress={handleContinueShopping}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Continue Shopping
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  successTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  successMessage: {
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    opacity: 0.7,
  },
  orderId: {
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addressName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressPhone: {
    marginBottom: 8,
  },
  addressText: {
    lineHeight: 20,
  },
  paymentNote: {
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemQuantity: {
    opacity: 0.7,
    marginTop: 4,
  },
  itemNotes: {
    fontStyle: 'italic',
    opacity: 0.7,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    opacity: 0.7,
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  infoMessage: {
    paddingVertical: 16,
    gap: 8,
  },
  infoMessageText: {
    textAlign: 'center',
    opacity: 0.8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    marginVertical: 0,
  },
  buttonContent: {
    paddingVertical: 6,
  },
});
