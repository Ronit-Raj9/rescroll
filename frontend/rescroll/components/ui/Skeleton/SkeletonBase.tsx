import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

interface SkeletonBaseProps {
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const SkeletonBase: React.FC<SkeletonBaseProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  children,
}) => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const shimmerValue = useRef(new Animated.Value(0)).current;
  
  const colors = Colors[isDark ? 'dark' : 'light'];
  const baseColor = isDark ? '#333333' : '#E0E0E0';
  const highlightColor = isDark ? '#444444' : '#F5F5F5';

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    
    shimmerAnimation.start();
    
    return () => {
      shimmerAnimation.stop();
    };
  }, [shimmerValue]);

  const backgroundColor = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [baseColor, highlightColor],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
      accessibilityLabel="Loading content"
      accessibilityRole="image"
      accessible={true}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
}); 