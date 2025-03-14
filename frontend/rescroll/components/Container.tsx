import React from 'react';
import { View, StyleSheet, ViewProps, Dimensions, Platform } from 'react-native';
import { Spacing } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ContainerPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ContainerWidth = 'full' | 'narrow' | 'wide';
type ContainerAlignment = 'start' | 'center' | 'end' | 'stretch';

interface ContainerProps extends ViewProps {
  padding?: ContainerPadding;
  paddingHorizontal?: ContainerPadding;
  paddingVertical?: ContainerPadding;
  width?: ContainerWidth;
  align?: ContainerAlignment;
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  row?: boolean;
  wrap?: boolean;
  backgroundColor?: string;
  safeArea?: boolean;
  flex?: number | boolean;
  gap?: ContainerPadding;
}

export function Container({
  children,
  style,
  padding = 'md',
  paddingHorizontal,
  paddingVertical,
  width = 'full',
  align = 'stretch',
  justify = 'start',
  row = false,
  wrap = false,
  backgroundColor,
  safeArea = false,
  flex,
  gap = 'none',
  ...rest
}: ContainerProps) {
  const bgColor = useThemeColor({ light: backgroundColor }, 'background');
  
  // Convert padding values to actual spacing
  const getPadding = (size: ContainerPadding) => {
    switch (size) {
      case 'none': return 0;
      case 'xs': return Spacing.xs;
      case 'sm': return Spacing.sm;
      case 'md': return Spacing.md;
      case 'lg': return Spacing.lg;
      case 'xl': return Spacing.xl;
      default: return Spacing.md;
    }
  };
  
  // Convert gap values to actual spacing
  const getGap = (size: ContainerPadding) => {
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
  
  // Convert width values to actual widths
  const getWidth = () => {
    switch (width) {
      case 'narrow': return Math.min(SCREEN_WIDTH * 0.85, 400);
      case 'wide': return Math.min(SCREEN_WIDTH * 0.95, 800);
      case 'full':
      default: return '100%';
    }
  };
  
  // Convert alignment values to flex values
  const getAlignItems = () => {
    switch (align) {
      case 'start': return 'flex-start';
      case 'center': return 'center';
      case 'end': return 'flex-end';
      case 'stretch': return 'stretch';
      default: return 'stretch';
    }
  };
  
  // Convert justify values to flex values
  const getJustifyContent = () => {
    switch (justify) {
      case 'start': return 'flex-start';
      case 'center': return 'center';
      case 'end': return 'flex-end';
      case 'space-between': return 'space-between';
      case 'space-around': return 'space-around';
      case 'space-evenly': return 'space-evenly';
      default: return 'flex-start';
    }
  };
  
  // Handle flex prop
  const flexValue = typeof flex === 'boolean' ? (flex ? 1 : undefined) : flex;
  
  return (
    <View
      style={[
        {
          backgroundColor: bgColor,
          padding: getPadding(padding),
          paddingHorizontal: paddingHorizontal ? getPadding(paddingHorizontal) : undefined,
          paddingVertical: paddingVertical ? getPadding(paddingVertical) : undefined,
          width: getWidth(),
          alignItems: getAlignItems(),
          justifyContent: getJustifyContent(),
          flexDirection: row ? 'row' : 'column',
          flexWrap: wrap ? 'wrap' : 'nowrap',
          flex: flexValue,
          gap: getGap(gap),
          ...(safeArea && Platform.OS === 'ios' ? { paddingTop: 50 } : {}),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
} 