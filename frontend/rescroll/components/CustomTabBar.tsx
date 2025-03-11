import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { IconSymbol } from './ui/IconSymbol';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// Type for our iconName
type IconName = "house.fill" | "magnifyingglass" | "bookmark.fill" | "star.fill" | "safari" | "bell" | "person.circle" | "arrow.right" | "heart" | "bookmark" | "square.and.arrow.up" | "doc.text";

// Custom tab bar component that only renders visible tabs
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  
  // Get screen width to calculate tab sizes
  const screenWidth = Dimensions.get('window').width;
  
  // We need to get the actual visible routes (routes that don't have tabBarButton: () => null)
  const visibleRoutes = state.routes.filter(route => {
    const { options } = descriptors[route.key];
    // Only show tabs that don't have a custom tabBarButton
    return descriptors[route.key] && !options.tabBarButton;
  });
  
  const tabWidth = screenWidth / visibleRoutes.length;
  
  console.log(`CustomTabBar rendering ${visibleRoutes.length} tabs, each with width ${tabWidth}px`);
  console.log('Visible routes:', visibleRoutes.map(r => r.name));
  
  return (
    <View style={[
      styles.tabBar, 
      { 
        backgroundColor: colors.background,
        borderTopColor: '#EFEFEF'
      }
    ]}>
      {visibleRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        
        const isFocused = state.index === index;
        
        // Get icon for this tab
        let iconName: IconName = 'house.fill'; // Default
        switch (route.name) {
          case 'index':
            iconName = 'house.fill';
            break;
          case 'search':
            iconName = 'magnifyingglass';
            break;
          case 'tops':
            iconName = 'star.fill';
            break;
          case 'library':
            iconName = 'bookmark.fill';
            break;
          case 'explore':
            iconName = 'safari';
            break;
        }
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={[styles.tabItem, { width: tabWidth }]}
          >
            <IconSymbol 
              name={iconName} 
              size={26} 
              color={isFocused ? colors.tint : colors.tabIconDefault} 
            />
            <ThemedText 
              style={[
                styles.tabLabel, 
                { color: isFocused ? colors.tint : colors.tabIconDefault }
              ]}
            >
              {typeof label === 'string' ? label : ''}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 60,
    paddingTop: 8,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 8,
  },
}); 