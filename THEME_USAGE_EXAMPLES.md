# Theme Usage Examples

Complete guide for using design tokens in your components.

---

## Import Patterns

### Pattern 1: Direct Token Import (Recommended for Static Styles)

```typescript
import {
  colors,
  fontFamilies,
  layoutSpacing,
  componentSpacing
} from '@theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.background,
    padding: componentSpacing.screenPadding,
    borderRadius: layoutSpacing.borderRadius.md,
  },
  title: {
    fontFamily: fontFamilies.bold,
    color: colors.neutral.gray900,
  },
});
```

**When to use:**
- Static styles in `StyleSheet.create()`
- Values that don't change dynamically
- Better tree-shaking (smaller bundle)

---

### Pattern 2: Theme Hook (Recommended for Dynamic Values)

```typescript
import { useAppTheme } from '@theme';

const Component = () => {
  const theme = useAppTheme();
  const [isActive, setIsActive] = useState(false);

  return (
    <View style={{
      backgroundColor: isActive
        ? theme.custom.colors.brand.primary
        : theme.custom.colors.neutral.gray100
    }}>
      <Text>Dynamic styling</Text>
    </View>
  );
};
```

**When to use:**
- Dynamic styles based on state/props
- Need access to all theme properties
- Using with React hooks

---

### Pattern 3: Mixed (Best of Both)

```typescript
import { useAppTheme, fontFamilies, layoutSpacing } from '@theme';

const Component = ({ variant }: { variant: 'primary' | 'secondary' }) => {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      borderRadius: layoutSpacing.borderRadius.lg,
      padding: layoutSpacing.minTouchTarget / 2,
    },
    title: {
      fontFamily: fontFamilies.bold,
    },
  });

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: variant === 'primary'
          ? theme.custom.colors.brand.primary
          : theme.custom.colors.brand.secondary
      }
    ]}>
      <Text style={styles.title}>Title</Text>
    </View>
  );
};
```

---

## Complete Examples

### Example 1: Button Component

```typescript
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import {
  colors,
  fontFamilies,
  fontWeights,
  layoutSpacing,
  componentSpacing
} from '@theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
}) => {
  const backgroundColor = variant === 'primary'
    ? colors.brand.primary
    : colors.brand.secondary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor }
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: componentSpacing.buttonPadding.horizontal,
    paddingVertical: componentSpacing.buttonPadding.vertical,
    borderRadius: layoutSpacing.borderRadius.md,
    minHeight: layoutSpacing.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fontFamilies.semibold,
    fontWeight: fontWeights.semibold,
    color: colors.neutral.white,
    fontSize: 16,
  },
});
```

---

### Example 2: Card Component with Theme Hook

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@theme';

interface CardProps {
  title: string;
  description: string;
  variant?: 'default' | 'highlighted';
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  variant = 'default',
}) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variant === 'highlighted'
            ? theme.custom.colors.brand.primaryLight
            : theme.custom.colors.surface.elevated,
          borderColor: theme.custom.colors.surface.border,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            fontFamily: theme.custom.fontFamilies.bold,
            color: theme.custom.colors.neutral.gray900,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.description,
          {
            fontFamily: theme.custom.fontFamilies.regular,
            color: theme.custom.colors.neutral.gray700,
          },
        ]}
      >
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16, // Could use theme.custom.componentSpacing.cardPadding
    borderRadius: 8,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
```

---

### Example 3: Form with All Tokens

```typescript
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {
  colors,
  typography,
  spacing,
  fontFamilies,
  layoutSpacing,
  componentSpacing
} from '@theme';

export const LoginForm: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor={colors.neutral.gray500}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor={colors.neutral.gray500}
          secureTextEntry
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: componentSpacing.screenPadding,
    gap: spacing.lg,
  },
  title: {
    ...typography.h1,
    fontFamily: fontFamilies.bold,
    color: colors.neutral.gray900,
    marginBottom: spacing.md,
  },
  inputContainer: {
    gap: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    fontFamily: fontFamilies.medium,
    color: colors.neutral.gray700,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: layoutSpacing.borderRadius.md,
    padding: spacing.md,
    fontFamily: fontFamilies.regular,
    fontSize: typography.bodyBase.fontSize,
    minHeight: layoutSpacing.minTouchTarget,
    backgroundColor: colors.surface.background,
  },
});
```

---

### Example 4: Navigation Header

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  colors,
  fontFamilies,
  layoutSpacing,
  componentSpacing
} from '@theme';

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  rightAction,
}) => {
  return (
    <View style={styles.container}>
      {onBackPress && (
        <Pressable
          onPress={onBackPress}
          style={styles.iconButton}
        >
          <Icon name="arrow-left" size={24} color={colors.neutral.gray900} />
        </Pressable>
      )}

      <Text style={styles.title}>{title}</Text>

      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layoutSpacing.headerHeight,
    paddingHorizontal: componentSpacing.screenPadding,
    backgroundColor: colors.surface.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  iconButton: {
    width: layoutSpacing.minTouchTarget,
    height: layoutSpacing.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: componentSpacing.iconMargin,
  },
  title: {
    flex: 1,
    fontFamily: fontFamilies.semibold,
    fontSize: 18,
    color: colors.neutral.gray900,
  },
  rightAction: {
    marginLeft: componentSpacing.iconMargin,
  },
});
```

