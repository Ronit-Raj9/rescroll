import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { KnowledgeGraph } from '@/components/explore/KnowledgeGraph';

// Define the types for our topic items
interface TopicItem {
  id: string;
  name: string;
  count: number;
  color: string;
  icon: any; // Using any for icon name since we need to handle custom SF Symbols
}

// Define the types for trend items
interface TrendItem {
  id: string;
  name: string;
  percentage: number;
  change: string;
  color: string;
}

export default function ExploreScreen() {
  const router = useRouter();
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Explore Research',
        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={{ marginRight: 15 }}>
              <IconSymbol name="bell" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ marginRight: 15 }}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <IconSymbol name="person.circle" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        )
      }} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Discover Research Connections
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Use the interactive knowledge graph to explore relationships between research topics
            and discover new connections in your areas of interest.
          </ThemedText>
        </View>

        <KnowledgeGraph />

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Popular Research Areas
          </ThemedText>
          
          <View style={styles.topicsGrid}>
            {POPULAR_TOPICS.map((topic) => (
              <TouchableOpacity key={topic.id} style={styles.topicCard}>
                <View style={[styles.topicIconContainer, { backgroundColor: topic.color }]}>
                  <IconSymbol name={topic.icon} size={24} color="white" />
                </View>
                <ThemedText style={styles.topicTitle}>{topic.name}</ThemedText>
                <ThemedText style={styles.topicCount}>{topic.count} papers</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Research Trends
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Stay up-to-date with the latest trends in research across various disciplines.
          </ThemedText>
          
          {RESEARCH_TRENDS.map((trend) => (
            <View key={trend.id} style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <ThemedText style={styles.trendName}>{trend.name}</ThemedText>
                <ThemedText style={styles.trendChange}>{trend.change}</ThemedText>
              </View>
              <View style={styles.trendBar}>
                <View 
                  style={[
                    styles.trendProgress, 
                    { 
                      width: `${trend.percentage}%`,
                      backgroundColor: trend.color 
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// Sample data for popular topics
const POPULAR_TOPICS: TopicItem[] = [
  { id: '1', name: 'Artificial Intelligence', count: 1248, color: '#3498db', icon: 'brain' as any },
  { id: '2', name: 'Climate Science', count: 856, color: '#2ecc71', icon: 'globe.europe.africa' as any },
  { id: '3', name: 'Quantum Computing', count: 632, color: '#9b59b6', icon: 'atom' as any },
  { id: '4', name: 'Biotechnology', count: 745, color: '#f39c12', icon: 'staroflife' as any },
  { id: '5', name: 'Neuroscience', count: 528, color: '#e74c3c', icon: 'waveform.path.ecg' as any },
  { id: '6', name: 'Economics', count: 419, color: '#1abc9c', icon: 'chart.bar' as any },
];

// Sample data for research trends
const RESEARCH_TRENDS: TrendItem[] = [
  { id: '1', name: 'Machine Learning', percentage: 85, change: '+12%', color: '#3498db' },
  { id: '2', name: 'Renewable Energy', percentage: 72, change: '+8%', color: '#2ecc71' },
  { id: '3', name: 'Vaccine Research', percentage: 68, change: '+15%', color: '#e74c3c' },
  { id: '4', name: 'Blockchain Technology', percentage: 45, change: '+5%', color: '#f39c12' },
  { id: '5', name: 'Mental Health', percentage: 60, change: '+10%', color: '#9b59b6' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topicIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  topicCount: {
    fontSize: 12,
    color: '#666',
  },
  trendItem: {
    marginBottom: 15,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  trendName: {
    fontSize: 14,
    fontWeight: '500',
  },
  trendChange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2ecc71',
  },
  trendBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trendProgress: {
    height: '100%',
    borderRadius: 4,
  },
});
