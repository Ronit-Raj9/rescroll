import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate, interpolateColor } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

type IconFamily = 'Ionicons' | 'Feather' | 'MaterialCommunityIcons' | 'FontAwesome5' | 'MaterialIcons';

interface AIIconProps {
  family: IconFamily;
  name: string;
  size: number;
  color?: string;
  focused?: boolean;
  style?: ViewStyle;
  gradientColors?: [string, string];
  glowColor?: string;
  animated?: boolean;
}

/**
 * AI-inspired Icon component that adds modern effects to vector icons
 * Updated for higher contrast and better visibility
 */
export default function AIIcon({
  family,
  name,
  size,
  color,
  focused = false,
  style,
  gradientColors = ['#5E72EB', '#FF9190'],
  glowColor = 'rgba(94, 114, 235, 0.5)', // Increased opacity for more vibrant glow
  animated = true,
}: AIIconProps) {
  const { colorScheme } = useTheme();
  const defaultColor = color || Colors[colorScheme === 'dark' ? 'dark' : 'light'].text;

  // Animation value for focus effect
  const animatedValue = useSharedValue(focused ? 1 : 0);

  // Animate when focus changes
  useFocusEffect(
    React.useCallback(() => {
      if (animated) {
        animatedValue.value = withSpring(focused ? 1 : 0, {
          damping: 15,
          stiffness: 120,
        });
      }
      return () => {};
    }, [focused, animated])
  );

  // Animation styles for the container
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animatedValue.value,
      [0, 1],
      [1, 1.1], // Slightly increased scale for more emphasis
    );

    return {
      transform: [{ scale }],
    };
  });

  // Animation styles for the icon - no longer interpolating color
  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {};
  });

  // Render the appropriate icon based on the family
  const renderIcon = () => {
    const iconStyle = [styles.icon, iconAnimatedStyle];
    const iconSize = focused ? size * 1.05 : size; // Slightly larger when focused
    const iconColor = focused ? Colors[colorScheme === 'dark' ? 'dark' : 'light'].primary : defaultColor;

    switch (family) {
      case 'Ionicons':
        return <Animated.Text style={iconStyle}><Ionicons name={name as any} size={iconSize} color={iconColor} /></Animated.Text>;
      case 'Feather':
        return <Animated.Text style={iconStyle}><Feather name={name as any} size={iconSize} color={iconColor} /></Animated.Text>;
      case 'MaterialCommunityIcons':
        return <Animated.Text style={iconStyle}><MaterialCommunityIcons name={name as any} size={iconSize} color={iconColor} /></Animated.Text>;
      case 'FontAwesome5':
        return <Animated.Text style={iconStyle}><FontAwesome5 name={name as any} size={iconSize} color={iconColor} /></Animated.Text>;
      case 'MaterialIcons':
        return <Animated.Text style={iconStyle}><MaterialIcons name={name as any} size={iconSize} color={iconColor} /></Animated.Text>;
      default:
        return <Animated.Text style={iconStyle}><Ionicons name={name as any} size={iconSize} color={iconColor} /></Animated.Text>;
    }
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle, style]}>
      {renderIcon()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    width: '150%', // Slightly smaller for more compact tab bar
    height: '150%', // Slightly smaller for more compact tab bar
    borderRadius: 16,
    opacity: 0.9, // Increased opacity for better visibility
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8, // Slightly reduced shadow
    shadowOpacity: 0.5,
  },
  icon: {
    zIndex: 10,
  },
}); 