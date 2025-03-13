import { Tabs, useRouter, usePathname, useSegments, useNavigation } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Platform, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { CustomTabBar } from '@/components/CustomTabBar';

export default function TabLayout() {
  const colors = Colors.light;
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const navigation = useNavigation();
  const navigationStateRef = useRef<any>(null);
  const renderCountRef = useRef(0);
  
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
    const routes = ['index', 'search', 'tops', 'library', 'explore'];
    routes.forEach(route => {
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
      console.log('Tab navigation state changed:', e.data);
    });
    
    return () => {
      console.log('Tab Layout cleanup');
      unsubscribe();
    };
  }, [pathname, segments, navigation]);
  
  return (
    <Tabs
      // Use our custom tab bar instead of the default one
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerTitleStyle: {
          fontWeight: '600',
          textAlign: 'center',
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTitle: () => (
          <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>ReScroll</ThemedText>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={26} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <IconSymbol name="magnifyingglass" size={26} color={color} />,
          headerShown: false,
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
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol name="safari" size={26} color={color} />,
          headerShown: false,
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
  }
});