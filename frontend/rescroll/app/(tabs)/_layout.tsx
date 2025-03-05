import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  
  return (
    <Tabs
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
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: '#EFEFEF',
          paddingTop: 8,
          height: 60,
          paddingHorizontal: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 8,
        },
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