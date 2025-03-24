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
          tabBarIcon: ({ color, focused }) => (
            <AIIcon 
              family="Ionicons" 
              name="home" 
              size={26} 
              color={color} 
              focused={focused} 
              gradientColors={['#4F8EF7', '#3b5998']}
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
              size={24} 
              color={color} 
              focused={focused} 
              gradientColors={['#FF9190', '#FF6A88']}
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
              size={24} 
              color={color} 
              focused={focused} 
              gradientColors={['#43E97B', '#38F9D7']}
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
              size={24} 
              color={color} 
              focused={focused} 
              gradientColors={['#A155FB', '#F59E0B']}
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
              size={26} 
              color={color} 
              focused={focused} 
              gradientColors={['#FA709A', '#FEE140']}
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