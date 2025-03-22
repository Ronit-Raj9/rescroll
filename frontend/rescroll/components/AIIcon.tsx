import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolateColor, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';

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
 */
export default function AIIcon({
  family,
  name,
  size,
  color = Colors.light.text,
  focused = false,
  style,
  gradientColors = ['#5E72EB', '#FF9190'],
  glowColor = 'rgba(94, 114, 235, 0.3)',
  animated = true,
}: AIIconProps) {
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

  // Animated style for the icon container
  const animatedStyle = useAnimatedStyle(() => {
    // FIXED: Using interpolate instead of interpolateColor for scale values
    const scale = interpolate(
      animatedValue.value,
      [0, 1],
      [1, 1.1]
    );
    
    return {
      transform: [{ scale }],
    };
  });

  // Render the appropriate icon based on the family
  const renderIcon = () => {
    switch (family) {
      case 'Ionicons':
        return <Ionicons name={name as any} size={size} color={color} />;
      case 'Feather':
        return <Feather name={name as any} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={name as any} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={name as any} size={size} color={color} />;
      default:
        return <Ionicons name="help-circle" size={size} color={color} />;
    }
  };

  // If the icon is focused, wrap it in a gradient and add a glow effect
  if (focused) {
    return (
      <Animated.View style={[styles.focusedContainer, animatedStyle, style]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}>
          {renderIcon()}
        </LinearGradient>
        <View style={[styles.glow, { backgroundColor: glowColor }]} />
      </Animated.View>
    );
  }

  // If not focused, just render the icon
  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {renderIcon()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradient: {
    borderRadius: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 16,
    opacity: 0.6,
    zIndex: -1,
  },
}); 