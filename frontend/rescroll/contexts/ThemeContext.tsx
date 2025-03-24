import React, { createContext, useState, useContext, useEffect } from 'react';
import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the key for storing theme preference
const THEME_PREFERENCE_KEY = 'rescroll_theme_preference';

// Define possible theme values
type ThemePreference = 'light' | 'dark' | 'system';

// Define the context shape
interface ThemeContextType {
  theme: ThemePreference;
  colorScheme: ColorSchemeName;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
}

// Create the context with a default value
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  colorScheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the device color scheme
  const deviceColorScheme = _useColorScheme();
  
  // State for user preference
  const [theme, setThemeState] = useState<ThemePreference>('system');
  
  // Load theme preference from storage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setThemeState(savedTheme as ThemePreference);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);
  
  // Save theme preference whenever it changes
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem(THEME_PREFERENCE_KEY, theme);
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    };
    
    saveThemePreference();
  }, [theme]);
  
  // Derive the actual color scheme from the theme preference
  const colorScheme = theme === 'system' 
    ? deviceColorScheme 
    : theme;
  
  // Function to set the theme with validation
  const setTheme = (newTheme: ThemePreference) => {
    if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
      setThemeState(newTheme);
    }
  };
  
  // Toggle between light and dark (ignoring system)
  const toggleTheme = () => {
    if (colorScheme === 'dark') {
      setThemeState('light');
    } else {
      setThemeState('dark');
    }
  };
  
  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        colorScheme, 
        setTheme, 
        toggleTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for easy usage of the theme context
export const useTheme = () => useContext(ThemeContext); 