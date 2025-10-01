import * as Font from 'expo-font';
import { logger } from '@utils/logger';

export const fontFamilies = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
    fontFamily: fontFamilies.bold,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.25,
    fontFamily: fontFamilies.semibold,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
    fontFamily: fontFamilies.semibold,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
    letterSpacing: 0,
    fontFamily: fontFamilies.regular,
  },
  bodyBase: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
    fontFamily: fontFamilies.regular,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
    fontFamily: fontFamilies.regular,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.25,
    fontFamily: fontFamilies.regular,
  },
} as const;

export async function loadFonts() {
  try {
    await Font.loadAsync({
      'Inter-Regular': require('../../assets/fonts/Inter-Regular.ttf'),
      'Inter-Medium': require('../../assets/fonts/Inter-Medium.ttf'),
      'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.ttf'),
      'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
    });
    return true;
  } catch (error) {
    logger.warn('Failed to load Inter fonts, using system fonts');
    return false;
  }
}

export type Typography = typeof typography;
