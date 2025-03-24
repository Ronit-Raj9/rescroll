import { Tabs, useRouter, usePathname, useSegments, useNavigation } from 'expo-router';
import React, { useEffect, useRef, useContext } from 'react';
import { Platform, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import CustomTabBar from '@/components/CustomTabBar';
import { AppContext } from '../_layout';
import { Feather } from '@expo/vector-icons';
import AIIcon from '@/components/AIIcon';
import { useTheme } from '@/contexts/ThemeContext';

// Define the allowed tabs explicitly
const ALLOWED_TABS = ['index', 'search', 'tops', 'library', 'explore'];

// Use consistent blue gradient for all tab icons
const BLUE_GRADIENT: [string, string] = ['#4F8EF7', '#3b5998'];

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const currentColorScheme: 'light' | 'dark' = (colorScheme === 'dark') ? 'dark' : 'light';
  const colors = Colors[currentColorScheme];
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const navigation = useNavigation();
  const navigationStateRef = useRef<any>(null);
  const renderCountRef = useRef(0);
  const { navigateTo } = useContext(AppContext);
  
  // Track renders to detect potential issues
  renderCountRef.current += 1;
  
  // Add logging to debug color theme
  useEffect(() => {
    console.log('[TabLayout] Theme colors loaded:', colorScheme);
    console.log('[TabLayout] Navigation background color:', colors.background);
  }, [colorScheme, colors]);
  
  useEffect(() => {
    // Store and compare navigation state to detect changes
    const currentNavState = navigation.getState ? navigation.getState() : 'Not available';
    navigationStateRef.current = currentNavState;
    
    // Listen for tab navigation events
    const unsubscribe = navigation.addListener('state', (e) => {
      // Check if we're trying to navigate to a disabled tab
      const currentState = navigation.getState?.();
      if (currentState) {
        const routes = currentState.routes || [];
        for (const route of routes) {
          // Only redirect if it's a tab that should be in the bottom navigation but isn't allowed
          // Don't interfere with navigation to modal screens like profile-settings or routes that start with /
          if (route.name && 
              !ALLOWED_TABS.includes(route.name) && 
              route.name !== '(tabs)' && 
              route.name !== 'profile-settings' && 
              route.name !== 'design-demo' &&
              !route.name.startsWith('/')) {
            // Use setTimeout to avoid navigation race conditions
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 0);
            break;
          }
        }
      }
    });
    
    return () => {
      // Clean up the listener when the component unmounts
      unsubscribe();
    };
  }, [navigation, pathname, router, segments]);
  
  return (
    <Tabs
      // Use our custom tab bar instead of the default one
      tabBar={props => <CustomTabBar {...props} colorScheme={currentColorScheme} />}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.icon,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 65, // Modified height for better proportion
        },
        headerTitleStyle: {
          fontWeight: '600',
          textAlign: 'center',
          color: colors.text,
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerShadowVisible: false,
        headerTitle: () => (
          <ThemedText style={styles.headerTitle}>ReScroll</ThemedText>
        ),
      }}>
      {/* Only include the explicitly allowed tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AIIcon 
              family="Ionicons" 
              name="home" 
              size={24} 
              color={color} 
              focused={focused} 
              gradientColors={BLUE_GRADIENT}
            />
          ),
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigateTo('/design-demo')}
              >
                <Feather name="layout" size={22} color={colors.icon} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigateTo('/profile-settings')}
              >
                <Feather name="user" size={22} color={colors.icon} />
              </TouchableOpacity>
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <AIIcon 
              family="Ionicons" 
              name="search" 
              size={22} 
              color={color} 
              focused={focused} 
              gradientColors={BLUE_GRADIENT}
            />
          ),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="tops"
        options={{
          title: 'Top Papers',
          tabBarIcon: ({ color, focused }) => (
            <AIIcon 
              family="FontAwesome5" 
              name="file-alt" 
              size={22} 
              color={color} 
              focused={focused} 
              gradientColors={BLUE_GRADIENT}
            />
          ),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color, focused }) => (
            <AIIcon 
              family="Ionicons" 
              name="bookmark" 
              size={22} 
              color={color} 
              focused={focused} 
              gradientColors={BLUE_GRADIENT}
            />
          ),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <AIIcon 
              family="Ionicons" 
              name="compass" 
              size={24} 
              color={color} 
              focused={focused} 
              gradientColors={BLUE_GRADIENT}
            />
          ),
          headerShown: true,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
  iconButton: {
    marginLeft: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: Colors.light.text,
  }
});