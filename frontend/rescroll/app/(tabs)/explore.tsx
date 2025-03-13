import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <ThemedText style={styles.screenTitle}>Explore</ThemedText>
      </View>
      
      <View style={styles.content}>
        <IconSymbol name="safari" size={60} color={colors.primary} />
        <ThemedText style={styles.comingSoonText}>Explore Coming Soon</ThemedText>
        <ThemedText style={styles.descriptionText}>
          Discover new research topics and trending papers in your field of interest
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    maxWidth: '80%',
  }
});
