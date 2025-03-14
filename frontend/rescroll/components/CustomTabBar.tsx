import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing, Shadows, Glows } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Get screen width for animations
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Get safe area insets for proper padding
  const insets = useSafeAreaInsets();
  
  // Tab size calculations
  const TAB_WIDTH = SCREEN_WIDTH / state.routes.length;
  const INDICATOR_SIZE = TAB_WIDTH * 0.5;

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
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || Spacing.sm }]}>
      {/* Background indicator for active tab */}
      <Animated.View
        style={[
          styles.activeTabIndicator,
          { width: INDICATOR_SIZE },
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
            {/* Use the tabBarIcon from the options if available */}
            {options.tabBarIcon ? 
              options.tabBarIcon({ 
                focused: isFocused, 
                color: isFocused ? Colors.light.tabIconSelected : Colors.light.tabIconDefault,
                size: 24 
              }) : null}
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused
                    ? Colors.light.tabIconSelected
                    : Colors.light.tabIconDefault,
                  opacity: isFocused ? 1 : 0.8,
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
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    position: 'relative',
    ...Shadows.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  activeTabIndicator: {
    height: 4,
    backgroundColor: Colors.light.primary,
    position: 'absolute',
    top: 0,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    ...Glows.subtle,
  },
}); 