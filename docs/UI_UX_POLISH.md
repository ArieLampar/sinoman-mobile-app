# UI/UX Polish & Micro-interactions

Dokumentasi lengkap untuk implementasi UI/UX polish, micro-interactions, haptic feedback, toast notifications, skeleton loaders, dan animations di Sinoman Mobile App.

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Skeleton Loaders](#skeleton-loaders)
3. [Animations](#animations)
4. [Haptic Feedback](#haptic-feedback)
5. [Toast Notifications](#toast-notifications)
6. [Spacing Guidelines](#spacing-guidelines)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

---

## Overview

UI/UX Polish implementation menambahkan fitur-fitur berikut untuk meningkatkan user experience:

- ✅ **Skeleton Loaders** - Better perceived performance
- ✅ **Smooth Animations** - 60 FPS dengan Reanimated
- ✅ **Haptic Feedback** - Tactile responses
- ✅ **Toast Notifications** - Non-blocking notifications
- ✅ **Spacing System** - Consistent spacing
- ✅ **Success Animations** - Celebratory feedback

---

## Skeleton Loaders

Skeleton loaders memberikan visual feedback saat data sedang di-load, meningkatkan perceived performance.

### Available Skeletons

```typescript
import {
  DashboardSkeleton,
  MarketplaceSkeleton,
  SavingsSkeleton,
  ProfileSkeleton,
  NotificationsSkeleton,
  TransactionHistorySkeleton,
} from '@components/skeletons';
```

### Implementation Pattern

```typescript
export const MyScreen: React.FC = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { data, isLoading, fetchData } = useMyStore();

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
      setIsInitialLoad(false);
    };
    loadData();
  }, []);

  // Show skeleton only on initial load
  if (isLoading && isInitialLoad) {
    return <MySkeleton />;
  }

  return <ActualContent />;
};
```

### Creating Custom Skeletons

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export const CustomSkeleton: React.FC = () => {
  return (
    <SkeletonPlaceholder borderRadius={8}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header} />

        {/* Content */}
        <View style={styles.content} />

        {/* List items */}
        <View style={styles.listItem} />
        <View style={styles.listItem} />
        <View style={styles.listItem} />
      </View>
    </SkeletonPlaceholder>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    height: 48,
    borderRadius: 8,
    marginBottom: 16,
  },
  content: {
    height: 120,
    borderRadius: 8,
    marginBottom: 24,
  },
  listItem: {
    height: 72,
    borderRadius: 8,
    marginBottom: 12,
  },
});
```

### Design Guidelines

- **Border Radius:** Consistent 8px untuk semua skeleton shapes
- **Spacing:** Gunakan spacing constants dari `@utils/constants`
- **Dimensions:** Match actual component dimensions
- **Count:** Show 3-5 skeleton items untuk lists

---

## Animations

Smooth animations menggunakan `react-native-reanimated` v3 untuk performance 60 FPS.

### EmptyState Animations

EmptyState component sudah dilengkapi dengan staggered fade-in animations:

```typescript
import { EmptyState } from '@components/common';

<EmptyState
  icon="inbox"
  title="Tidak Ada Data"
  description="Data Anda akan muncul di sini"
  actionLabel="Refresh"
  onAction={handleRefresh}
/>
```

**Animation Pattern:**
- Container: `FadeInDown` (400ms, springify)
- Icon: `FadeIn` delay 100ms
- Title: `FadeIn` delay 200ms
- Description: `FadeIn` delay 300ms
- Action Button: `FadeIn` delay 400ms

### Success Animation Component

Animated modal untuk success feedback dengan haptic:

```typescript
import { SuccessAnimation } from '@components/common';

const [showSuccess, setShowSuccess] = useState(false);

<SuccessAnimation
  visible={showSuccess}
  title="Berhasil!"
  message="Transaksi telah selesai"
  onComplete={() => {
    setShowSuccess(false);
    navigation.goBack();
  }}
/>
```

**Features:**
- ✅ Auto-trigger haptic feedback
- ✅ Spring animation dengan rotation
- ✅ Auto-dismiss setelah 2 detik
- ✅ Customizable title & message
- ✅ Callback setelah selesai

### Custom Animations

```typescript
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

// Simple fade in
<Animated.View entering={FadeIn}>
  <Text>Content</Text>
</Animated.View>

// Slide in from right
<Animated.View entering={SlideInRight.duration(300)}>
  <Text>Content</Text>
</Animated.View>

// Custom animated style
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: withSpring(scale.value) }],
}));

