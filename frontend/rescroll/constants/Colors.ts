/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryColor = '#FF5A60'; // Coral accent color
const secondaryColor = '#FF7F51'; // Lighter orange for gradients

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: primaryColor,
    icon: '#687076',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    lightGray: '#F5F5F5', // For input backgrounds
    mediumGray: '#E0E0E0', // For dividers
    darkGray: '#757575', // For secondary text
    error: '#FF3B30',
    success: '#34C759',
    card: '#FFFFFF',
    border: '#E5E5E5',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: primaryColor,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    lightGray: '#2A2A2A',
    mediumGray: '#404040',
    darkGray: '#A0A0A0',
    error: '#FF453A',
    success: '#30D158',
    card: '#1D1D1D',
    border: '#333333',
  },
};
