import { View, ActivityIndicator } from 'react-native';
import { useContext, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { ThemedText } from '../components/ThemedText';

export default function Index() {
  // Simply redirect to the tabs screen
  return <Redirect href="/(tabs)" />;
} 