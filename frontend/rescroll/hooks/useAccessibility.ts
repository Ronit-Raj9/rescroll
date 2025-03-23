import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Hook to handle accessibility features like screen reader and font scaling
 */
export function useAccessibility() {
  // Track if screen reader is enabled
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState<boolean>(false);
  
  // Track preferred font scale from system settings
  const [fontScale, setFontScale] = useState<number>(1);

  // Function to announce messages to screen reader
  const announceToScreenReader = useCallback((message: string): void => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [isScreenReaderEnabled]);

  // Scale font size based on system settings and additional scaling
  const getAccessibleFontSize = useCallback((baseFontSize: number, additionalScale: number = 1): number => {
    return baseFontSize * fontScale * additionalScale;
  }, [fontScale]);

  // Get appropriate label for accessibility based on the platform
  const getAccessibilityLabel = useCallback((label: string): string => {
    // Different platforms might have different ways of expressing certain UI elements
    // This is a simple implementation; you might want to extend it based on your needs
    return Platform.OS === 'ios' ? label : label; 
  }, []);

  // Initialize and set up listeners
  useEffect(() => {
    // Check if screen reader is enabled
    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(enabled);
    };

    // Get font scale from system settings
    const checkFontScale = async () => {
      try {
        // This is safer way to check font scale - some APIs might not be available on all platforms
        if (Platform.OS === 'ios') {
          // On iOS, we can use a hardcoded value or default value
          setFontScale(1.0);
        } else {
          // On Android, try to get the system font scale
          setFontScale(1.0); // Default to 1.0
          
          // Future implementation can use native modules to get the actual font scale
          // if needed for your specific application requirements
        }
      } catch (error) {
        console.warn('Error getting font scale', error);
        setFontScale(1.0); // Default fallback
      }
    };

    // Initial checks
    checkScreenReader();
    checkFontScale();

    // Set up screen reader change listener
    const screenReaderChangedListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled) => {
        setIsScreenReaderEnabled(isEnabled);
      }
    );

    // Clean up listeners on unmount
    return () => {
      screenReaderChangedListener.remove();
    };
  }, []);

  return {
    isScreenReaderEnabled,
    fontScale,
    announceToScreenReader,
    getAccessibleFontSize,
    getAccessibilityLabel,
  };
} 