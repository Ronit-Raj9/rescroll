import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      // If user is already logged in, redirect to home
      router.replace('/(tabs)');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
} 