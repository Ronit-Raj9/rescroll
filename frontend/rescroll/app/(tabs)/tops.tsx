import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Image, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Sample data for top categories
const TOP_CATEGORIES = [
  { id: '1', name: 'Trending' },
  { id: '2', name: 'Most Cited' },
  { id: '3', name: 'New Releases' },
  { id: '4', name: 'Popular Authors' },
];

// Sample trending reports data
const TRENDING_REPORTS = [
  {
    id: '1',
    title: 'Advancements in Quantum Machine Learning',
    authors: 'Dr. Emily Chen, Prof. Robert Williams',
    date: '2023-11-10',
    snippet: 'This paper explores the intersection of quantum computing and machine learning, demonstrating significant performance improvements...',
    imageUrl: 'https://example.com/quantum-ml.jpg',
    citations: 48,
    likes: 235,
  },
  {
    id: '2',
    title: 'Climate Change Effects on Marine Ecosystems',
    authors: 'Dr. Sarah Johnson, Dr. Michael Davis',
    date: '2023-10-28',
    snippet: 'A comprehensive analysis of how rising ocean temperatures are affecting marine biodiversity and ecosystem balance...',
    imageUrl: 'https://example.com/marine-eco.jpg',
    citations: 37,
    likes: 198,
  },
  {
    id: '3',
    title: 'Neuroplasticity in Adult Learning',
    authors: 'Prof. Anna Kim, Dr. James Wilson',
    date: '2023-11-05',
    snippet: 'This study reveals new findings about the brain\'s capacity to reorganize and adapt during adult learning processes...',
    imageUrl: 'https://example.com/brain-plasticity.jpg',
    citations: 29,
    likes: 176,
  },
];

// Sample most cited reports data
const MOST_CITED_REPORTS = [
  {
    id: '1',
    title: 'Breakthrough in CRISPR Gene Editing Techniques',
    authors: 'Dr. Lisa Wong, Prof. David Miller',
    date: '2023-09-15',
    snippet: 'This groundbreaking research presents a new approach to CRISPR gene editing that significantly reduces off-target effects...',
    imageUrl: 'https://example.com/crispr-advance.jpg',
    citations: 187,
    likes: 432,
  },
  {
    id: '2',
    title: 'Artificial General Intelligence: Progress and Challenges',
    authors: 'Prof. Alan Martinez, Dr. Rebecca Lee',
    date: '2023-08-22',
    snippet: 'A comprehensive review of current advances toward artificial general intelligence and the ethical considerations involved...',
    imageUrl: 'https://example.com/agi-research.jpg',
    citations: 156,
    likes: 389,
  },
];

export default function TopsScreen() {
  const [activeCategory, setActiveCategory] = useState('1'); // Default to Trending
  const router = useRouter();

  const handleNavigateToReport = (id: string) => {
    router.push(`/report/${id}`);
  };

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.categoryTab, activeCategory === item.id && styles.activeCategoryTab]} 
      onPress={() => setActiveCategory(item.id)}
    >
      <ThemedText style={[styles.categoryText, activeCategory === item.id && styles.activeCategoryText]}>
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderReportCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.reportCard}
      onPress={() => handleNavigateToReport(item.id)}
    >
      <View style={styles.reportHeader}>
        <ThemedText style={styles.reportTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.reportMeta}>
          By {item.authors} • {item.date}
        </ThemedText>
      </View>
      
      <ThemedText style={styles.reportSnippet}>{item.snippet}</ThemedText>
      
      <View style={styles.reportStats}>
        <View style={styles.stat}>
          <IconSymbol name="quote.bubble" size={16} color="#666" />
          <ThemedText style={styles.statText}>{item.citations} citations</ThemedText>
        </View>
        <View style={styles.stat}>
          <IconSymbol name="heart.fill" size={16} color="#e74c3c" />
          <ThemedText style={styles.statText}>{item.likes} likes</ThemedText>
        </View>
      </View>
      
      <View style={styles.reportActions}>
        <TouchableOpacity style={styles.actionButton}>
          <IconSymbol name="heart" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <IconSymbol name="bookmark" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <IconSymbol name="square.and.arrow.up" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getReportData = () => {
    switch(activeCategory) {
      case '1': return TRENDING_REPORTS;
      case '2': return MOST_CITED_REPORTS;
      case '3': return TRENDING_REPORTS; // Using same data for demo
      case '4': return MOST_CITED_REPORTS; // Using same data for demo
      default: return TRENDING_REPORTS;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Top Papers',
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

      <View style={styles.categoryContainer}>
        <FlatList
          data={TOP_CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <FlatList
        data={getReportData()}
        renderItem={renderReportCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.reportsList}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryList: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeCategoryTab: {
    backgroundColor: '#3498db',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reportsList: {
    padding: 15,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reportHeader: {
    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reportMeta: {
    fontSize: 12,
    color: '#888',
  },
  reportSnippet: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  reportStats: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    padding: 5,
    marginLeft: 15,
  },
}); 