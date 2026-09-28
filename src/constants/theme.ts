import { Platform } from 'react-native';

export interface ThemePalette {
  background: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSubtle: string;
  primaryCta: string;
  primaryCtaText: string;
  primaryCtaHover: string;
  secondaryCta: string;
  secondaryCtaText: string;
  secondaryCtaBorder: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  inputBg: string;
  inputBorder: string;
  overlay: string;
  cardShadow: string;
  statusBar: 'dark' | 'light';
  statusBarStyle: 'dark-content' | 'light-content';
  statusBarBg: string;
}

/**
 * Strict, high-contrast color tokens for Lightweight PDF Scanner
 * Designed with a clean, utility-first slate palette.
 */
export const Palette: { light: ThemePalette; dark: ThemePalette } = {
  light: {
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF', // Pure White
    surfaceSecondary: '#F1F5F9', // Slate 100
    border: '#E2E8F0', // Slate 200
    borderSubtle: '#F1F5F9', // Slate 100
    textPrimary: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    textMuted: '#94A3B8', // Slate 400
    accent: '#0284C7', // Sky 600
    accentSubtle: '#E0F2FE', // Sky 100
    primaryCta: '#0F172A', // Slate 900
    primaryCtaText: '#FFFFFF',
    primaryCtaHover: '#1E293B',
    secondaryCta: '#F1F5F9',
    secondaryCtaText: '#0F172A',
    secondaryCtaBorder: '#E2E8F0',
    success: '#059669', // Emerald 600
    successBg: '#ECFDF5', // Emerald 50
    danger: '#DC2626', // Red 600
    dangerBg: '#FEF2F2', // Red 50
    dangerBorder: '#FECACA', // Red 200
    inputBg: '#FFFFFF',
    inputBorder: '#CBD5E1',
    overlay: 'rgba(15, 23, 42, 0.5)',
    cardShadow: 'rgba(15, 23, 42, 0.05)',
    statusBar: 'dark',
    statusBarStyle: 'dark-content',
    statusBarBg: '#F8FAFC',
  },
  dark: {
    background: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    surfaceSecondary: '#141E30', // Deep Slate
    border: '#334155', // Slate 700
    borderSubtle: '#1E293B', // Slate 800
    textPrimary: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    textMuted: '#64748B', // Slate 500
    accent: '#38BDF8', // Sky 400
    accentSubtle: 'rgba(56, 189, 248, 0.12)',
    primaryCta: '#38BDF8', // Sky 400
    primaryCtaText: '#0F172A',
    primaryCtaHover: '#7DD3FC',
    secondaryCta: '#1E293B',
    secondaryCtaText: '#F8FAFC',
    secondaryCtaBorder: '#334155',
    success: '#34D399', // Emerald 400
    successBg: 'rgba(52, 211, 153, 0.12)',
    danger: '#EF4444', // Red 500
    dangerBg: 'rgba(239, 68, 68, 0.12)',
    dangerBorder: 'rgba(239, 68, 68, 0.25)',
    inputBg: '#0F172A',
    inputBorder: '#334155',
    overlay: 'rgba(0, 0, 0, 0.75)',
    cardShadow: 'rgba(0, 0, 0, 0.25)',
    statusBar: 'light',
    statusBarStyle: 'light-content',
    statusBarBg: '#0F172A',
  },
};

export type ThemeType = 'light' | 'dark';

/**
 * Backward compatibility colors object for boilerplate expo components
 */
export const Colors = {
  light: {
    text: Palette.light.textPrimary,
    background: Palette.light.background,
    backgroundElement: Palette.light.surfaceSecondary,
    backgroundSelected: Palette.light.border,
    textSecondary: Palette.light.textSecondary,
  },
  dark: {
    text: Palette.dark.textPrimary,
    background: Palette.dark.background,
    backgroundElement: Palette.dark.surface,
    backgroundSelected: Palette.dark.border,
    textSecondary: Palette.dark.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
};

/**
 * Strict 8pt spatial grid tokens + backward compatibility aliases
 */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const Radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
