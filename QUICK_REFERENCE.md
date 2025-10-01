# Quick Reference - Design System & Theme

## Import Cheat Sheet

### Colors
```typescript
import { colors } from '@theme';

colors.brand.primary          // #059669 (Primary Green)
colors.brand.secondary        // #F59E0B (Amber)
colors.semantic.error         // #EF4444 (Red)
colors.semantic.success       // #22C55E (Green)
colors.neutral.gray900        // #111827 (Dark)
colors.neutral.gray500        // #6B7280 (Medium)
colors.neutral.white          // #FFFFFF
colors.surface.background     // #FFFFFF
colors.surface.border         // #E5E7EB
```

### Typography
```typescript
import { typography } from '@theme';

typography.h1          // 32px, Bold, Inter
typography.h2          // 24px, SemiBold, Inter
typography.h3          // 20px, SemiBold, Inter
typography.bodyLarge   // 18px, Regular, Inter
typography.bodyBase    // 16px, Regular, Inter
typography.bodySmall   // 14px, Regular, Inter
typography.caption     // 12px, Regular, Inter
```

### Font Families
```typescript
import { fontFamilies } from '@theme';

fontFamilies.regular   // 'Inter-Regular'
fontFamilies.medium    // 'Inter-Medium'
fontFamilies.semibold  // 'Inter-SemiBold'
fontFamilies.bold      // 'Inter-Bold'
```

### Spacing
```typescript
import { spacing } from '@theme';

spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 16px (default)
spacing.lg    // 24px
spacing.xl    // 32px
spacing['2xl'] // 48px
```

### Component Spacing
```typescript
import { componentSpacing } from '@theme';

componentSpacing.buttonPadding   // { horizontal: 20, vertical: 10 }
componentSpacing.cardPadding     // 16
componentSpacing.screenPadding   // 16
componentSpacing.sectionGap      // 24
componentSpacing.itemGap         // 12
```

### Layout Spacing
```typescript
import { layoutSpacing } from '@theme';

layoutSpacing.headerHeight       // 56
layoutSpacing.bottomTabHeight    // 60
layoutSpacing.minTouchTarget     // 44 (iOS/Android standard)
layoutSpacing.borderRadius.sm    // 4
layoutSpacing.borderRadius.md    // 8
layoutSpacing.borderRadius.lg    // 16
layoutSpacing.borderRadius.full  // 9999
```

### Theme Hook
```typescript
import { useAppTheme } from '@theme';

const theme = useAppTheme();

theme.custom.colors.brand.primary
theme.custom.typography.h1
theme.custom.spacing.md
theme.custom.fontFamilies.bold
theme.custom.layoutSpacing.borderRadius.md
```

## Common Patterns

### Static Styles (Recommended)
```typescript
import { colors, fontFamilies, layoutSpacing } from '@theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.background,
    borderRadius: layoutSpacing.borderRadius.md,
    padding: 16,
  },
  text: {
    fontFamily: fontFamilies.regular,
    color: colors.neutral.gray900,
  },
});
```

### Dynamic Styles
```typescript
import { useAppTheme } from '@theme';

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

### Mixed Pattern
```typescript
import { useAppTheme, fontFamilies, layoutSpacing } from '@theme';

const Component = ({ variant }) => {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    base: {
      fontFamily: fontFamilies.semibold,
      borderRadius: layoutSpacing.borderRadius.lg,
    },
  });

  return (
    <View style={[
      styles.base,
      { backgroundColor: theme.custom.colors.brand[variant] }
    ]} />
  );
};
```

## Components Available

### Button
```typescript
import { Button } from '@components/common';

<Button variant="ghost" onPress={() => {}}>Cancel</Button>
<Button variant="primary" size="large">Submit</Button>
```

Variants: `primary`, `secondary`, `outline`, `ghost`, `text`
Sizes: `small`, `medium`, `large`

### Card
```typescript
import { Card } from '@components/common';

<Card variant="glassmorphism">
  <Text>Content</Text>
</Card>
```

Variants: `standard`, `elevated`, `glassmorphism`

### Input
```typescript
import { Input } from '@components/common';

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  leftIcon="email"
  error="Invalid email"
/>
```

### BottomNavigation
```typescript
import { BottomNavigation } from '@components/navigation';

<BottomNavigation
  items={items}
  activeKey={activeKey}
/>
```

## Brand Colors

- **Primary Green:** `#059669`
- **Secondary Amber:** `#F59E0B`
- Use for: Main actions, splash screen, adaptive icon background

## File Structure

```
src/theme/
├── colors.ts          # Color tokens
├── typography.ts      # Type scale + fonts
├── spacing.ts         # Spacing tokens
└── index.ts          # Exports

src/types/
└── theme.d.ts        # TypeScript types

src/components/
├── common/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── index.ts
└── navigation/
    ├── BottomNavigation.tsx
    └── index.ts
```

## TypeScript Support

All exports are fully typed:

```typescript
import type { AppTheme, CustomTheme, Colors, Typography, Spacing } from '@theme';

const theme: AppTheme = useAppTheme();
const colors: Colors = colors;
const typo: Typography = typography;
```

---

**Quick Reference v1.0** - Phase 2 Complete ✅
