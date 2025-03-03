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
}

// Mock data for search filters
const SEARCH_FILTERS = [
  { id: 'all', label: 'All Papers' },
  { id: 'recent', label: 'Recent' },
  { id: 'cited', label: 'Most Cited' },
  { id: 'ai', label: 'AI & ML' },
  { id: 'medicine', label: 'Medicine' },
  { id: 'physics', label: 'Physics' },
  { id: 'biology', label: 'Biology' },
];

// Mock data for search history
const RECENT_SEARCHES = [
  'machine learning',
  'BERT language model',
  'COVID-19 variants',
  'quantum computing',
  'neural networks',
];

// Mock search results data
const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    id: '1',
    title: 'Attention Is All You Need',
    authors: [
      { id: '1', name: 'Ashish Vaswani' },
      { id: '2', name: 'Noam Shazeer' },
      { id: '3', name: 'Niki Parmar' },
      { id: '4', name: 'Jakob Uszkoreit' },
    ],
    journal: 'NeurIPS',
    year: '2017',
    citationCount: 78592,
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
    keywords: ['transformers', 'attention', 'NLP'],
  },
  {
    id: '2',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: [
      { id: '1', name: 'Jacob Devlin' },
      { id: '2', name: 'Ming-Wei Chang' },
      { id: '3', name: 'Kenton Lee' },
      { id: '4', name: 'Kristina Toutanova' },
    ],
    journal: 'NAACL',
    year: '2019',
    citationCount: 49830,
    abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers...',
    keywords: ['BERT', 'transformers', 'NLP', 'language understanding'],
    isNew: true,
  },
  {
    id: '3',
    title: 'Deep Residual Learning for Image Recognition',
    authors: [
      { id: '1', name: 'Kaiming He' },
      { id: '2', name: 'Xiangyu Zhang' },
      { id: '3', name: 'Shaoqing Ren' },
      { id: '4', name: 'Jian Sun' },
    ],
    journal: 'CVPR',
    year: '2016',
    citationCount: 126141,
    abstract: 'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously...',
    keywords: ['computer vision', 'deep learning', 'image recognition', 'ResNet'],
  },
  {
    id: '4',
    title: 'GPT-3: Language Models are Few-Shot Learners',
    authors: [
      { id: '1', name: 'Tom B. Brown' },
      { id: '2', name: 'Benjamin Mann' },
      { id: '3', name: 'Nick Ryder' },
      { id: '4', name: 'Melanie Subbiah' },
    ],
    journal: 'NeurIPS',
    year: '2020',
    citationCount: 13589,
    abstract: 'We demonstrate that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches...',
    keywords: ['GPT-3', 'few-shot learning', 'language models', 'NLP'],
    isNew: true,
  },
  {
    id: '5',
    title: 'Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer',
    authors: [
      { id: '1', name: 'Colin Raffel' },
      { id: '2', name: 'Noam Shazeer' },
      { id: '3', name: 'Adam Roberts' },
      { id: '4', name: 'Katherine Lee' },
    ],
    journal: 'J. Mach. Learn. Res.',
    year: '2020',
    citationCount: 9321,
    abstract: 'Transfer learning, where a model is first pre-trained on a data-rich task before being fine-tuned on a downstream task, has emerged as a powerful technique in natural language processing...',
    keywords: ['T5', 'transformers', 'transfer learning', 'NLP'],
  },
];

