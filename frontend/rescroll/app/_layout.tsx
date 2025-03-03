import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, createContext } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a context to share authentication state across the app
export const AuthContext = createContext({
  isAuthenticated: false,
  isFirstTime: false,
  bypassAuth: false,
  setIsAuthenticated: (_value: boolean) => {},
  setIsFirstTime: (_value: boolean) => {},
  setBypassAuth: (_value: boolean) => {},
});

// Simple auth context simulation - in a real app, you would use a proper auth provider
const useProtectedRoute = (isAuthenticated: boolean, isFirstTime: boolean, bypassAuth: boolean) => {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';
    
    // Skip auth checks if bypassAuth is true
    if (bypassAuth && !inAuthGroup) {
      router.replace('/(tabs)');
      return;
    }
    
    if (!isAuthenticated && inAuthGroup && !bypassAuth) {
      // Redirect to the login page if the user is not authenticated
      router.replace('/login');
    } else if (isAuthenticated && isFirstTime && inAuthGroup) {
      // If it's the user's first time in the app, redirect to interest selection
      router.replace('/interest-selection');
    } else if (isAuthenticated && !inAuthGroup && segments[0] !== 'interest-selection') {
      // Redirect to the main app if the user is authenticated (unless they're in interest selection)
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isFirstTime, bypassAuth, segments, router]);
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // In a real app, these would come from an authentication system and local storage
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(false);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Use our protected route hook
  useProtectedRoute(isAuthenticated, isFirstTime, bypassAuth);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Create an auth context value to share across components
  const authContextValue = {
    isAuthenticated,
    isFirstTime,
    bypassAuth,
    setIsAuthenticated,
    setIsFirstTime,
    setBypassAuth
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="interest-selection" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