---

## Token Reference

### Colors
```typescript
import { colors } from '@theme';

// Brand
colors.brand.primary
colors.brand.primaryDark
colors.brand.primaryLight
colors.brand.secondary
colors.brand.secondaryDark
colors.brand.secondaryLight

// Semantic
colors.semantic.success
colors.semantic.warning
colors.semantic.error
colors.semantic.info

// Neutral
colors.neutral.black
colors.neutral.gray900
colors.neutral.gray700
colors.neutral.gray500
colors.neutral.gray300
colors.neutral.gray100
colors.neutral.white

// Surface
colors.surface.background
colors.surface.surface
colors.surface.elevated
colors.surface.border

// Overlay
colors.overlay.dark
colors.overlay.light
colors.overlay.scrim
```

### Typography
```typescript
import { typography } from '@theme';

typography.h1        // { fontSize: 32, fontWeight: '700', ... }
typography.h2        // { fontSize: 24, fontWeight: '600', ... }
typography.h3        // { fontSize: 20, fontWeight: '600', ... }
typography.bodyLarge // { fontSize: 18, fontWeight: '400', ... }
typography.bodyBase  // { fontSize: 16, fontWeight: '400', ... }
typography.bodySmall // { fontSize: 14, fontWeight: '400', ... }
typography.caption   // { fontSize: 12, fontWeight: '400', ... }
```

### Font Families
```typescript
import { fontFamilies } from '@theme';

fontFamilies.regular   // 'Inter-Regular'
fontFamilies.medium    // 'Inter-Medium'
fontFamilies.semibold  // 'Inter-SemiBold'
fontFamilies.bold      // 'Inter-Bold'
```

### Font Weights
```typescript
import { fontWeights } from '@theme';

fontWeights.regular   // '400'
fontWeights.medium    // '500'
fontWeights.semibold  // '600'
fontWeights.bold      // '700'
```

### Spacing
```typescript
import { spacing } from '@theme';

spacing.xxs  // 2
spacing.xs   // 4
spacing.sm   // 8
spacing.md   // 16
spacing.lg   // 24
spacing.xl   // 32
spacing['2xl'] // 48
spacing['3xl'] // 64
spacing['4xl'] // 80
spacing['5xl'] // 96
```

### Component Spacing
```typescript
import { componentSpacing } from '@theme';

componentSpacing.buttonPadding  // { horizontal: 20, vertical: 10 }
componentSpacing.cardPadding    // 16
componentSpacing.screenPadding  // 16
componentSpacing.sectionGap     // 24
componentSpacing.itemGap        // 12
componentSpacing.iconMargin     // 8
```

### Layout Spacing
```typescript
import { layoutSpacing } from '@theme';

layoutSpacing.headerHeight       // 56
layoutSpacing.bottomTabHeight    // 60
layoutSpacing.minTouchTarget     // 44
layoutSpacing.borderRadius.sm    // 4
layoutSpacing.borderRadius.md    // 8
layoutSpacing.borderRadius.lg    // 16
layoutSpacing.borderRadius.xl    // 24
layoutSpacing.borderRadius.full  // 9999
```

---

## Best Practices

### 1. Use Direct Imports for Static Styles
✅ **Good:**
```typescript
import { colors, fontFamilies } from '@theme';
const styles = StyleSheet.create({
  text: {
    fontFamily: fontFamilies.regular,
    color: colors.neutral.gray900,
  },
});
```

❌ **Avoid:**
```typescript
const Component = () => {
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    text: {
      fontFamily: theme.custom.fontFamilies.regular,
      color: theme.custom.colors.neutral.gray900,
    },
  });
};
```

### 2. Use Theme Hook for Dynamic Values
✅ **Good:**
```typescript
const Component = ({ isActive }) => {
  const theme = useAppTheme();
  return (
    <View style={{
      backgroundColor: isActive
        ? theme.custom.colors.brand.primary
        : theme.custom.colors.neutral.gray100
    }} />
  );
};
```

### 3. Combine Tokens for Consistency
✅ **Good:**
```typescript
<View style={{
  padding: componentSpacing.cardPadding,
  borderRadius: layoutSpacing.borderRadius.lg,
  gap: spacing.md,
}} />
```

---

**Complete token system ready to use!** ✅
