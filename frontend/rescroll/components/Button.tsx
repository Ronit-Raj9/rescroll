import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows, Glows, FontSizes } from '@/constants/Colors';

// Button variant types
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'minimal' | 'glow';

// Button sizes
type ButtonSize = 'small' | 'medium' | 'large';

// Button props interface
interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Button component with multiple variants and sizes
export default function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon
}: ButtonProps) {

  // Get the appropriate styles based on variant, size, and state
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...(fullWidth && styles.fullWidth),
    };

    // Apply size styles
    const sizeStyles = {
      small: styles.buttonSmall,
      medium: styles.buttonMedium,
      large: styles.buttonLarge,
    };

    // Apply variant styles
    const variantStyles = {
      primary: styles.primaryButton,
      secondary: styles.secondaryButton,
      outline: styles.outlineButton,
      ghost: styles.ghostButton,
      minimal: styles.minimalButton,
      glow: styles.glowButton,
    };

    // Apply disabled styles
    const disabledStyles = {
      primary: styles.primaryDisabled,
      secondary: styles.secondaryDisabled,
      outline: styles.outlineDisabled,
      ghost: styles.ghostDisabled,
      minimal: styles.minimalDisabled,
      glow: styles.glowDisabled,
    };

    return [
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
      disabled && disabledStyles[variant],
      style,
    ];
  };

  // Get text style based on variant and state
  const getTextStyle = () => {
    const baseTextStyle = styles.buttonText;
    
    // Apply size styles to text
    const textSizeStyles = {
      small: styles.buttonTextSmall,
      medium: styles.buttonTextMedium,
      large: styles.buttonTextLarge,
    };

    // Apply variant specific text styles
    const textVariantStyles = {
      primary: styles.primaryButtonText,
      secondary: styles.secondaryButtonText,
      outline: styles.outlineButtonText,
      ghost: styles.ghostButtonText,
      minimal: styles.minimalButtonText,
      glow: styles.glowButtonText,
    };

    // Apply disabled text styles
    const disabledTextStyles = {
      primary: styles.primaryDisabledText,
      secondary: styles.secondaryDisabledText,
      outline: styles.outlineDisabledText,
      ghost: styles.ghostDisabledText,
      minimal: styles.minimalDisabledText,
      glow: styles.glowDisabledText,
    };

    return [
      baseTextStyle,
      textSizeStyles[size],
      textVariantStyles[variant],
      disabled && disabledTextStyles[variant],
      textStyle,
    ];
  };

  // Handle button press only if not disabled and not loading
  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  // Indicator color based on variant
  const getIndicatorColor = () => {
    switch (variant) {
      case 'primary':
      case 'glow':
        return Colors.light.textInverse;
      case 'secondary':
      case 'outline':
      case 'ghost':
      case 'minimal':
        return Colors.light.primary;
      default:
        return Colors.light.textInverse;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={getButtonStyle()}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator size="small" color={getIndicatorColor()} />
        ) : (
          <>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text style={getTextStyle()}>{title}</Text>
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginLeft: Spacing.xs,
  },
  
  // Button sizes
  buttonSmall: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    minHeight: 32,
  },
  buttonMedium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 40,
  },
  buttonLarge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  
  // Text sizes
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextSmall: {
    fontSize: FontSizes.sm,
  },
  buttonTextMedium: {
    fontSize: FontSizes.md,
  },
  buttonTextLarge: {
    fontSize: FontSizes.lg,
  },
  
  // Primary button - Neon blue with white text
  primaryButton: {
    backgroundColor: Colors.light.primary,
    ...Shadows.sm,
  },
  primaryButtonText: {
    color: Colors.light.textInverse,
  },
  primaryDisabled: {
    backgroundColor: 'rgba(10, 132, 255, 0.3)',
    ...Shadows.sm,
  },
  primaryDisabledText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  
  // Secondary button - Light grey with neon blue text
  secondaryButton: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  secondaryButtonText: {
    color: Colors.light.primary,
  },
  secondaryDisabled: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: 'rgba(209, 209, 214, 0.5)',
  },
  secondaryDisabledText: {
    color: 'rgba(10, 132, 255, 0.5)',
  },
  
  // Outline button - Transparent with neon blue border
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  outlineButtonText: {
    color: Colors.light.primary,
  },
  outlineDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  outlineDisabledText: {
    color: 'rgba(10, 132, 255, 0.5)',
  },
  
  // Ghost button - Transparent with neon blue text
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostButtonText: {
    color: Colors.light.primary,
  },
  ghostDisabled: {
    backgroundColor: 'transparent',
  },
  ghostDisabledText: {
    color: 'rgba(10, 132, 255, 0.5)',
  },
  
  // Minimal button - Very subtle styling
  minimalButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  minimalButtonText: {
    color: Colors.light.text,
    fontWeight: '400',
  },
  minimalDisabled: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  minimalDisabledText: {
    color: Colors.light.textTertiary,
    fontWeight: '400',
  },
  
  // Glow button - Neon blue with soft glow effect
  glowButton: {
    backgroundColor: Colors.light.primary,
    ...Glows.medium,
  },
  glowButtonText: {
    color: Colors.light.textInverse,
  },
  glowDisabled: {
    backgroundColor: 'rgba(10, 132, 255, 0.3)',
  },
  glowDisabledText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
}); 