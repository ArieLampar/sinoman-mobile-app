export const spacing = {
  xxs: 2,
  xs: 4,   // Base unit
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
  '5xl': 96,
} as const;

export const componentSpacing = {
  buttonPadding: { horizontal: 20, vertical: 10 },
  cardPadding: 16,
  screenPadding: 16,
  sectionGap: 24,
  itemGap: 12,
  iconMargin: 8,
} as const;

export const layoutSpacing = {
  headerHeight: 56,
  bottomTabHeight: 60,
  minTouchTarget: 44,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },
} as const;

export type Spacing = typeof spacing;
