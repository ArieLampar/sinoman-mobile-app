import { MD3LightTheme, MD3Theme } from 'react-native-paper';

// Brand colors from PRD
const brandColors = {
  primary: '#059669', // Primary Green
  primaryDark: '#047857',
  primaryLight: '#10B981',
  secondary: '#F59E0B', // Amber
  secondaryDark: '#D97706',
  secondaryLight: '#FCD34D',
};

// Semantic colors from PRD
const semanticColors = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const theme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.primary,
    primaryContainer: brandColors.primaryLight,
    secondary: brandColors.secondary,
    secondaryContainer: brandColors.secondaryLight,
    error: semanticColors.error,
    // Additional color customizations will be added in Design System phase
  },
};

// Export colors for use in StyleSheet
export const colors = {
  ...brandColors,
  ...semanticColors,
};

// Full design system (typography, spacing) will be added in next phase