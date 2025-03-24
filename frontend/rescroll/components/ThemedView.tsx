import { View, type ViewProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { colorScheme } = useTheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  const backgroundColor = lightColor && darkColor
    ? theme === 'dark' ? darkColor : lightColor
    : Colors[theme].background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
