/**
 * Checkout Screen
 * Handles shipping address, payment method selection, and order placement
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Address } from '@types';
import { useMarketplaceStore } from '@store/marketplaceStore';
import { formatCurrency } from '@utils/formatters';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;

export const CheckoutScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { cart, placeOrder, isPlacingOrder } = useMarketplaceStore();

  // Shipping address state
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Ponorogo');
  const [postalCode, setPostalCode] = useState('');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('transfer');

  const validateForm = (): boolean => {
    if (!recipientName.trim()) {
      Alert.alert('Validation Error', 'Please enter recipient name');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Please enter phone number');
      return false;
    }
    if (!street.trim()) {
      Alert.alert('Validation Error', 'Please enter street address');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Validation Error', 'Please enter city');
      return false;
    }
    if (!postalCode.trim()) {
      Alert.alert('Validation Error', 'Please enter postal code');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    const shippingAddress: Address = {
      label: 'Home',
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      province: 'Jawa Timur',
      postalCode: postalCode.trim(),
    };

    const response = await placeOrder({
      items: cart.items,
      shippingAddress,
      paymentMethod,
    });

    if (response.success && response.order) {
      Alert.alert(
        'Order Placed Successfully!',
        `Order ID: ${response.orderId}`,
        [
          {
            text: 'View Order',
            onPress: () =>
              navigation.replace('OrderConfirmation', {
                orderId: response.orderId!,
                order: response.order!,
              }),
          },
        ]
      );
    } else {
      Alert.alert('Order Failed', response.error || 'Failed to place order. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Shipping Address Section */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Shipping Address
          </Text>

          <TextInput
            mode="outlined"
            label="Recipient Name *"
            value={recipientName}
            onChangeText={setRecipientName}
            placeholder="Enter full name"
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Phone Number *"
            value={phone}
            onChangeText={setPhone}
            placeholder="08xxxxxxxxxx"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Street Address *"
            value={street}
            onChangeText={setStreet}
            placeholder="Enter complete address"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="City *"
            value={city}
            onChangeText={setCity}
            placeholder="Enter city"
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              mode="outlined"
              label="Province"
              value="Jawa Timur"
              editable={false}
              style={[styles.input, styles.halfWidth]}
            />
            <TextInput
              mode="outlined"
              label="Postal Code *"
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="Enter postal code"
              keyboardType="number-pad"
              maxLength={5}
              style={[styles.input, styles.halfWidth]}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Payment Method
          </Text>

          <RadioButton.Group
            onValueChange={setPaymentMethod}
            value={paymentMethod}
          >
            <View style={styles.radioItem}>
              <RadioButton.Item
                label="Bank Transfer"
                value="transfer"
                mode="android"
              />
              <Text variant="bodySmall" style={styles.radioDescription}>
                Transfer to our bank account (BCA, Mandiri, BNI)
              </Text>
            </View>

            <View style={styles.radioItem}>
              <RadioButton.Item
                label="Virtual Account"
                value="va"
                mode="android"
              />
              <Text variant="bodySmall" style={styles.radioDescription}>
                Pay via Virtual Account (all banks supported)
              </Text>
            </View>

            <View style={styles.radioItem}>
              <RadioButton.Item
                label="E-Wallet"
                value="ewallet"
                mode="android"
              />
              <Text variant="bodySmall" style={styles.radioDescription}>
                GoPay, OVO, Dana, ShopeePay
              </Text>
            </View>

            <View style={styles.radioItem}>
              <RadioButton.Item
                label="Cash on Delivery (COD)"
                value="cod"
                mode="android"
              />
              <Text variant="bodySmall" style={styles.radioDescription}>
                Pay when order is delivered
              </Text>
            </View>
          </RadioButton.Group>
        </View>

        <Divider style={styles.divider} />

        {/* Order Summary Section */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Order Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text variant="bodyLarge">Items ({cart.itemCount})</Text>
            <Text variant="bodyLarge">{formatCurrency(cart.subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>
              Tax (11%)
            </Text>
            <Text variant="bodyMedium">{formatCurrency(cart.tax)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>
              Shipping Fee
            </Text>
            <Text variant="bodyMedium">{formatCurrency(cart.shippingFee)}</Text>
          </View>

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

          <View style={styles.totalRow}>
            <Text variant="titleLarge" style={styles.totalLabel}>
              Total Payment
            </Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
              {formatCurrency(cart.total)}
            </Text>
          </View>
        </View>

        {/* Items Preview */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Items in Order
          </Text>
          {cart.items.map((item) => (
            <View key={item.product.id} style={styles.itemRow}>
              <Text variant="bodyMedium" style={styles.itemName}>
                {item.product.name} x {item.quantity}
              </Text>
              <Text variant="bodyMedium">
                {formatCurrency(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="contained"
          onPress={handlePlaceOrder}
          loading={isPlacingOrder}
          disabled={isPlacingOrder}
          style={styles.placeOrderButton}
          contentStyle={styles.placeOrderButtonContent}
        >
          {isPlacingOrder ? 'Processing...' : 'Place Order'}
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  radioItem: {
    marginBottom: 8,
  },
  radioDescription: {
    marginLeft: 56,
    marginTop: -8,
    marginBottom: 8,
    opacity: 0.7,
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
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemName: {
    flex: 1,
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
  placeOrderButton: {
    marginVertical: 0,
  },
  placeOrderButtonContent: {
    paddingVertical: 6,
  },
});
