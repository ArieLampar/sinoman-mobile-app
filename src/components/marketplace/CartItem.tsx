/**
 * CartItem Component
 * Displays a single item in the shopping cart with quantity controls
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import type { CartItem as CartItemType } from '@types';
import { formatCurrency } from '@utils/formatters';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
}) => {
  const theme = useTheme();
  const { product, quantity, notes } = item;

  const subtotal = product.price * quantity;
  const isMinQuantity = quantity <= 1;
  const isMaxQuantity = quantity >= product.stock;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Image
        source={{ uri: product.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text variant="titleMedium" numberOfLines={2}>
              {product.name}
            </Text>
            <Text variant="bodySmall" style={styles.category}>
              {product.category}
            </Text>
            <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
              {formatCurrency(product.price)} / {product.unit}
            </Text>
            {notes && (
              <Text variant="bodySmall" style={styles.notes}>
                Note: {notes}
              </Text>
            )}
          </View>

          <IconButton
            icon="delete"
            size={20}
            onPress={() => onRemove(product.id)}
            iconColor={theme.colors.error}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.quantityControl}>
            <IconButton
              icon="minus"
              mode="contained-tonal"
              size={16}
              onPress={() => onQuantityChange(product.id, quantity - 1)}
              disabled={isMinQuantity}
            />
            <View style={styles.quantityDisplay}>
              <Text variant="titleMedium">{quantity}</Text>
              <Text variant="bodySmall" style={styles.unit}>
                {product.unit}
              </Text>
            </View>
            <IconButton
              icon="plus"
              mode="contained-tonal"
              size={16}
              onPress={() => onQuantityChange(product.id, quantity + 1)}
              disabled={isMaxQuantity}
            />
          </View>

          <View style={styles.subtotalContainer}>
            <Text variant="bodySmall" style={styles.subtotalLabel}>
              Subtotal:
            </Text>
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              {formatCurrency(subtotal)}
            </Text>
          </View>
        </View>

        {isMaxQuantity && (
          <Text variant="bodySmall" style={[styles.stockWarning, { color: theme.colors.error }]}>
            Maximum stock reached ({product.stock} {product.unit} available)
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  category: {
    opacity: 0.6,
    marginTop: 2,
  },
  notes: {
    fontStyle: 'italic',
    opacity: 0.7,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityDisplay: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 40,
  },
  unit: {
    opacity: 0.6,
    marginTop: -2,
  },
  subtotalContainer: {
    alignItems: 'flex-end',
  },
  subtotalLabel: {
    opacity: 0.6,
    marginBottom: 2,
  },
  stockWarning: {
    marginTop: 8,
    fontSize: 12,
  },
});
