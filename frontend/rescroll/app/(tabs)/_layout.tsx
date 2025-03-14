import { Tabs, useRouter, usePathname, useSegments, useNavigation } from 'expo-router';
import React, { useEffect, useRef, useContext } from 'react';
import { Platform, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import CustomTabBar from '@/components/CustomTabBar';
import { AppContext } from '../_layout';
import { Feather } from '@expo/vector-icons';

// Define the allowed tabs explicitly
const ALLOWED_TABS = ['index', 'search', 'tops', 'library', 'explore'];

export default function TabLayout() {
  const colors = Colors.light;
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const navigation = useNavigation();
  const navigationStateRef = useRef<any>(null);
  const renderCountRef = useRef(0);
  const { navigateTo } = useContext(AppContext);
  
  // Track renders to detect potential issues
  renderCountRef.current += 1;
  
  useEffect(() => {
    console.log('========== DIAGNOSTIC LOGS: TAB LAYOUT ==========');
    console.log('Tab Layout Rendered', renderCountRef.current);
    console.log('Current pathname:', pathname);
    console.log('Current segments:', segments);
    
    // Store and compare navigation state to detect changes
    const currentNavState = navigation.getState ? navigation.getState() : 'Not available';
    console.log('Previous nav state:', navigationStateRef.current);
    console.log('Current nav state:', currentNavState);
    navigationStateRef.current = currentNavState;
    
    // Track route existence in a more reliable way
    console.log('Available routes in (tabs) folder:');
    // Only track the allowed tabs
    ALLOWED_TABS.forEach(route => {
      try {
        console.log(`Route "${route}" is defined:`, !!router);
        // Fix the type issue by using a simple string check instead of includes
        const isCurrentlyAccessible = pathname?.indexOf(route) !== -1;
        console.log(`Route "${route}" is currently accessible:`, isCurrentlyAccessible);
      } catch (e: any) {
        console.log(`Route "${route}" error:`, e.message);
      }
    });
    
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
            console.warn(`Attempted to navigate to disallowed tab: ${route.name}`);
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
      console.log('Tab Layout cleanup');
      unsubscribe();
    };
  }, [pathname, segments, navigation, router]);
  
  return (
    <Tabs
      // Use our custom tab bar instead of the default one
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.icon,
        headerTitleStyle: {
          fontWeight: '600',
          textAlign: 'center',
          color: colors.text,
        },
        headerStyle: {
          backgroundColor: colors.card,
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
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={26} color={color} />,
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
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Feather name="search" size={24} color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="tops"
        options={{
          title: 'Top Papers',
          tabBarIcon: ({ color }) => <IconSymbol name="star.fill" size={26} color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color }) => <IconSymbol name="bookmark.fill" size={26} color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Feather name="compass" size={24} color={color} />,
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