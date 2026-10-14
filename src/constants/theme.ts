import { Platform } from 'react-native';

export interface ThemePalette {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceHover: string;
  border: string;
  borderSubtle: string;
  borderHighlight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSecondary: string;
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
  // Liquid Glass tokens
  glassBg: string;
  glassBorder: string;
  glassCardBg: string;
  glassCardBorder: string;
  glassInputBg: string;
  glassPillBg: string;
  glassPillBorder: string;
  glassOrbBg: string;
  glassOrbBorder: string;
  glassGlow: string;
  blurTint: 'dark' | 'light' | 'default';
  // Gradients
  primaryGradient: [string, string];
  primaryGradientHover: [string, string];
  secondaryGradient: [string, string];
  dangerGradient: [string, string];
  glassOrbGradient: [string, string];
}

/**
 * Modern Liquid Glass & Vibrant Gradient theme tokens for Lightweight PDF Scanner
 * Clean 8pt spatial grid, rounded-2xl (16-20px) glass surfaces, crisp contrast.
 */
export const Palette: { light: ThemePalette; dark: ThemePalette } = {
  dark: {
    background: '#0F172A', // Deep Slate
    surface: '#1E293B', // Slate 800
    surfaceSecondary: '#141E30',
    surfaceHover: '#334155',
    border: 'rgba(255, 255, 255, 0.12)',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderHighlight: 'rgba(255, 255, 255, 0.24)',
    textPrimary: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    textMuted: '#64748B', // Slate 500
    accent: '#06B6D4', // Electric Cyan
    accentSecondary: '#6366F1', // Royal Indigo
    accentSubtle: 'rgba(6, 182, 212, 0.15)',
    primaryCta: '#06B6D4',
    primaryCtaText: '#FFFFFF',
    primaryCtaHover: '#0891B2',
    secondaryCta: 'rgba(255, 255, 255, 0.08)',
    secondaryCtaText: '#F8FAFC',
    secondaryCtaBorder: 'rgba(255, 255, 255, 0.16)',
    success: '#10B981', // Emerald 500
    successBg: 'rgba(16, 185, 129, 0.14)',
    danger: '#F43F5E', // Rose 500
    dangerBg: 'rgba(244, 63, 94, 0.14)',
    dangerBorder: 'rgba(244, 63, 94, 0.3)',
    inputBg: 'rgba(15, 23, 42, 0.65)',
    inputBorder: 'rgba(255, 255, 255, 0.16)',
    overlay: 'rgba(8, 12, 22, 0.78)',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    statusBar: 'light',
    statusBarStyle: 'light-content',
    statusBarBg: '#0F172A',
    // Liquid Glass
    glassBg: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.20)',
    glassCardBg: 'rgba(30, 41, 59, 0.65)',
    glassCardBorder: 'rgba(255, 255, 255, 0.12)',
    glassInputBg: 'rgba(15, 23, 42, 0.60)',
    glassPillBg: 'rgba(255, 255, 255, 0.07)',
    glassPillBorder: 'rgba(255, 255, 255, 0.16)',
    glassOrbBg: 'rgba(255, 255, 255, 0.12)',
    glassOrbBorder: 'rgba(255, 255, 255, 0.30)',
    glassGlow: 'rgba(6, 182, 212, 0.3)',
    blurTint: 'dark',
    // Vibrant Gradients
    primaryGradient: ['#06B6D4', '#6366F1'],
    primaryGradientHover: ['#0891B2', '#4F46E5'],
    secondaryGradient: ['#14B8A6', '#10B981'],
    dangerGradient: ['#F43F5E', '#E11D48'],
    glassOrbGradient: ['#06B6D4', '#6366F1'],
  },
  light: {
    background: '#F1F5F9', // Crisp Slate 100
    surface: '#FFFFFF', // Pure White
    surfaceSecondary: '#F8FAFC',
    surfaceHover: '#E2E8F0',
    border: 'rgba(15, 23, 42, 0.08)',
    borderSubtle: 'rgba(15, 23, 42, 0.04)',
    borderHighlight: 'rgba(15, 23, 42, 0.16)',
    textPrimary: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    textMuted: '#94A3B8', // Slate 400
    accent: '#0891B2', // Electric Cyan
    accentSecondary: '#4F46E5', // Royal Indigo
    accentSubtle: 'rgba(6, 182, 212, 0.10)',
    primaryCta: '#0891B2',
    primaryCtaText: '#FFFFFF',
    primaryCtaHover: '#0E7490',
    secondaryCta: 'rgba(255, 255, 255, 0.85)',
    secondaryCtaText: '#0F172A',
    secondaryCtaBorder: 'rgba(15, 23, 42, 0.10)',
    success: '#059669', // Emerald 600
    successBg: 'rgba(16, 185, 129, 0.10)',
    danger: '#E11D48', // Rose 600
    dangerBg: 'rgba(225, 29, 72, 0.08)',
    dangerBorder: 'rgba(225, 29, 72, 0.2)',
    inputBg: 'rgba(255, 255, 255, 0.90)',
    inputBorder: 'rgba(15, 23, 42, 0.14)',
    overlay: 'rgba(15, 23, 42, 0.50)',
    cardShadow: 'rgba(15, 23, 42, 0.08)',
    statusBar: 'dark',
    statusBarStyle: 'dark-content',
    statusBarBg: '#F1F5F9',
    // Liquid Glass
    glassBg: 'rgba(255, 255, 255, 0.65)',
    glassBorder: 'rgba(255, 255, 255, 0.40)',
    glassCardBg: 'rgba(255, 255, 255, 0.82)',
    glassCardBorder: 'rgba(226, 232, 240, 0.85)',
    glassInputBg: 'rgba(255, 255, 255, 0.90)',
    glassPillBg: 'rgba(15, 23, 42, 0.04)',
    glassPillBorder: 'rgba(15, 23, 42, 0.08)',
    glassOrbBg: 'rgba(255, 255, 255, 0.75)',
    glassOrbBorder: 'rgba(255, 255, 255, 0.90)',
    glassGlow: 'rgba(99, 102, 241, 0.2)',
    blurTint: 'light',
    // Vibrant Gradients
    primaryGradient: ['#06B6D4', '#6366F1'],
    primaryGradientHover: ['#0891B2', '#4F46E5'],
    secondaryGradient: ['#14B8A6', '#10B981'],
    dangerGradient: ['#F43F5E', '#E11D48'],
    glassOrbGradient: ['#06B6D4', '#6366F1'],
  },
};

export type ThemeType = 'light' | 'dark';

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

export const Typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
};

/**
 * Strict 8pt spatial grid tokens
 */
export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

/**
 * Consistent rounded-2xl (16px - 20px) tokens for buttons and glass surfaces
 */
export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 16, // rounded-2xl standard
  xl: 20, // rounded-2xl expanded
  xxl: 24,
  full: 9999,
} as const;

export const Shadows = {
  glass: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    },
  }),
  glowCyan: Platform.select({
    ios: {
      shadowColor: '#06B6D4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
    },
    android: {
      elevation: 6,
    },
    default: {
      boxShadow: '0px 4px 16px rgba(6, 182, 212, 0.35)',
    },
  }),
  glowIndigo: Platform.select({
    ios: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
    },
    android: {
      elevation: 6,
    },
    default: {
      boxShadow: '0px 4px 16px rgba(99, 102, 241, 0.35)',
    },
  }),
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

