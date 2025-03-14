import { Redirect } from 'expo-router';

export default function Index() {
  // By default, redirect to the tabs
  return <Redirect href="/(tabs)" />;
} 