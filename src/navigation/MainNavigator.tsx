import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation.types';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { SavingsScreen } from '../screens/savings/SavingsScreen';
import { QRScannerScreen } from '../screens/qr/QRScannerScreen';
import { MarketplaceScreen } from '../screens/marketplace/MarketplaceScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { BottomNavigation, BottomNavigationItem } from '../components/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar component using our BottomNavigation
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  // Icon mapping for each screen
  const iconMap: Record<string, { icon: string; focusedIcon?: string }> = {
    Dashboard: { icon: 'home', focusedIcon: 'home' },
    Savings: { icon: 'wallet', focusedIcon: 'wallet' },
    QRScanner: { icon: 'qrcode-scan', focusedIcon: 'qrcode-scan' },
    Marketplace: { icon: 'shopping', focusedIcon: 'shopping' },
    Profile: { icon: 'account', focusedIcon: 'account' },
  };

  // Map routes to BottomNavigationItem format
  const items: BottomNavigationItem[] = state.routes.map((route: any, index: number) => {
    const { options } = descriptors[route.key];
    const label = options.tabBarLabel ?? options.title ?? route.name;
    const iconConfig = iconMap[route.name] || { icon: 'circle' };

    // Get badge from options (can be set via screenOptions or individually)
    const badge = options.tabBarBadge;

    return {
      key: route.key,
      label: typeof label === 'string' ? label : route.name,
      icon: iconConfig.icon,
      focusedIcon: iconConfig.focusedIcon,
      badge: badge,
      onPress: () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!event.defaultPrevented) {
          navigation.navigate(route.name);
        }
      },
    };
  });

  return <BottomNavigation items={items} activeKey={state.routes[state.index].key} />;
};

export const MainNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ title: 'Home' }}
    />
    <Tab.Screen
      name="Savings"
      component={SavingsScreen}
      options={{ title: 'Savings' }}
    />
    <Tab.Screen
      name="QRScanner"
      component={QRScannerScreen}
      options={{ title: 'Scan' }}
    />
    <Tab.Screen
      name="Marketplace"
      component={MarketplaceScreen}
      options={{ title: 'Shop' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);
