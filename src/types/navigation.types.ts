import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

// Import types for params
import { SavingsType, TransactionReceipt } from './savings.types';
import { QRCodeData, MerchantInfo } from './qr.types';
import { Product, Order } from './marketplace.types';

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TopUp: { savingsType?: SavingsType };
  TransactionHistory: { savingsType?: SavingsType };
  Receipt: { transactionId: string; receipt: TransactionReceipt };
  QRPayment: { qrData: QRCodeData; merchant?: MerchantInfo };
  QRGenerate: undefined;
  Settings: undefined;
  EditProfile: undefined;
  FitChallenge: undefined;
  KYCVerification: undefined;
  ChangePhone: undefined;
  NotificationSettings: undefined;
  SecuritySettings: undefined;
  HelpCenter: undefined;
  About: undefined;
  Terms: undefined;
  Privacy: undefined;
  ProductDetail: { productId: string; product?: Product };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string; order: Order };
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  OTP: { phone: string };
  Register: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Dashboard: undefined;
  Savings: undefined;
  QRScanner: undefined;
  Marketplace: undefined;
  Profile: undefined;
};

// Screen Props Helper Types
export type AuthScreenProps<T extends keyof AuthStackParamList> = {
  navigation: NativeStackNavigationProp<AuthStackParamList, T>;
  route: RouteProp<AuthStackParamList, T>;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = {
  navigation: BottomTabNavigationProp<MainTabParamList, T>;
  route: RouteProp<MainTabParamList, T>;
};

// Global type declaration for type-safe navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}