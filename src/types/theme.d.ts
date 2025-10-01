import type { MD3Theme } from 'react-native-paper';
import type { Colors } from '../theme/colors';
import type { Typography } from '../theme/typography';
import type { Spacing } from '../theme/spacing';

// Define custom theme properties
export interface CustomTheme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  componentSpacing: {
    buttonPadding: { horizontal: number; vertical: number };
    cardPadding: number;
    screenPadding: number;
    sectionGap: number;
    itemGap: number;
    iconMargin: number;
  };
  layoutSpacing: {
    headerHeight: number;
    bottomTabHeight: number;
    minTouchTarget: number;
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
      full: number;
    };
  };
  fontFamilies: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  fontWeights: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

// Extend MD3Theme with our custom properties
export interface AppTheme extends MD3Theme {
  custom: CustomTheme;
}

// Module augmentation for react-native-paper
declare module 'react-native-paper' {
  interface MD3Theme {
    custom: CustomTheme;
  }
}
