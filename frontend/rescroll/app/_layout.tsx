import 'react-native-gesture-handler';
import { useEffect, useState, createContext, useMemo } from 'react';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Prevent warning logs for the demo
LogBox.ignoreLogs(['Warning: ...']);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Define the type for the app context
type AppContextType = {
  navigateTo: (route: string) => void;
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: (count: number) => void;
};

// Create the context with a default value
export const AppContext = createContext<AppContextType>({
  navigateTo: () => {},
  unreadNotificationsCount: 0,
  setUnreadNotificationsCount: () => {},
});

export default function RootLayout() {
  const router = useRouter();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3); // Start with some mock notifications
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Improved navigation function with better error handling
  const navigateTo = (route: string) => {
    try {
      // Make sure the route is properly formatted
      const formattedRoute = route.startsWith('/') ? route : `/${route}`;
      router.push(formattedRoute as any);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    navigateTo,
    unreadNotificationsCount,
    setUnreadNotificationsCount,
  }), [unreadNotificationsCount]);

  useEffect(() => {
    if (loaded) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync().catch(error => {
        console.warn("Could not hide splash screen:", error);
      });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContext.Provider value={contextValue}>
          <NavigationThemeProvider value={DefaultTheme}>
            <Stack screenOptions={{ 
              headerShown: false,
              animation: 'slide_from_right',
            }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="paper-details" options={{ headerShown: false }} />
              <Stack.Screen 
                name="profile-settings" 
                options={{ 
                  headerShown: true,
                  title: "Profile Settings",
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }} 
              />
              <Stack.Screen 
                name="notifications" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="design-demo" 
                options={{ 
                  headerShown: true,
                  title: "Design System",
                  animation: 'slide_from_right',
                }} 
              />
            </Stack>
          </NavigationThemeProvider>
        </AppContext.Provider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
