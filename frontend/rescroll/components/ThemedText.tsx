import { Text, type TextProps, StyleSheet } from 'react-native';
import { FontSizes, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

export type TextVariant = 
  | 'body'           // Default body text
  | 'bodySmall'      // Smaller body text
  | 'bodyLarge'      // Larger body text
  | 'caption'        // Small caption text
  | 'title'          // Large title
  | 'subtitle'       // Subtitle
  | 'heading1'       // Largest heading
  | 'heading2'       // Second largest heading
  | 'heading3'       // Third largest heading
  | 'button'         // Button text
  | 'link'           // Link text
  | 'label'          // Form label text
  | 'error';         // Error message text

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: TextVariant;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  variant = 'body',
  weight = 'normal',
  align = 'auto',
  ...rest
}: ThemedTextProps) {
  const { colorScheme } = useTheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  const textColor = lightColor && darkColor
    ? theme === 'dark' ? darkColor : lightColor
    : Colors[theme].text;

  return (
    <Text
      style={[
        { color: textColor },
        styles[variant],
        weight === 'medium' && styles.medium,
        weight === 'semibold' && styles.semibold,
        weight === 'bold' && styles.bold,
        { textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // Base text variants
  body: {
    fontSize: FontSizes.md,
    lineHeight: FontSizes.md * 1.5,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * 1.5,
    fontWeight: '400',
  },
  bodyLarge: {
    fontSize: FontSizes.lg,
    lineHeight: FontSizes.lg * 1.5,
    fontWeight: '400',
  },
  caption: {
    fontSize: FontSizes.xs,
    lineHeight: FontSizes.xs * 1.5,
    fontWeight: '400',
  },
  
  // Heading variants
  heading1: {
    fontSize: FontSizes.xxxl,
    lineHeight: FontSizes.xxxl * 1.2,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: FontSizes.xxl,
    lineHeight: FontSizes.xxl * 1.3,
    fontWeight: '700',
  },
  heading3: {
    fontSize: FontSizes.xl,
    lineHeight: FontSizes.xl * 1.4,
    fontWeight: '600',
  },
  title: {
    fontSize: FontSizes.xxl,
    lineHeight: FontSizes.xxl * 1.3,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSizes.lg,
    lineHeight: FontSizes.lg * 1.4,
    fontWeight: '600',
  },
  
  // UI element text
  button: {
    fontSize: FontSizes.md,
    lineHeight: FontSizes.md * 1.5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  link: {
    fontSize: FontSizes.md,
    lineHeight: FontSizes.md * 1.5,
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
  label: {
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * 1.5,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  error: {
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * 1.5,
    fontWeight: '400',
    color: '#FF3B30',
  },
  
  // Font weights
  medium: {
    fontWeight: '500',
  },
  semibold: {
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
  },
});
