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
  const [mounted, setMounted] = useState(false);

  // First useEffect to mark component as mounted after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Second useEffect to handle the navigation, but only after mounted
  useEffect(() => {
    // Don't run navigation logic until component is mounted
    if (!mounted) return;
    
    const inAuthGroup = segments[0] === '(tabs)';
    
    // For testing purposes - we'll only navigate if the user is in the auth group and not authenticated
    if (bypassAuth) {
      // If auth is bypassed, don't attempt any navigation redirects
      return;
    }
    
    const handleNavigation = () => {
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
    };

    // Use a short timeout to ensure the layout is fully mounted
    const timer = setTimeout(handleNavigation, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isFirstTime, bypassAuth, segments, router, mounted]);
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // In a real app, these would come from an authentication system and local storage
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(true);
  
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
          
          {/* Removing all profile-related screens */}
          
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
