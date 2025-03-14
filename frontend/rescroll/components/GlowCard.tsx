import React from 'react';
import { StyleSheet, View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Glows } from '@/constants/Colors';

// Glow intensity types
type GlowIntensity = 'subtle' | 'medium' | 'strong' | 'none';

interface GlowCardProps {
  children: React.ReactNode;
  intensity?: GlowIntensity;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  padding?: number;
  backgroundColor?: string;
  borderColor?: string;
  disabled?: boolean;
}

export default function GlowCard({
  children,
  intensity = 'subtle',
  style,
  onPress,
  activeOpacity = 0.8,
  padding = Spacing.md,
  backgroundColor = Colors.light.card,
  borderColor = Colors.light.border,
  disabled = false,
}: GlowCardProps) {
  
  // Get appropriate glow style based on intensity
  const getGlowStyle = () => {
    switch (intensity) {
      case 'subtle':
        return Glows.subtle;
      case 'medium':
        return Glows.medium;
      case 'strong':
        return Glows.strong;
      case 'none':
      default:
        return {};
    }
  };

  // Combine all styles
  const cardStyle = [
    styles.card,
    { padding, backgroundColor, borderColor },
    getGlowStyle(),
    disabled && styles.disabledCard,
    style,
  ];

  // If onPress is provided, wrap in TouchableOpacity, otherwise use View
  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}
        disabled={disabled}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  disabledCard: {
    opacity: 0.7,
  },
}); 