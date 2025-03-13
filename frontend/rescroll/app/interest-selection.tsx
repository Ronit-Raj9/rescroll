import React from 'react';
import { InterestSelection } from '../components/auth/InterestSelection';
import { Stack } from 'expo-router';

export default function InterestSelectionPage() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Select Interests',
        headerShown: false
      }} />
      <InterestSelection />
    </>
  );
} 