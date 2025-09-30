import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DashboardScreen } from '@screens/dashboard/DashboardScreen';
import { SavingsScreen } from '@screens/savings/SavingsScreen';
import { QRScannerScreen } from '@screens/qr/QRScannerScreen';
import { MarketplaceScreen } from '@screens/marketplace/MarketplaceScreen';
import { ProfileScreen } from '@screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size, focused }) => {
        const iconMap: Record<keyof MainTabParamList, string> = {
          Dashboard: 'home',
          Savings: 'wallet',
          QRScanner: 'qrcode-scan',
          Marketplace: 'shopping',
          Profile: 'account',
        };

        const iconName = iconMap[route.name];
        const iconSize = route.name === 'QRScanner' && focused ? size + 4 : size;

        return <Icon name={iconName} size={iconSize} color={color} />;
      },
      tabBarActiveTintColor: '#059669',
      tabBarInactiveTintColor: '#6B7280',
      tabBarStyle: {
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
    <Tab.Screen name="Savings" component={SavingsScreen} />
    <Tab.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan' }} />
    <Tab.Screen name="Marketplace" component={MarketplaceScreen} options={{ title: 'Shop' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);