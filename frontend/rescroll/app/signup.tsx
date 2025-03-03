import React from 'react';
import { SignupForm } from '../components/auth/SignupForm';
import { Stack } from 'expo-router';

export default function SignupPage() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Sign Up',
        headerShown: false
      }} />
      <SignupForm />
    </>
  );
} 