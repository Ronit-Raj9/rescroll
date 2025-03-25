import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import getEnvVars from '../config/env';

const { apiUrl } = getEnvVars();

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  profile_image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, username: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return token;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  };

  const getCurrentUser = async (token: string) => {
    try {
      const response = await fetch(`${apiUrl}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get user data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  };

  const checkAuthState = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const userData = await getCurrentUser(token);
      setUser(userData);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error checking auth state:', error);
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      console.log('Attempting login to:', `${apiUrl}/auth/login`);
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Invalid credentials' }));
        throw new Error(errorData.detail || 'Invalid credentials');
      }

      const data = await response.json();
      console.log('Login successful, got tokens');
      
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);

      // Get user data
      const userData = await getCurrentUser(data.access_token);
      setUser(userData);
      console.log('Successfully got user data, navigating to home');

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, username: string, password: string, fullName: string) => {
    try {
      console.log('[AuthContext] Attempting registration:', { email, username });
      
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          password,
          full_name: fullName,
        }),
      });

      console.log('[AuthContext] Registration response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      // Registration successful, now login automatically
      console.log('[AuthContext] Registration successful, attempting automatic login');
      await signIn(email, password);
      
      // No need to navigate here as signIn will handle navigation
    } catch (error) {
      console.error('[AuthContext] Error in signUp:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        await fetch(`${apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      setUser(null);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, getAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 