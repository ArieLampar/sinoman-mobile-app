import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { RootStackParamList } from '@types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { TopUpScreen } from '@screens/savings/TopUpScreen';
import { TransactionHistoryScreen } from '@screens/savings/TransactionHistoryScreen';
import { ReceiptScreen } from '@screens/savings/ReceiptScreen';
import { QRPaymentScreen } from '@screens/qr/QRPaymentScreen';
import { MyQRCodeScreen } from '@screens/qr/MyQRCodeScreen';
import { SettingsScreen } from '@screens/profile/SettingsScreen';
import { ProductDetailScreen } from '@screens/marketplace/ProductDetailScreen';
import { CartScreen } from '@screens/marketplace/CartScreen';
import { CheckoutScreen } from '@screens/marketplace/CheckoutScreen';
import { OrderConfirmationScreen } from '@screens/marketplace/OrderConfirmationScreen';
import { useAuthStore } from '@store/authStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    // Check for existing session on app start
    checkSession();
  }, [checkSession]);

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen
            name="TopUp"
            component={TopUpScreen}
            options={{
              headerShown: true,
              title: 'Top Up Simpanan',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="TransactionHistory"
            component={TransactionHistoryScreen}
            options={{
              headerShown: true,
              title: 'Riwayat Transaksi',
            }}
          />
          <Stack.Screen
            name="Receipt"
            component={ReceiptScreen}
            options={{
              headerShown: true,
              title: 'Struk Transaksi',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="QRPayment"
            component={QRPaymentScreen}
            options={{
              headerShown: true,
              title: 'Konfirmasi Pembayaran',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="QRGenerate"
            component={MyQRCodeScreen}
            options={{
              headerShown: true,
              title: 'QR Code Saya',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: true,
              title: 'Pengaturan',
            }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{
              headerShown: true,
              title: 'Detail Produk',
            }}
          />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{
              headerShown: true,
              title: 'Keranjang Belanja',
            }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{
              headerShown: true,
              title: 'Checkout',
            }}
          />
          <Stack.Screen
            name="OrderConfirmation"
            component={OrderConfirmationScreen}
            options={{
              headerShown: true,
              title: 'Konfirmasi Pesanan',
              headerBackVisible: false,
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});