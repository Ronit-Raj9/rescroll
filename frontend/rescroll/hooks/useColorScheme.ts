import { useTheme } from '@/contexts/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

/**
 * A custom hook that returns the current color scheme ('light' or 'dark') based on
 * the user's theme preference or system setting
 */
export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme;
}

/**
 * A custom hook that returns whether the current color scheme is dark
 */
export function useIsDarkMode() {
  const { colorScheme } = useTheme();
  return colorScheme === 'dark';
}

/**
 * A custom hook that returns the device's color scheme regardless of user preferences
 */
export function useDeviceTheme() {
  return useDeviceColorScheme();
}

// Important for default export to work correctly
export default useColorScheme;