<Animated.View style={animatedStyle}>
  <Text>Animated Content</Text>
</Animated.View>
```

### Animation Guidelines

- **Duration:** 200-400ms untuk micro-interactions
- **Easing:** Spring animations untuk natural feel
- **Stagger:** 100ms delay antar elemen
- **Performance:** Use `useAnimatedStyle` dan worklets
- **Avoid:** Animasi yang terlalu cepat (<100ms) atau lambat (>600ms)

---

## Haptic Feedback

Haptic feedback memberikan tactile response untuk meningkatkan user interaction.

### Available Haptic Functions

```typescript
import {
  lightImpact,
  mediumImpact,
  heavyImpact,
  successNotification,
  errorNotification,
  warningNotification,
  selectionAsync,
} from '@utils/haptics';
```

### Automatic Button Haptics

Semua buttons otomatis mendapat `lightImpact()` saat ditekan:

```typescript
import { Button } from '@components/common';

// Haptic otomatis terpasang
<Button onPress={handlePress}>
  Click Me
</Button>
```

### Manual Haptic Usage

```typescript
// Light impact untuk tap/touch
await lightImpact();

// Medium impact untuk important actions
await mediumImpact();

// Heavy impact untuk critical actions
await heavyImpact();

// Success notification (untuk success events)
await successNotification();

// Error notification (untuk errors)
await errorNotification();

// Warning notification (untuk warnings)
await warningNotification();

// Selection change (untuk pickers)
await selectionAsync();
```

### When to Use Haptics

| Action | Haptic Type | Example |
|--------|-------------|---------|
| Button press | `lightImpact` | Any button (automatic) |
| Toggle switch | `selectionAsync` | On/off toggle |
| Success event | `successNotification` | Payment success, check-in |
| Error event | `errorNotification` | Failed transaction |
| Warning | `warningNotification` | Low balance warning |
| Important action | `mediumImpact` | Add to cart, submit form |
| Critical action | `heavyImpact` | Delete, confirm payment |

### Best Practices

✅ **DO:**
- Gunakan haptic untuk user actions
- Pair success haptic dengan toast notification
- Use sparingly - jangan berlebihan
- Test di physical device (tidak bekerja di simulator)

❌ **DON'T:**
- Jangan gunakan haptic untuk setiap animasi
- Jangan gunakan heavy impact untuk minor actions
- Jangan stack multiple haptics bersamaan
- Jangan gunakan haptic di web platform (auto-disabled)

---

## Toast Notifications

Toast notifications non-blocking untuk menampilkan feedback tanpa mengganggu user flow.

### Available Toast Functions

```typescript
import {
  toastSuccess,
  toastError,
  toastInfo,
  toastWarning,
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  hideToast,
} from '@utils/toast';
```

### Simple Toasts

```typescript
// Success toast (bottom, 3s)
toastSuccess('Berhasil menyimpan data');

// Error toast (top, 5s)
toastError('Gagal memproses data');

// Info toast (bottom, 4s)
toastInfo('Data telah diperbarui');

// Warning toast (top, 4s)
toastWarning('Saldo hampir habis');
```

### Advanced Toasts

```typescript
// Success with custom options
showSuccessToast({
  title: 'Pembayaran Berhasil',
  message: 'Transaksi telah diproses',
  duration: 3000,
  onPress: () => navigation.navigate('Receipt'),
});

// Error with custom title
showErrorToast({
  title: 'Koneksi Gagal',
  message: 'Tidak dapat terhubung ke server',
  duration: 5000,
});

// Info without haptic
showInfoToast({
  title: 'Informasi',
  message: 'Sistem akan maintenance besok',
  withHaptic: false,
});

// Manual hide
hideToast();
```

### Toast Configuration

```typescript
interface ToastOptions {
  title?: string;          // Default: 'Berhasil'/'Gagal'/etc
  message: string;         // Required
  duration?: number;       // Default: 3000-5000ms
  onPress?: () => void;    // Optional tap action
  withHaptic?: boolean;    // Default: true (kecuali info)
}
```

### Toast Types & Behavior

| Type | Position | Duration | Haptic | Use Case |
|------|----------|----------|--------|----------|
| Success | Bottom | 3s | ✅ Success | Successful operations |
| Error | Top | 5s | ✅ Error | Failed operations |
| Info | Bottom | 4s | ❌ None | General information |
| Warning | Top | 4s | ✅ Warning | Warnings, alerts |

### Migration from Alert

```typescript
// ❌ OLD - Blocking Alert
Alert.alert('Error', 'Invalid amount');

