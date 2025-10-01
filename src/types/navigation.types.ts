import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TopUp: { savingsType?: SavingsType };
  QRPayment: { qrData: QRCodeData; merchant?: MerchantInfo };
  QRGenerate: undefined;
  Settings: undefined;
  EditProfile: undefined;
  KYCVerification: undefined;
  ChangePhone: undefined;
  NotificationSettings: undefined;
  SecuritySettings: undefined;
  HelpCenter: undefined;
  About: undefined;
  Terms: undefined;
  Privacy: undefined;
};

// Import types for params
import { SavingsType } from './savings.types';
import { QRCodeData, MerchantInfo } from './qr.types';

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