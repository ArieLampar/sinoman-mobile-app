import { MD3LightTheme } from 'react-native-paper';
import type { AppTheme } from '../types/theme.d';
import { colors } from './colors';
import { typography, fontFamilies, fontWeights, loadFonts } from './typography';
import { spacing, componentSpacing, layoutSpacing } from './spacing';

export const theme: AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.brand.primary,
    primaryContainer: colors.brand.primaryLight,
    secondary: colors.brand.secondary,
    secondaryContainer: colors.brand.secondaryLight,
    error: colors.semantic.error,
    background: colors.surface.background,
    surface: colors.surface.surface,
  },
  custom: {
    colors,
    typography,
    spacing,
    componentSpacing,
    layoutSpacing,
    fontFamilies,
    fontWeights,
  },
};

export const useAppTheme = (): AppTheme => theme;

// Export all design tokens
export { colors, typography, spacing, loadFonts };
export { fontFamilies, fontWeights };
export { componentSpacing, layoutSpacing };

// Export types
export type { Colors } from './colors';
export type { Typography } from './typography';
export type { Spacing } from './spacing';
