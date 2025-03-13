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
  "Neural network architectures"
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
          imageUrl: 'https://via.placeholder.com/300x200',
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
          imageUrl: 'https://via.placeholder.com/300x200',
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
          imageUrl: 'https://via.placeholder.com/300x200',
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
  const colors = Colors[colorScheme as 'light' | 'dark'];
  
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
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search research papers..."
            placeholderTextColor={colors.darkGray}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <IconSymbol name="bookmark" size={16} color={colors.darkGray} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {!results.length && !searching ? (
        <ScrollView style={styles.suggestionsContainer}>
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
              <ThemedText style={styles.suggestionText}>{suggestion}</ThemedText>
            </TouchableOpacity>
          ))}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
    marginTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 6,
  },
  suggestionsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  suggestionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#555',
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  resultsContainer: {
    paddingBottom: 16,
  },
  resultCard: {
    marginBottom: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  resultImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  resultContent: {
    padding: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultAuthors: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: 12,
    color: '#888',
  },
}); 