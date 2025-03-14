import { useColorScheme as useNativeColorScheme } from 'react-native';

// Simple hook that always returns 'light' mode
export function useColorScheme() {
  // Always return 'light' as we're removing the dark mode feature
  return 'light';
}