// ✅ NEW - Non-blocking Toast
toastError('Invalid amount');

// ❌ OLD - Alert with callback
Alert.alert('Success', 'Item added', [
  { text: 'OK', onPress: () => navigation.navigate('Cart') }
]);

// ✅ NEW - Toast with callback
showSuccessToast({
  title: 'Success',
  message: 'Item added',
  onPress: () => navigation.navigate('Cart'),
});
```

### When to Use Alert vs Toast

**Use Alert for:**
- ✅ Confirmation dialogs (Cancel/OK)
- ✅ Critical decisions
- ✅ Permission requests
- ✅ Destructive actions

**Use Toast for:**
- ✅ Success feedback
- ✅ Error messages
- ✅ Validation errors
- ✅ Status updates
- ✅ Info notifications

### Best Practices

✅ **DO:**
- Use toast untuk feedback non-blocking
- Pair success toast dengan haptic
- Keep messages concise (max 2 baris)
- Use appropriate type untuk context
- Add `onPress` untuk actionable notifications

❌ **DON'T:**
- Jangan gunakan toast untuk confirmations
- Jangan stack multiple toasts
- Jangan gunakan toast untuk critical errors
- Jangan gunakan message terlalu panjang

---

## Spacing Guidelines

Consistent spacing system untuk visual harmony.

### Spacing Constants

```typescript
import { spacing } from '@utils/constants';

export const spacing = {
  xxs: 2,   // Minimal spacing
  xs: 4,    // Very tight spacing
  sm: 8,    // Tight spacing
  md: 16,   // Default spacing
  lg: 24,   // Loose spacing
  xl: 32,   // Very loose spacing
  xxl: 48,  // Extra loose spacing
  xxxl: 64, // Maximum spacing
} as const;
```

### Usage in Styles

```typescript
import { spacing } from '@utils/constants';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,        // 16
  },
  section: {
    marginBottom: spacing.lg,   // 24
  },
  item: {
    paddingVertical: spacing.sm,   // 8
    paddingHorizontal: spacing.md, // 16
  },
  gap: {
    gap: spacing.xs,            // 4
  },
});
```

### Spacing Scale Usage

| Size | Value | Use Case |
|------|-------|----------|
| `xxs` | 2px | Icon-text gap, minimal borders |
| `xs` | 4px | Tight gaps, small paddings |
| `sm` | 8px | List item gaps, small margins |
| `md` | 16px | Default padding, card padding |
| `lg` | 24px | Section margins, large gaps |
| `xl` | 32px | Screen padding, large sections |
| `xxl` | 48px | Header padding, hero sections |
| `xxxl` | 64px | Large hero sections |

### Guidelines

- **Consistent:** Selalu gunakan spacing constants
- **Vertical Rhythm:** Gunakan kelipatan 4px atau 8px
- **Responsive:** Adjust spacing untuk different screen sizes
- **Hierarchy:** Larger spacing = more importance

---

## Best Practices

### Performance Optimization

```typescript
// ✅ DO: Memoize expensive calculations
const sortedData = useMemo(
  () => data.sort((a, b) => a.id - b.id),
  [data]
);

// ✅ DO: Memoize callbacks
const handlePress = useCallback(() => {
  // action
}, [dependencies]);

// ✅ DO: Use FlatList windowSize
<FlatList
  data={items}
  windowSize={5}
  maxToRenderPerBatch={10}
  initialNumToRender={10}
/>

// ❌ DON'T: Create functions in render
<Button onPress={() => handleAction(item.id)}>Click</Button>
```

### Accessibility

```typescript
// ✅ DO: Add accessibility labels
<Button
  onPress={handlePress}
  accessibilityLabel="Add to cart"
  accessibilityHint="Adds item to your shopping cart"
>
  Add to Cart
</Button>

// ✅ DO: Minimum touch target 44x44
const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
  },
});
```

### Code Organization

```typescript
// ✅ DO: Group imports
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

