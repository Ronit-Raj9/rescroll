import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  KeyboardTypeOptions,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows, FontSizes } from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';

// Define Feather icon names type
type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  leftIcon?: FeatherIconName;
  rightIcon?: FeatherIconName;
  onPressRightIcon?: () => void;
  maxLength?: number;
  testID?: string;
  onBlur?: () => void;
  onFocus?: () => void;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  style,
  inputStyle,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'none',
  error,
  disabled = false,
  multiline = false,
  leftIcon,
  rightIcon,
  onPressRightIcon,
  maxLength,
  testID,
  onBlur,
  onFocus,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus && onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur && onBlur();
  };

  const togglePasswordVisibility = () => {
    setHidePassword(!hidePassword);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedContainer,
          error ? styles.errorContainer : null,
          disabled && styles.disabledContainer,
          multiline && styles.multilineContainer,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Feather 
              name={leftIcon} 
              size={20} 
              color={
                isFocused 
                  ? Colors.light.primary 
                  : error 
                    ? Colors.light.error 
                    : Colors.light.icon
              } 
            />
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            inputStyle,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            multiline && styles.multilineInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidePassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          maxLength={maxLength}
          testID={testID}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={secureTextEntry ? togglePasswordVisibility : onPressRightIcon}
            disabled={disabled}
          >
            <Feather
              name={
                secureTextEntry
                  ? hidePassword
                    ? 'eye'
                    : 'eye-off'
                  : rightIcon || 'x'
              }
              size={20}
              color={
                isFocused 
                  ? Colors.light.primary 
                  : error 
                    ? Colors.light.error 
                    : Colors.light.icon
              }
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.backgroundSecondary,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
  },
  focusedContainer: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.card,
    ...Shadows.sm,
  },
  errorContainer: {
    borderColor: Colors.light.error,
  },
  disabledContainer: {
    backgroundColor: Colors.light.backgroundTertiary,
    borderColor: Colors.light.border,
    opacity: 0.7,
  },
  multilineContainer: {
    minHeight: 100,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.light.text,
    height: '100%',
    paddingVertical: Spacing.sm,
    fontFamily: 'System',
  },
  multilineInput: {
    textAlignVertical: 'top',
    height: 100,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.xs,
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
}); 