// Mock function to simulate search API call
const mockSearchPapers = async (query: string, filter: string): Promise<SearchResult[]> => {
  // Simulate network request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!query.trim()) {
    return [];
  }
  
  let results = [...MOCK_SEARCH_RESULTS];
  
  // Apply filter if not 'all'
  if (filter !== 'all') {
    switch (filter) {
      case 'recent':
        results = results.filter(r => r.year >= '2019');
        break;
      case 'cited':
        results = results.sort((a, b) => b.citationCount - a.citationCount);
        break;
      case 'ai':
        results = results.filter(r => 
          r.keywords.some(k => ['transformers', 'NLP', 'deep learning'].includes(k))
        );
        break;
      // Add other filters as needed
    }
  }
  
  // Simple search: check if query is in title, abstract, or keywords
  const lowerQuery = query.toLowerCase();
  return results.filter(paper => 
    paper.title.toLowerCase().includes(lowerQuery) ||
    paper.abstract.toLowerCase().includes(lowerQuery) ||
    paper.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
    paper.authors.some(a => a.name.toLowerCase().includes(lowerQuery))
  );
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const router = useRouter();

  // Handle search query changes
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      setShowRecentSearches(false);
      setIsSearching(true);
      try {
        const results = await mockSearchPapers(query, activeFilter);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowRecentSearches(true);
      setSearchResults([]);
    }
  };

  // Apply filter change
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  }, [activeFilter]);

  // Navigate to paper detail screen
  const handlePaperPress = (paperId: string) => {
    router.push(`/paper/${paperId}`);
  };

  // Header component for search results
  const SearchResultsHeader = () => (
    <View style={styles.resultsHeader}>
      <ThemedText style={styles.resultsCount}>
        {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{searchQuery}"
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        title: 'Search',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerShadowVisible: false,
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
      
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.header, { paddingTop: 15 }]}>
          <View style={styles.searchContainer}>
            <IconSymbol name="magnifyingglass" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search for papers, authors, topics..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setShowRecentSearches(searchQuery.trim() === '')}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  setShowRecentSearches(true);
                  setSearchResults([]);
                }}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {SEARCH_FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                activeFilter === filter.id && styles.activeFilterChip
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  activeFilter === filter.id && styles.activeFilterText
                ]}
              >
                {filter.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <ThemedText style={styles.loadingText}>Searching...</ThemedText>
          </View>
        ) : showRecentSearches ? (
          <View style={styles.recentSearchesContainer}>
            <ThemedText style={styles.recentSearchesTitle}>Recent Searches</ThemedText>
            {RECENT_SEARCHES.map((search, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.recentSearchItem}
                onPress={() => handleSearch(search)}
              >
                <IconSymbol name="clock" size={16} color="#888" />
                <ThemedText style={styles.recentSearchText}>{search}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.resultsContainer}
            ListHeaderComponent={SearchResultsHeader}
            ListEmptyComponent={
              searchQuery.trim() !== '' ? (
                <View style={styles.emptyResultsContainer}>
                  <IconSymbol name="doc.text.magnifyingglass" size={60} color="#ccc" />
                  <ThemedText style={styles.emptyResultsText}>
                    No papers found for "{searchQuery}"
                  </ThemedText>
                  <ThemedText style={styles.emptyResultsSuggestion}>
                    Try different keywords or filters
                  </ThemedText>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.paperItem}
                onPress={() => handlePaperPress(item.id)}
              >
                <View style={styles.paperHeader}>
                  <ThemedText style={styles.paperTitle}>{item.title}</ThemedText>
                  {item.isNew && (
                    <View style={styles.newBadge}>
                      <ThemedText style={styles.newBadgeText}>NEW</ThemedText>
                    </View>
                  )}
                </View>
                
                <View style={styles.paperMeta}>
                  <ThemedText style={styles.paperAuthors}>
                    {item.authors.map(a => a.name).join(', ')}
                  </ThemedText>
                  <ThemedText style={styles.paperJournal}>
                    {item.journal} • {item.year}
                  </ThemedText>
                </View>
                
                <ThemedText 
                  style={styles.paperAbstract}
                  numberOfLines={3}
                >
                  {item.abstract}
                </ThemedText>
                
                <View style={styles.paperFooter}>
                  <View style={styles.citationContainer}>
                    <IconSymbol name="quote.bubble" size={14} color="#888" />
                    <ThemedText style={styles.citationText}>
                      {item.citationCount.toLocaleString()}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.keywordsContainer}>
                    {item.keywords.slice(0, 3).map((keyword, index) => (
                      <View key={index} style={styles.keywordBadge}>
                        <ThemedText style={styles.keywordText}>{keyword}</ThemedText>
                      </View>
                    ))}
                    {item.keywords.length > 3 && (
                      <ThemedText style={styles.moreKeywords}>+{item.keywords.length - 3}</ThemedText>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    // Handle save logic here
                  }}
                >
                  <IconSymbol name="bookmark" size={18} color="#888" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    padding: 15,
    paddingTop: 45,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  filtersContainer: {
    padding: 12,
    paddingTop: 15,
    gap: 10,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#3498db',
  },
  filterText: {
    fontSize: 14,
    color: '#555',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  recentSearchesContainer: {
    padding: 20,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentSearchText: {
    fontSize: 16,
    marginLeft: 12,
  },
  resultsContainer: {
    padding: 15,
    paddingBottom: 40,
  },
  resultsHeader: {
    marginBottom: 15,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyResultsSuggestion: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  paperItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  paperHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 20, // Make space for the save button
  },
  paperTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 10,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  paperMeta: {
    marginBottom: 8,
  },
  paperAuthors: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  paperJournal: {
    fontSize: 13,
    color: '#666',
  },
  paperAbstract: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },
  paperFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  citationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  citationText: {
    fontSize: 13,
    color: '#888',
    marginLeft: 5,
  },
  keywordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keywordBadge: {
    backgroundColor: '#f0f5fa',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 5,
  },
  keywordText: {
    fontSize: 11,
    color: '#3498db',
  },
  moreKeywords: {
    fontSize: 11,
    color: '#888',
    marginLeft: 5,
  },
  saveButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 