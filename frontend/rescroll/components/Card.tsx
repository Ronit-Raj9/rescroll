import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows, Glows } from '@/constants/Colors';

// Card variant types
type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive' | 'glow';

// Card padding options
type CardPadding = 'none' | 'small' | 'medium' | 'large';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
  isSelected?: boolean;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  testID,
  isSelected = false,
}: CardProps) {
  
  // Get padding styles based on padding prop
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return {};
      case 'small':
        return styles.smallPadding;
      case 'medium':
        return styles.mediumPadding;
      case 'large':
        return styles.largePadding;
      default:
        return styles.mediumPadding;
    }
  };

  // Get variant styles
  const getVariantStyle = () => {
    switch (variant) {
      case 'default':
        return styles.defaultCard;
      case 'elevated':
        return styles.elevatedCard;
      case 'outlined':
        return styles.outlinedCard;
      case 'interactive':
        return styles.interactiveCard;
      case 'glow':
        return styles.glowCard;
      default:
        return styles.defaultCard;
    }
  };

  // Get selected styles if applicable
  const getSelectedStyle = () => {
    if (!isSelected) return {};
    
    switch (variant) {
      case 'default':
      case 'elevated':
        return styles.selectedElevatedCard;
      case 'outlined':
        return styles.selectedOutlinedCard;
      case 'interactive':
        return styles.selectedInteractiveCard;
      case 'glow':
        return styles.selectedGlowCard;
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        styles.card,
        getPaddingStyle(),
        getVariantStyle(),
        getSelectedStyle(),
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.card,
    overflow: 'hidden',
  },
  
  // Padding styles
  smallPadding: {
    padding: Spacing.sm,
  },
  mediumPadding: {
    padding: Spacing.md,
  },
  largePadding: {
    padding: Spacing.lg,
  },
  
  // Variant styles
  defaultCard: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  
  elevatedCard: {
    backgroundColor: Colors.light.card,
    ...Shadows.md,
    borderWidth: 0,
  },
  
  outlinedCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  
  interactiveCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  
  glowCard: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Glows.subtle,
  },
  
  // Selected state styles
  selectedElevatedCard: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    ...Shadows.md,
  },
  
  selectedOutlinedCard: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  
  selectedInteractiveCard: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  
  selectedGlowCard: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    ...Glows.medium,
  },
}); 