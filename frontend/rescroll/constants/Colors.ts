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

// Accent colors
const accent = {
  neonBlue: '#0A84FF',
  subtleBlue: '#5E9ED6',
  glowBlue: 'rgba(10, 132, 255, 0.15)',
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
    icon: greyScale.textSecondary,
    tabIconDefault: greyScale.textSecondary,
    tabIconSelected: accent.neonBlue,
    
    // Feedback colors
    success: '#34C759',
    successLight: 'rgba(52, 199, 89, 0.15)',
    warning: '#FF9500',
    warningLight: 'rgba(255, 149, 0, 0.15)',
    error: '#FF3B30',
    errorLight: 'rgba(255, 59, 48, 0.15)',
    info: accent.neonBlue,
    infoLight: accent.glowBlue,
    
    // Neutral colors
    lightGray: greyScale.element,
    mediumGray: greyScale.textSecondary,
    darkGray: greyScale.textPrimary,
    
    // Border colors
    border: greyScale.element,
    borderFocus: accent.neonBlue,
    
    // Card and surface colors
    card: supporting.white,
    cardHover: greyScale.surface,
    surface: supporting.white,
    surfaceHover: greyScale.surface,
  },
  // Dark mode will be implemented later
  get dark() {
    return this.light;
  }
};
