import React from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Carousel from 'react-native-reanimated-carousel';

// Sample data for featured articles
const FEATURED_ARTICLES = [
  {
    id: '1',
    title: 'Breakthrough in Quantum Computing',
    snippet: 'New research demonstrates practical quantum advantage in solving complex optimization problems.',
    imageUrl: 'https://example.com/quantum.jpg',
  },
  {
    id: '2',
    title: 'AI Models Show Human-Like Learning',
    snippet: 'Latest research reveals neural networks that learn with significantly less training data.',
    imageUrl: 'https://example.com/ai.jpg',
  },
  {
    id: '3',
    title: 'Climate Change: Ocean Acidification',
    snippet: 'New findings show accelerated acidification rates in key marine ecosystems.',
    imageUrl: 'https://example.com/ocean.jpg',
  },
];

// Sample data for feed posts
const FEED_POSTS = [
  {
    id: '1',
    title: 'Understanding Deep Neural Networks',
    authors: 'Dr. Adam Chen, Prof. Sarah Williams',
    date: '2023-11-15',
    snippet: 'This paper explains the advanced architecture of deep neural networks and their applications in modern computing environments.',
    imageUrl: 'https://example.com/dnn.jpg',
  },
  {
    id: '2',
    title: 'CRISPR Applications in Agriculture',
    authors: 'Dr. Jennifer Miller, Dr. Robert Davis',
    date: '2023-11-12',
    snippet: 'An exploration of how CRISPR gene editing technology is being used to develop more resilient and nutritious crops.',
    imageUrl: 'https://example.com/crispr-ag.jpg',
  },
  {
    id: '3',
    title: 'Novel Approaches to Renewable Energy Storage',
    authors: 'Prof. Michael Thompson, Dr. Emily Wilson',
    date: '2023-11-08',
    snippet: 'This research presents innovative solutions for energy storage that could overcome current limitations in renewable energy adoption.',
    imageUrl: 'https://example.com/energy.jpg',
  },
  {
    id: '4',
    title: 'Advancements in Cancer Immunotherapy',
    authors: 'Dr. Lisa Johnson, Prof. David Kim',
    date: '2023-11-05',
    snippet: 'This study reveals promising new immunotherapy techniques that show improved outcomes for treatment-resistant cancers.',
    imageUrl: 'https://example.com/immunotherapy.jpg',
  },
];

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const handleNavigateToReport = (id: string) => {
    router.push(`/report/${id}`);
  };

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.carouselItem}
      onPress={() => handleNavigateToReport(item.id)}
    >
      <View style={styles.carouselImageContainer}>
        <View style={styles.carouselImagePlaceholder}>
          <IconSymbol name="doc.text.image" size={40} color="#999" />
        </View>
      </View>
      <View style={styles.carouselTextContainer}>
        <ThemedText style={styles.carouselTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.carouselSnippet}>{item.snippet}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderPostItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => handleNavigateToReport(item.id)}
    >
      <View style={styles.postHeader}>
        <ThemedText style={styles.postTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.postMeta}>
          By {item.authors} • {item.date}
        </ThemedText>
      </View>
      
      <View style={styles.postImageContainer}>
        <View style={styles.postImagePlaceholder}>
          <IconSymbol name="doc.text.image" size={30} color="#999" />
        </View>
      </View>
      
      <ThemedText style={styles.postSnippet}>{item.snippet}</ThemedText>
      
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <IconSymbol name="heart" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <IconSymbol name="quote.bubble" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <IconSymbol name="bookmark" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <IconSymbol name="play.circle" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'ReScroll',
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

      <FlatList
        data={FEED_POSTS}
        renderItem={renderPostItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.feedContainer}
        ListHeaderComponent={() => (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Featured on ReScroll</ThemedText>
            <Carousel
              loop
              width={screenWidth - 30}
              height={180}
              autoPlay={true}
              data={FEATURED_ARTICLES}
              scrollAnimationDuration={1000}
              renderItem={renderFeaturedItem}
            />
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feedContainer: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  carouselItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    height: 180,
  },
  carouselImageContainer: {
    height: 100,
    backgroundColor: '#f0f0f0',
  },
  carouselImagePlaceholder: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselTextContainer: {
    padding: 12,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  carouselSnippet: {
    fontSize: 12,
    color: '#666',
  },
  postCard: {
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
  postHeader: {
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postMeta: {
    fontSize: 12,
    color: '#888',
  },
  postImageContainer: {
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 10,
  },
  postImagePlaceholder: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postSnippet: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    padding: 5,
  },
});
