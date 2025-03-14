import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types for search results
interface Author {
  id: string;
  name: string;
}

interface SearchResult {
  id: string;
  title: string;
  authors: Author[];
  journal: string;
  year: string;
  citationCount: number;
  abstract: string;
  keywords: string[];
  isNew?: boolean;
  imageUrl?: string;
}

// Sample search suggestions
const SEARCH_SUGGESTIONS = [
  "Machine learning in healthcare",
  "Climate change mitigation",
  "Quantum computing advances",
  "Neural network architectures",
  "Renewable energy storage solutions"
];

// Mock data function - in a real app, this would connect to an API
const searchResults = (query: string): Promise<SearchResult[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          title: 'Advances in Neural Network Architecture',
          authors: [{ id: 'a1', name: 'John Smith' }, { id: 'a2', name: 'Sarah Chen' }],
          journal: 'Journal of Machine Learning',
          year: '2023',
          citationCount: 45,
          abstract: 'This study explores novel neural network architectures...',
          keywords: ['neural networks', 'deep learning', 'architecture'],
          imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
        },
        {
          id: '2',
          title: 'Climate Change Mitigation Strategies',
          authors: [{ id: 'a3', name: 'Maria Rodriguez' }],
          journal: 'Environmental Science',
          year: '2022',
          citationCount: 32,
          abstract: 'We analyze various climate change mitigation strategies...',
          keywords: ['climate', 'mitigation', 'policy'],
          imageUrl: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
        },
        {
          id: '3',
          title: 'Quantum Computing: Current State and Future',
          authors: [{ id: 'a4', name: 'David Lee' }, { id: 'a5', name: 'Emma Wilson' }],
          journal: 'Quantum Systems',
          year: '2023',
          citationCount: 18,
          abstract: 'This paper reviews the current state of quantum computing...',
          keywords: ['quantum', 'computing', 'qubits'],
          imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
        },
      ]);
    }, 1000);
  });
};

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([...SEARCH_SUGGESTIONS]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors.light; // Always use light theme to match home page
  
  const numColumns = 2;
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / numColumns;

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setSearching(true);
    try {
      const searchData = await searchResults(query);
      setResults(searchData);
      
      // Add to recent searches if it's not already there
      if (!recentSearches.includes(query)) {
        setRecentSearches([query, ...recentSearches.slice(0, 3)]);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      style={[styles.resultCard, { width: itemWidth }]} 
      onPress={() => router.push(`/paper/${item.id}`)}
    >
      <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/300x200' }} style={styles.resultImage} />
      <View style={styles.resultContent}>
        <ThemedText style={styles.resultTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.resultAuthors} numberOfLines={1}>
          {item.authors.map(author => author.name).join(', ')}
        </ThemedText>
        <ThemedText style={styles.resultMeta}>
          {item.journal} • {item.year}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.screenTitle}>Search</ThemedText>
          </View>
          
          {/* Search Bar with grey shade styling matching home page */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <IconSymbol name="magnifyingglass" size={16} color="#777" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search papers, topics, or authors..."
                placeholderTextColor="#777"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCapitalize="none"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <IconSymbol name="xmark.circle.fill" size={16} color="#777" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {!results.length && !searching ? (
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Recent Searches Section */}
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Recent Searches</ThemedText>
              {recentSearches.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setQuery(suggestion);
                    handleSearch();
                  }}
                >
                  <IconSymbol name="magnifyingglass" size={16} color="#777" style={styles.suggestionIcon} />
                  <ThemedText style={styles.suggestionText}>{suggestion}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <>
            {searching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <ThemedText style={styles.loadingText}>Searching...</ThemedText>
              </View>
            ) : (
              <>
                <ThemedText style={styles.resultsHeader}>Articles</ThemedText>
                <FlatList
                  data={results}
                  renderItem={renderResultItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.resultsContainer}
                  numColumns={numColumns}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}
          </>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginTop: 10,
    paddingHorizontal: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    color: '#333',
    paddingVertical: 6,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 24,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.primary,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  resultContent: {
    padding: 12,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultAuthors: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: 11,
    color: '#777',
  },
}); 