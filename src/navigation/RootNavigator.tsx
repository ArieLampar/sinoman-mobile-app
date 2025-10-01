import React, { useEffect, lazy, Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { RootStackParamList } from '@types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuthStore } from '@store/authStore';

// Lazy load non-critical screens for better performance
const TopUpScreen = lazy(() => import('@screens/savings/TopUpScreen').then(m => ({ default: m.TopUpScreen })));
const TransactionHistoryScreen = lazy(() => import('@screens/savings/TransactionHistoryScreen').then(m => ({ default: m.TransactionHistoryScreen })));
const ReceiptScreen = lazy(() => import('@screens/savings/ReceiptScreen').then(m => ({ default: m.ReceiptScreen })));
const QRPaymentScreen = lazy(() => import('@screens/qr/QRPaymentScreen').then(m => ({ default: m.QRPaymentScreen })));
const MyQRCodeScreen = lazy(() => import('@screens/qr/MyQRCodeScreen').then(m => ({ default: m.MyQRCodeScreen })));
const SettingsScreen = lazy(() => import('@screens/profile/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const EditProfileScreen = lazy(() => import('@screens/profile/EditProfileScreen').then(m => ({ default: m.EditProfileScreen })));
const NotificationsScreen = lazy(() => import('@screens/profile/NotificationsScreen').then(m => ({ default: m.NotificationsScreen })));
const FitChallengeScreen = lazy(() => import('@screens/fitChallenge/FitChallengeScreen').then(m => ({ default: m.FitChallengeScreen })));
const ProductDetailScreen = lazy(() => import('@screens/marketplace/ProductDetailScreen').then(m => ({ default: m.ProductDetailScreen })));
const CartScreen = lazy(() => import('@screens/marketplace/CartScreen').then(m => ({ default: m.CartScreen })));
const CheckoutScreen = lazy(() => import('@screens/marketplace/CheckoutScreen').then(m => ({ default: m.CheckoutScreen })));
const OrderConfirmationScreen = lazy(() => import('@screens/marketplace/OrderConfirmationScreen').then(m => ({ default: m.OrderConfirmationScreen })));

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
    <Suspense fallback={<ScreenLoadingFallback />}>
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
              name="Notifications"
              component={NotificationsScreen}
              options={{
                headerShown: true,
                title: 'Notifikasi',
                headerBackTitle: 'Kembali',
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: true,
                title: 'Edit Profil',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="FitChallenge"
              component={FitChallengeScreen}
              options={{
                headerShown: true,
                title: 'Fit Challenge',
                animation: 'slide_from_right',
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
    </Suspense>
  );
};

const ScreenLoadingFallback: React.FC = () => {
  const theme = useTheme();
  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
        Memuat...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});