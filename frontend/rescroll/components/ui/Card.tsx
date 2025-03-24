import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewProps, TouchableOpacity, Platform, DimensionValue } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/Colors';

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  padding?: boolean | number;
  radius?: number;
  width?: DimensionValue;
  height?: DimensionValue;
  backgroundColor?: string;
  borderColor?: string;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  variant = 'elevated',
  onPress,
  padding = true,
  radius,
  width,
  height,
  backgroundColor,
  borderColor,
  elevation = 'md',
  style,
  ...rest
}: CardProps) {
  const colors = Colors.light;
  
  // Determine card styling based on variant
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: backgroundColor || colors.card,
          borderColor: 'transparent',
          ...getShadow(),
        };
      case 'outlined':
        return {
          backgroundColor: backgroundColor || colors.card,
          borderColor: borderColor || colors.border,
          borderWidth: 1,
        };
      case 'filled':
        return {
          backgroundColor: backgroundColor || colors.backgroundSecondary,
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: backgroundColor || colors.card,
          borderColor: 'transparent',
          ...getShadow(),
        };
    }
  };
  
  // Get shadow based on elevation
  const getShadow = () => {
    if (elevation === 'none') return {};
    
    return Shadows[elevation];
  };
  
  // Determine padding value
  const getPadding = () => {
    if (padding === false) return 0;
    if (typeof padding === 'number') return padding;
    return Spacing.md;
  };
  
  const cardStyle = getCardStyle();
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component
      style={[
        styles.card,
        {
          ...cardStyle,
          padding: getPadding(),
          borderRadius: radius !== undefined ? radius : BorderRadius.md,
          width,
          height,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      {...rest}
    >
      {children}
    </Component>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
}); 