// Custom imports
import { useMyStore } from '@store/myStore';
import { MyComponent } from '@components/MyComponent';
import { toastSuccess } from '@utils/toast';
import { lightImpact } from '@utils/haptics';

// ✅ DO: Destructure props
export const MyScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  // Component logic
};
```

---

## Examples

### Complete Screen Example

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from 'react-native-paper';

import { useMyStore } from '@store/myStore';
import { MySkeleton } from '@components/skeletons';
import { EmptyState } from '@components/common';
import { toastSuccess, toastError } from '@utils/toast';
import { successNotification } from '@utils/haptics';
import { useAnalytics } from '@hooks';
import { spacing } from '@utils/constants';

export const MyScreen: React.FC = ({ navigation }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Analytics
  useAnalytics('MyScreen');

  const {
    data,
    isLoading,
    fetchData,
    performAction
  } = useMyStore();

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await fetchData();
      setIsInitialLoad(false);
    };
    loadData();
  }, []);

  // Action handler
  const handleAction = useCallback(async (item) => {
    try {
      await performAction(item.id);

      // Success feedback
      successNotification();
      toastSuccess('Berhasil memproses data');

    } catch (error) {
      toastError('Gagal memproses data');
    }
  }, [performAction]);

  // Show skeleton on initial load
  if (isLoading && isInitialLoad) {
    return <MySkeleton />;
  }

  // Empty state
  if (data.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="inbox"
          title="Belum Ada Data"
          description="Data Anda akan muncul di sini"
          actionLabel="Refresh"
          onAction={fetchData}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
            <Button onPress={() => handleAction(item)}>
              Action
            </Button>
          </View>
        )}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={fetchData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
});
```

### Form Validation Example

```typescript
const handleSubmit = async () => {
  // Validate
  if (!name.trim()) {
    toastError('Nama tidak boleh kosong');
    return;
  }

  if (!email.trim()) {
    toastError('Email tidak boleh kosong');
    return;
  }

  if (amount < 10000) {
    toastError('Minimal amount Rp 10.000');
    return;
  }

  try {
    // Submit
    await submitForm({
      name: name.trim(),
      email: email.trim(),
      amount,
    });

    // Success
    successNotification();
    showSuccessToast({
      title: 'Berhasil',
      message: 'Data telah disimpan',
      onPress: () => navigation.goBack(),
    });

    // Auto navigate
    setTimeout(() => navigation.goBack(), 2000);

  } catch (error) {
    toastError('Gagal menyimpan data');
  }
};
```

### Payment Flow Example

```typescript
const handlePayment = async () => {
  // Validation
  if (amount < 1000) {
    toastError('Minimal pembayaran Rp 1.000');
    return;
  }

  if (!hasSufficientBalance) {
    toastError('Saldo tidak mencukupi');
    return;
  }

  // Confirmation (keep as Alert)
  Alert.alert(
    'Konfirmasi Pembayaran',
    `Bayar ${formatCurrency(amount)}?`,
    [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Bayar',
        onPress: async () => {
          try {
            const result = await processPayment(amount);

            if (result.success) {
              // Success with haptic
              successNotification();

              showSuccessToast({
                title: 'Pembayaran Berhasil! 🎉',
                message: 'Transaksi telah diproses',
                duration: 3000,
                onPress: () => navigation.navigate('Receipt', {
                  transactionId: result.id
                }),
              });

              // Auto navigate
              setTimeout(() => {
                navigation.navigate('Receipt', {
                  transactionId: result.id
                });
              }, 3000);

            } else {
              toastError(result.error || 'Pembayaran gagal');
            }
          } catch (error) {
            toastError('Terjadi kesalahan');
          }
        },
      },
    ]
  );
};
```

---

## Summary

Implementasi UI/UX polish memberikan:

✅ **Better Performance** - Skeleton loaders & optimized animations
✅ **Better Feedback** - Haptic & toast notifications
✅ **Better Consistency** - Spacing system & design patterns
✅ **Better UX** - Non-blocking notifications & smooth animations

**Total Features:**
- 6 Skeleton Loaders
- 2 Animation Components
- 8 Haptic Functions
- 8 Toast Functions
- 8 Spacing Constants
- 100+ Buttons dengan auto-haptic

**For More Information:**
- Implementation Status: `UI_UX_POLISH_IMPLEMENTATION_STATUS.md`
- Migration Guide: `ALERT_TO_TOAST_MIGRATION_COMPLETE.md`
