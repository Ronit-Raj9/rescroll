import 'react-native-gesture-handler';
import { useEffect, useState, createContext, useMemo } from 'react';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

// Prevent warning logs for the demo
LogBox.ignoreLogs(['Warning: ...']);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Add this line to suppress these specific warnings
// This should be placed before the component definition
LogBox.ignoreLogs([
  'findDOMNode is deprecated in StrictMode',
  'Warning: findDOMNode is deprecated in StrictMode',
  'Warning: findDOMNode',
]);

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

// Add this function to handle base64 decoding in React Native
const safeBase64Decode = (str: string): string => {
  try {
    // For React Native environment
    return decodeURIComponent(
      Array.prototype.map
        .call(
          atob(str.replace(/-/g, '+').replace(/_/g, '/')), 
          (c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`
        )
        .join('')
    );
  } catch (e) {
    console.error('Error decoding base64:', e);
    return '';
  }
};

function RootLayoutNav() {
  const router = useRouter();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  const { user, isLoading, getAuthToken } = useAuth();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Update the token debugging code
  useEffect(() => {
    const checkTokenDebug = async () => {
      if (!isLoading) {
        try {
          const token = await getAuthToken();
          console.log('Auth token available on app load:', !!token);
          if (token) {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              // Check token expiration
              try {
                const payload = JSON.parse(safeBase64Decode(tokenParts[1]));
                const expiry = payload.exp * 1000; // Convert to milliseconds
                const now = Date.now();
                const timeLeft = expiry - now;
                console.log(`Token valid for: ${Math.floor(timeLeft / 60000)} minutes`);
              } catch (e) {
                console.log('Could not parse token payload');
              }
            }
          }
        } catch (e) {
          console.error('Error checking token:', e);
        }
      }
    };
    
    checkTokenDebug();
  }, [isLoading, getAuthToken]);

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

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (router.pathname === '/auth/login' || router.pathname === '/auth/signup') {
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading]);

  if (!loaded || isLoading) {
    return <LoadingScreen />;
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
              <Stack.Screen 
                name="auth" 
                options={{ 
                  headerShown: false,
                  animation: 'fade',
                }} 
              />
            </Stack>
          </NavigationThemeProvider>
        </AppContext.Provider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
