import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing, Shadows, Glows } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Get screen width for animations
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Update props to include colorScheme
interface CustomTabBarProps extends BottomTabBarProps {
  colorScheme?: 'light' | 'dark';
}

export default function CustomTabBar({ 
  state, 
  descriptors, 
  navigation, 
  colorScheme = 'light' 
}: CustomTabBarProps) {
  // Get safe area insets for proper padding
  const insets = useSafeAreaInsets();
  
  // Use the colorScheme to determine theme
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Tab size calculations - indicator is smaller for a more refined look
  const TAB_WIDTH = SCREEN_WIDTH / state.routes.length;
  const INDICATOR_SIZE = TAB_WIDTH * 0.4;

  // Indicator position animation
  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(
            state.index * TAB_WIDTH + (TAB_WIDTH - INDICATOR_SIZE) / 2,
            {
              stiffness: 150,
              damping: 20,
            }
          ),
        },
      ],
    };
  });

  // Get label for tab
  const getLabel = (options: any, route: any) => {
    if (options.tabBarLabel !== undefined) {
      return options.tabBarLabel;
    } else if (options.title !== undefined) {
      return options.title;
    } else {
      return route.name.charAt(0).toUpperCase() + route.name.slice(1);
    }
  };

  return (
    <View style={[
      styles.tabBar, 
      { 
        paddingBottom: (insets.bottom || Spacing.sm) / 2, // Reduced padding
        backgroundColor: colors.background,
        borderTopColor: colors.border,
        height: 65 + (insets.bottom || 0) / 2, // Match the height in layout
      }
    ]}>
      {/* Background indicator for active tab */}
      <Animated.View
        style={[
          styles.activeTabIndicator,
          { 
            width: INDICATOR_SIZE,
            backgroundColor: colors.primary,
          },
          indicatorAnimatedStyle,
        ]}
      />
      
      {/* Tab buttons */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = getLabel(options, route);

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

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {/* Use the tabBarIcon from the options if available */}
              {options.tabBarIcon ? 
                options.tabBarIcon({ 
                  focused: isFocused, 
                  // All icons use the primary color when selected for consistency
                  color: isFocused ? colors.primary : colors.tabIconDefault,
                  size: 22 // Smaller size
                }) : null}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused
                    ? colors.primary
                    : colors.tabIconDefault,
                  opacity: isFocused ? 1 : 0.9, // Increased opacity for inactive tabs
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    position: 'relative',
    ...Shadows.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Changed to align from top
    paddingTop: Spacing.sm - 2, // Reduced top padding to lift icons
    paddingBottom: Spacing.xs,
  },
  iconContainer: {
    marginBottom: 2, // Small space between icon and text
  },
  tabLabel: {
    fontSize: 11, // Smaller font size
    fontWeight: '500',
  },
  activeTabIndicator: {
    height: 3, // Thinner indicator
    position: 'absolute',
    top: 0,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    ...Glows.subtle,
  },
}); 