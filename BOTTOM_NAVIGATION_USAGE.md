# BottomNavigation Component - Usage Guide

## Overview
Custom bottom navigation component with badge support, animations, and design system integration.

## Features

### ✅ 5 Tab Navigation
- Dashboard (Home)
- Savings
- QR Scanner (Center - Emphasized)
- Marketplace
- Profile

### ✅ Center Item Emphasis
The QR Scanner tab (index 2) is automatically emphasized with:
- Larger icon size (26px inactive, 28px active vs 24px for other tabs)
- Prominent positioning

### ✅ Badge Support
Display notification counts or status indicators on any tab.

### ✅ Animations
- Press animation: Scale effect (0.95) on touch
- Smooth transitions

### ✅ Design System Integration
- Uses theme colors, typography, spacing
- Safe area support for different devices
- Platform-specific shadows (iOS/Android)

---

## How to Add Badges

### Method 1: Individual Screen Badge
Add badge to a specific screen:

```typescript
// In MainNavigator.tsx
<Tab.Screen
  name="Profile"
  component={ProfileScreen}
  options={{
    title: 'Profile',
    tabBarBadge: 3  // Shows "3" badge
  }}
/>
```

### Method 2: Dynamic Badge with State
Use screen options function for dynamic badges:

```typescript
// In MainNavigator.tsx
import { useNotificationStore } from '@store/notificationStore';

export const MainNavigator: React.FC = () => {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined
        }}
      />
    </Tab.Navigator>
  );
};
```

### Method 3: String Badges
Use string badges for status:

```typescript
<Tab.Screen
  name="Marketplace"
  component={MarketplaceScreen}
  options={{
    title: 'Shop',
    tabBarBadge: 'NEW'  // Shows "NEW" badge
  }}
/>
```

### Badge Behavior
- **Numbers > 99**: Displays as "99+"
- **Zero or undefined**: Badge hidden
- **Strings**: Displayed as-is
- **Color**: Red (error color from theme)
- **Position**: Top-right of icon

---

## Testing the Implementation

### 1. Visual Test
Run the app and verify:
```bash
npx expo start
```

Check:
- ✅ All 5 tabs visible
- ✅ QR Scanner (center) has larger icon
- ✅ Icons change color when selected (gray → green)
- ✅ Labels use Inter font
- ✅ Safe area padding on devices with notches

### 2. Badge Test
Add test badges to MainNavigator:

```typescript
<Tab.Screen
  name="Savings"
  component={SavingsScreen}
  options={{
    title: 'Savings',
    tabBarBadge: 5  // Test number badge
  }}
/>
<Tab.Screen
  name="Marketplace"
  component={MarketplaceScreen}
  options={{
    title: 'Shop',
    tabBarBadge: 'NEW'  // Test string badge
  }}
/>
<Tab.Screen
  name="Profile"
  component={ProfileScreen}
  options={{
    title: 'Profile',
    tabBarBadge: 150  // Test 99+ behavior
  }}
/>
```

Verify:
- ✅ Badges appear in top-right of icons
- ✅ "150" shows as "99+"
- ✅ "NEW" shows as "NEW"
- ✅ Red background color

### 3. Animation Test
Tap each tab and verify:
- ✅ Smooth scale animation (0.95)
- ✅ Icon color changes (gray → green)
- ✅ Active state persists
- ✅ Navigation works correctly

### 4. Center Item Test
Observe QR Scanner tab:
- ✅ Icon is visibly larger than other tabs
- ✅ Size increases when active
- ✅ Remains centered and aligned

---

## Component Props

### BottomNavigationItem
```typescript
interface BottomNavigationItem {
  key: string;              // Unique key for the tab
  label: string;            // Tab label text
  icon: string;             // MaterialCommunityIcons name
  focusedIcon?: string;     // Icon when active (optional)
  badge?: number | string;  // Badge content (optional)
  onPress: () => void;      // Press handler
}
```

### BottomNavigationProps
```typescript
interface BottomNavigationProps {
  items: BottomNavigationItem[];  // Array of tab items
  activeKey: string;              // Currently active tab key
  style?: ViewStyle;              // Optional style override
}
```

---

## Customization Examples

### Custom Icon for Active State
```typescript
const iconMap: Record<string, { icon: string; focusedIcon?: string }> = {
  Dashboard: { icon: 'home-outline', focusedIcon: 'home' },
  Savings: { icon: 'wallet-outline', focusedIcon: 'wallet' },
  // ...
};
```

### Change Active Color
Edit theme colors:
```typescript
// src/theme/colors.ts
export const colors = {
  brand: {
    primary: '#059669',  // Active tab color
    // ...
  },
};
```

### Adjust Tab Height
Edit theme spacing:
```typescript
// src/theme/spacing.ts
export const layoutSpacing = {
  bottomTabHeight: 60,  // Adjust as needed
  // ...
};
```

---

## Integration with Screens

### Show Badge from Screen
Example: Update badge count from Profile screen

```typescript
// ProfileScreen.tsx
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Update badge dynamically
    navigation.setOptions({
      tabBarBadge: hasNotifications ? notificationCount : undefined,
    });
  }, [notificationCount, hasNotifications]);

  // ... rest of screen
};
```

### Real-world Example: Notifications
```typescript
// src/store/notificationStore.ts
import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;
  markAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  markAsRead: () => set({ unreadCount: 0 }),
}));

// In MainNavigator.tsx
const unreadCount = useNotificationStore((state) => state.unreadCount);

<Tab.Screen
  name="Profile"
  component={ProfileScreen}
  options={{
    tabBarBadge: unreadCount > 0 ? unreadCount : undefined
  }}
/>
```

---

## Troubleshooting

### Badge Not Showing
- Check if badge value is `undefined`, `0`, or `null` (these hide the badge)
- Verify badge prop is passed correctly in screen options
- Check theme colors are loaded

### Center Item Not Emphasized
- Verify QR Scanner is at index 2 (third tab)
- Check `isCenterItem` logic in BottomNavigation.tsx
- Ensure icon sizes are different (26/28 vs 24)

### Icons Not Showing
- Verify react-native-vector-icons is installed
- Check icon names are valid MaterialCommunityIcons
- Ensure fonts are linked properly

### Animation Lag
- Check React Native Reanimated is installed
- Ensure app is not in slow mode
- Test on physical device for best performance

---

## Success Criteria ✅

- ✅ Custom BottomNavigation component created
- ✅ Integrated with MainNavigator
- ✅ 5 tabs with proper icons and labels
- ✅ QR Scanner (center) emphasized with larger icons
- ✅ Badge support for numbers and strings
- ✅ Badge shows "99+" for numbers > 99
- ✅ Badge hides when undefined/0
- ✅ Press animations working
- ✅ Design system colors and typography
- ✅ Safe area support
- ✅ Platform-specific shadows

---

## Next Steps

After verifying the implementation:
1. Test on both iOS and Android
2. Test on devices with different safe areas (notches)
3. Add badges where needed (notifications, new features)
4. Consider adding haptic feedback on tab press
5. Consider animations for badge updates

**Phase 2C Complete!** ✅
