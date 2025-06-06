/**
 * ReScroll Design System - Colors and Responsive Sizing
 * A comprehensive design system for consistent styling across the app
 * Featuring an intellectual minimalist sci-fi aesthetic with grayscale and neon blue accents
 */

// Greyscale foundation
const greyScale = {
  background: '#F5F5F7',
  surface: '#E8E8EC',
  element: '#D1D1D6',
  textSecondary: '#8E8E93',
  textPrimary: '#636366',
  deepGrey: '#3A3A3C',
};

// Dark theme greyscale
const darkGreyScale = {
  background: '#121212',
  surface: '#1E1E1E',
  element: '#2A2A2A',
  textSecondary: '#A0A0A0',
  textPrimary: '#E0E0E0',
  deepGrey: '#666666',
};

// Accent colors
const accent = {
  neonBlue: '#0A84FF',
  subtleBlue: '#5E9ED6',
  glowBlue: 'rgba(10, 132, 255, 0.15)',
};

// Dark theme accent colors (slightly brighter for better contrast)
const darkAccent = {
  neonBlue: '#2196F3',
  subtleBlue: '#64B5F6',
  glowBlue: 'rgba(33, 150, 243, 0.25)',
};

// Supporting colors
const supporting = {
  white: '#FFFFFF',
  black: '#000000',
};

// Spacing system (in pixels)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography sizing system
export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius system
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999, // For fully rounded elements
};

// Shadow styles for different elevations
export const Shadows = {
  sm: {
    shadowColor: greyScale.deepGrey,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: greyScale.deepGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  lg: {
    shadowColor: greyScale.deepGrey,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Dark theme shadows
export const DarkShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Glow effects for sci-fi aesthetic
export const Glows = {
  subtle: {
    shadowColor: accent.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: accent.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: accent.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Dark theme glows (slightly brighter)
export const DarkGlows = {
  subtle: {
    shadowColor: darkAccent.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: darkAccent.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: darkAccent.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const Colors = {
  light: {
    // Text colors
    text: greyScale.textPrimary,
    textSecondary: greyScale.textSecondary,
    textTertiary: greyScale.element,
    textInverse: supporting.white,
    
    // Background colors
    background: greyScale.background,
    backgroundSecondary: greyScale.surface,
    backgroundTertiary: greyScale.element,
    
    // Brand colors
    primary: accent.neonBlue,
    primaryLight: accent.glowBlue,
    primaryDark: accent.subtleBlue,
    secondary: accent.subtleBlue,
    secondaryLight: 'rgba(94, 158, 214, 0.15)',
    secondaryDark: '#3A80BD',
    
    // UI colors
    tint: accent.neonBlue,
    border: greyScale.element,
    icon: greyScale.textSecondary,
    tabIconDefault: greyScale.textSecondary,
    
    // Card and surface colors
    card: supporting.white,
    
    // Status colors
    error: '#FF3B30',
    errorLight: 'rgba(255, 59, 48, 0.15)',
    warning: '#FF9500',
    success: '#34C759',
    info: '#5AC8FA',
    
    // Gray variations
    mediumGray: greyScale.textSecondary,
    lightGray: greyScale.element,
  },
  dark: {
    // Text colors
    text: darkGreyScale.textPrimary,
    textSecondary: darkGreyScale.textSecondary,
    textTertiary: darkGreyScale.element,
    textInverse: supporting.black,
    
    // Background colors
    background: darkGreyScale.background,
    backgroundSecondary: darkGreyScale.surface,
    backgroundTertiary: darkGreyScale.element,
    
    // Brand colors
    primary: darkAccent.neonBlue,
    primaryLight: darkAccent.glowBlue,
    primaryDark: darkAccent.subtleBlue,
    secondary: darkAccent.subtleBlue,
    secondaryLight: 'rgba(100, 181, 246, 0.25)',
    secondaryDark: '#1976D2',
    
    // UI colors
    tint: darkAccent.neonBlue,
    border: darkGreyScale.element,
    icon: darkGreyScale.textSecondary,
    tabIconDefault: darkGreyScale.textSecondary,
    
    // Card and surface colors
    card: darkGreyScale.surface,
    
    // Status colors
    error: '#FF453A',
    errorLight: 'rgba(255, 69, 58, 0.25)',
    warning: '#FF9F0A',
    success: '#30D158',
    info: '#64D2FF',
    
    // Gray variations
    mediumGray: darkGreyScale.textSecondary,
    lightGray: darkGreyScale.element,
  }
};
