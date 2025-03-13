import 'react-native-gesture-handler';
import { useEffect, useState, createContext, useMemo } from 'react';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Define the type for the app context
type AppContextType = {
  navigateTo: (_route: string) => void;
};

// Create the context with a default value
export const AppContext = createContext<AppContextType>({
  navigateTo: () => {},
});

export default function RootLayout() {
  const router = useRouter();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Simple navigation function
  const navigateTo = (route: string) => {
    try {
      if (route === '/profile-settings') {
        router.push(route as any);
      } else {
        router.push(route as any);
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    navigateTo,
  }), []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="paper-details" options={{ headerShown: false }} />
          <Stack.Screen 
            name="profile-settings" 
            options={{ 
              headerShown: true, 
              presentation: 'modal' 
            }} 
          />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </AppContext.Provider>
  );
}
