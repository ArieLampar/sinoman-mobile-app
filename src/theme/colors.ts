export const colors = {
  brand: {
    primary: '#059669',
    primaryDark: '#047857',
    primaryLight: '#10B981',
    secondary: '#F59E0B',
    secondaryDark: '#D97706',
    secondaryLight: '#FCD34D',
  },
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  neutral: {
    black: '#000000',
    gray900: '#111827',
    gray700: '#374151',
    gray500: '#6B7280',
    gray300: '#D1D5DB',
    gray100: '#F3F4F6',
    white: '#FFFFFF',
  },
  surface: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    elevated: '#FFFFFF',
    border: '#E5E7EB',
  },
  overlay: {
    dark: 'rgba(0, 0, 0, 0.5)',
    light: 'rgba(255, 255, 255, 0.9)',
    scrim: 'rgba(0, 0, 0, 0.32)',
  },
} as const;

export type Colors = typeof colors;
