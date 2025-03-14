import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps,
  View,
  Platform
} from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol, IconSymbolName } from './IconSymbol';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/Colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type IconPosition = 'left' | 'right';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  icon?: IconSymbolName;
  iconPosition?: IconPosition;
  fullWidth?: boolean;
  rounded?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  // Get colors based on variant
  const getColors = () => {
    const colors = Colors.light;
    
    switch (variant) {
      case 'primary':
        return {
          background: disabled ? colors.mediumGray : colors.primary,
          text: colors.textInverse,
          border: 'transparent',
        };
      case 'secondary':
        return {
          background: disabled ? colors.lightGray : colors.secondary,
          text: colors.textInverse,
          border: 'transparent',
        };
      case 'outline':
        return {
          background: 'transparent',
          text: disabled ? colors.textTertiary : colors.primary,
          border: disabled ? colors.mediumGray : colors.primary,
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: disabled ? colors.textTertiary : colors.primary,
          border: 'transparent',
        };
      case 'danger':
        return {
          background: disabled ? colors.lightGray : colors.error,
          text: colors.textInverse,
          border: 'transparent',
        };
      default:
        return {
          background: disabled ? colors.mediumGray : colors.primary,
          text: colors.textInverse,
          border: 'transparent',
        };
    }
  };
  
  // Get dimensions based on size
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.sm,
          fontSize: 14,
          iconSize: 16,
        };
      case 'lg':
        return {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          fontSize: 18,
          iconSize: 22,
        };
      case 'md':
      default:
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          fontSize: 16,
          iconSize: 18,
        };
    }
  };
  
  const colors = getColors();
  const dimensions = getDimensions();
  const isOutlineOrGhost = variant === 'outline' || variant === 'ghost';
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: isOutlineOrGhost ? 1 : 0,
          paddingVertical: dimensions.paddingVertical,
          paddingHorizontal: dimensions.paddingHorizontal,
          borderRadius: rounded ? BorderRadius.round : BorderRadius.md,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.7 : 1,
        },
        variant !== 'ghost' && variant !== 'outline' && Shadows.sm,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={colors.text} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <IconSymbol 
              name={icon} 
              size={dimensions.iconSize} 
              color={colors.text} 
              style={styles.leftIcon} 
            />
          )}
          
          <ThemedText 
            variant="button" 
            style={{ 
              color: colors.text, 
              fontSize: dimensions.fontSize,
              textAlign: 'center',
            }}
          >
            {label}
          </ThemedText>
          
          {icon && iconPosition === 'right' && (
            <IconSymbol 
              name={icon} 
              size={dimensions.iconSize} 
              color={colors.text} 
              style={styles.rightIcon} 
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginLeft: Spacing.xs,
  },
}); 