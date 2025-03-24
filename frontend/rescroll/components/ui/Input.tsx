import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol, IconSymbolName } from './IconSymbol';
import { Colors, BorderRadius, Spacing } from '@/constants/Colors';

type InputVariant = 'outlined' | 'filled' | 'underlined';
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends TextInputProps {
  label?: string;
  variant?: InputVariant;
  size?: InputSize;
  error?: string;
  helperText?: string;
  leftIcon?: IconSymbolName;
  rightIcon?: IconSymbolName;
  onRightIconPress?: () => void;
  fullWidth?: boolean;
  containerStyle?: any;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      variant = 'outlined',
      size = 'md',
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconPress,
      fullWidth = false,
      containerStyle,
      style,
      value,
      onChangeText,
      placeholder,
      secureTextEntry,
      ...rest
    },
    ref
  ) => {
    const colors = Colors.light;
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
    
    // Get input dimensions based on size
    const getInputDimensions = () => {
      switch (size) {
        case 'sm':
          return {
            paddingVertical: Spacing.xs,
            paddingHorizontal: Spacing.sm,
            fontSize: 14,
            height: 36,
            iconSize: 16,
          };
        case 'lg':
          return {
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
            fontSize: 18,
            height: 56,
            iconSize: 22,
          };
        case 'md':
        default:
          return {
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.md,
            fontSize: 16,
            height: 48,
            iconSize: 18,
          };
      }
    };
    
    // Get input styling based on variant and state
    const getInputStyle = () => {
      const hasError = !!error;
      const dimensions = getInputDimensions();
      
      const baseStyle = {
        height: dimensions.height,
        paddingHorizontal: dimensions.paddingHorizontal,
        fontSize: dimensions.fontSize,
      };
      
      switch (variant) {
        case 'outlined':
          return {
            ...baseStyle,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: hasError
              ? colors.error
              : isFocused
              ? colors.primary
              : colors.border,
            borderRadius: BorderRadius.md,
          };
        case 'filled':
          return {
            ...baseStyle,
            backgroundColor: hasError
              ? colors.errorLight
              : isFocused
              ? colors.backgroundSecondary
              : colors.backgroundTertiary,
            borderWidth: 0,
            borderRadius: BorderRadius.md,
          };
        case 'underlined':
          return {
            ...baseStyle,
            backgroundColor: 'transparent',
            borderWidth: 0,
            borderBottomWidth: 1,
            borderRadius: 0,
            paddingHorizontal: 0,
            borderColor: hasError
              ? colors.error
              : isFocused
              ? colors.primary
              : colors.border,
          };
        default:
          return baseStyle;
      }
    };
    
    const dimensions = getInputDimensions();
    const inputStyle = getInputStyle();
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon || secureTextEntry;
    
    // Determine the right icon to show
    const renderRightIcon = () => {
      if (secureTextEntry) {
        return (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.iconContainer}
          >
            <IconSymbol
              name={isPasswordVisible ? 'xmark.circle.fill' : 'circle.dotted'}
              size={dimensions.iconSize}
              color={colors.icon}
            />
          </TouchableOpacity>
        );
      }
      
      if (rightIcon) {
        return (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconContainer}
            disabled={!onRightIconPress}
          >
            <IconSymbol
              name={rightIcon}
              size={dimensions.iconSize}
              color={colors.icon}
            />
          </TouchableOpacity>
        );
      }
      
      return null;
    };
    
    return (
      <View style={[styles.container, fullWidth && { width: '100%' }, containerStyle]}>
        {label && (
          <ThemedText
            variant="label"
            style={[
              styles.label,
              { color: error ? colors.error : colors.textSecondary },
            ]}
          >
            {label}
          </ThemedText>
        )}
        
        <View style={styles.inputWrapper}>
          {hasLeftIcon && (
            <View style={styles.leftIconContainer}>
              <IconSymbol
                name={leftIcon}
                size={dimensions.iconSize}
                color={colors.icon}
              />
            </View>
          )}
          
          <TextInput
            ref={ref}
            style={[
              inputStyle,
              {
                color: colors.text,
                paddingLeft: hasLeftIcon ? dimensions.height : inputStyle.paddingHorizontal,
                paddingRight: hasRightIcon ? dimensions.height : inputStyle.paddingHorizontal,
              },
              style,
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            {...rest}
          />
          
          {renderRightIcon()}
        </View>
        
        {(error || helperText) && (
          <ThemedText
            variant={error ? 'error' : 'caption'}
            style={[
              styles.helperText,
              { color: error ? colors.error : colors.textTertiary },
            ]}
          >
            {error || helperText}
          </ThemedText>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIconContainer: {
    position: 'absolute',
    left: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    zIndex: 1,
  },
  iconContainer: {
    position: 'absolute',
    right: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  helperText: {
    marginTop: Spacing.xs,
  },
}); 