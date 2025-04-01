import React from 'react';
import { View, ViewProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

// Define spacing constants
const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

export type ContainerPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ContainerProps extends ViewProps {
  padding?: ContainerPadding;
  paddingHorizontal?: ContainerPadding;
  paddingVertical?: ContainerPadding;
  backgroundColor?: string;
}

export default function Container({
  style,
  padding = 'none',
  paddingHorizontal = 'none',
  paddingVertical = 'none',
  backgroundColor,
  ...rest
}: ContainerProps) {
  const { colorScheme } = useTheme();
  const bgColor = backgroundColor || (colorScheme === 'dark' ? Colors.dark.background : Colors.light.background);
  
  // Convert padding values to actual spacing
  const getPadding = (size: ContainerPadding) => {
    switch (size) {
      case 'none': return 0;
      case 'xs': return Spacing.xs;
      case 'sm': return Spacing.sm;
      case 'md': return Spacing.md;
      case 'lg': return Spacing.lg;
      case 'xl': return Spacing.xl;
      default: return 0;
    }
  };
  
  // Get the margin values
  const getMargin = (size: ContainerPadding) => {
    switch (size) {
      case 'none': return 0;
      case 'xs': return Spacing.xs;
      case 'sm': return Spacing.sm;
      case 'md': return Spacing.md;
      case 'lg': return Spacing.lg;
      case 'xl': return Spacing.xl;
      default: return 0;
    }
  };
  
  return (
    <View
      style={[
        {
          backgroundColor: bgColor,
          padding: getPadding(padding),
          paddingHorizontal: getPadding(paddingHorizontal),
          paddingVertical: getPadding(paddingVertical),
        },
        style,
      ]}
      {...rest}
    />
  );
} 