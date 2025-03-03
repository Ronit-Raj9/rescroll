import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { Stack } from 'expo-router';

export default function LoginPage() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Login',
        headerShown: false
      }} />
      <LoginForm />
    </>
  );
} 