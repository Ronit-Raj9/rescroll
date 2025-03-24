import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

// Reference sizes based on iPhone 13 (390 x 844)
const REFERENCE_WIDTH = 390;
const REFERENCE_HEIGHT = 844;

/**
 * Screen size breakpoints
 */
export const BREAKPOINTS = {
  SMALL: 375, // iPhone SE, small phones
  MEDIUM: 414, // iPhone Plus, standard phones
  LARGE: 768, // Tablets
  XLARGE: 1024, // Large tablets, small laptops
};

/**
 * Hook to get responsive sizes based on screen dimensions
 */
export function useResponsiveSize() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const widthRatio = width / REFERENCE_WIDTH;
    const heightRatio = height / REFERENCE_HEIGHT;

    // Calculate appropriate size based on device width
    const deviceSize = 
      width < BREAKPOINTS.SMALL 
        ? 'small' 
        : width < BREAKPOINTS.MEDIUM 
          ? 'medium' 
          : width < BREAKPOINTS.LARGE 
            ? 'large' 
            : 'xlarge';
    
    /**
     * Scale a value proportionally to screen width
     */
    const scaleWidth = (size: number): number => {
      return Math.round(size * widthRatio);
    };

    /**
     * Scale a value proportionally to screen height
     */
    const scaleHeight = (size: number): number => {
      return Math.round(size * heightRatio);
    };

    /**
     * Scale a value proportionally to the smaller of screen dimensions
     * Good for consistent component sizing
     */
    const scaleSize = (size: number): number => {
      return Math.round(size * Math.min(widthRatio, heightRatio));
    };

    /**
     * Return different values based on screen size
     */
    const selectBySize = <T>(options: {
      small?: T;
      medium?: T;
      large?: T;
      xlarge?: T;
      default: T;
    }): T => {
      if (deviceSize === 'small' && options.small !== undefined) {
        return options.small;
      }
      if (deviceSize === 'medium' && options.medium !== undefined) {
        return options.medium;
      }
      if (deviceSize === 'large' && options.large !== undefined) {
        return options.large;
      }
      if (deviceSize === 'xlarge' && options.xlarge !== undefined) {
        return options.xlarge;
      }
      return options.default;
    };

    return {
      width,
      height, 
      widthRatio,
      heightRatio,
      deviceSize,
      scaleWidth,
      scaleHeight,
      scaleSize,
      selectBySize,
      isSmallDevice: width < BREAKPOINTS.SMALL,
      isMediumDevice: width >= BREAKPOINTS.SMALL && width < BREAKPOINTS.MEDIUM,
      isLargeDevice: width >= BREAKPOINTS.MEDIUM && width < BREAKPOINTS.LARGE,
      isXLargeDevice: width >= BREAKPOINTS.LARGE,
    };
  }, [width, height]);
} 