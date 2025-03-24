import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Easing,
} from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

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
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<{query: string, timestamp: number}[]>(
    SEARCH_SUGGESTIONS.map(query => ({ 
      query, 
      timestamp: Date.now() - Math.floor(Math.random() * 10000000) 
    }))
  );
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors.light; // Always use light theme to match home page
  
  // Animated values for search bar expansion
  const searchBarWidth = useRef(new Animated.Value(1)).current;
  const searchBarOpacity = useRef(new Animated.Value(0)).current;
  const cancelBtnOpacity = useRef(new Animated.Value(0)).current;
  
  const numColumns = 2;
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / numColumns;

  // Add these new state variables for filtering
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'citations'>('relevance');

  // Add a function to format timestamps
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  // Handle search bar focus animation
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.parallel([
      Animated.timing(searchBarWidth, {
        toValue: 0.85,
        duration: 250,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(cancelBtnOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
        delay: 100,
      }),
    ]).start();
  };

  // Handle search bar blur animation
  const handleSearchBlur = () => {
    if (query.length === 0) {
      setIsSearchFocused(false);
      Animated.parallel([
        Animated.timing(searchBarWidth, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(cancelBtnOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  // Handle cancel button press
  const handleCancelPress = () => {
    setQuery('');
    setTimeout(() => {
      handleSearchBlur();
    }, 100);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setSearching(true);
    setSearchError(null); // Reset any previous errors
    
    try {
      const searchData = await searchResults(query);
      setResults(searchData);
      
      // Add to recent searches if it's not already there
      const currentQuery = query;
      setRecentSearches(prev => {
        // Remove if it already exists
        const filtered = prev.filter(item => item.query !== currentQuery);
        // Add to the beginning with current timestamp
        return [{ query: currentQuery, timestamp: Date.now() }, ...filtered.slice(0, 9)];
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Add a toggleFilter function to handle filter selection
  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  // Add a setSorting function to handle sort selection
  const setSorting = (sort: 'relevance' | 'date' | 'citations') => {
    setSortBy(sort);
    // In a real app, this would trigger a re-fetch with the new sort parameter
    if (query) {
      handleSearch();
    }
  };

  // Add a function to clear a specific recent search
  const removeRecentSearch = (query: string) => {
    setRecentSearches(prev => prev.filter(item => item.query !== query));
  };

  // Add a function to clear all recent searches
  const clearAllRecentSearches = () => {
    setRecentSearches([]);
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

  // Add this function to render the filter section
  const renderFilterSection = () => (
    <View style={styles.filterContainer}>
      <View style={styles.filterHeader}>
        <ThemedText style={styles.filterTitle}>Filter Results</ThemedText>
        <TouchableOpacity 
          style={styles.toggleFiltersButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <ThemedText style={styles.toggleFiltersText}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </ThemedText>
          <Feather 
            name={showFilters ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color={Colors.light.primary} 
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContent}>
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>Categories</ThemedText>
            <View style={styles.filterChipsContainer}>
              {['AI', 'Biology', 'Physics', 'Chemistry', 'Medicine', 'Economics'].map((category) => (
                <TouchableOpacity
                  key={`category-${category}`}
                  style={[
                    styles.filterChip,
                    activeFilters.includes(category) && styles.activeFilterChip,
                  ]}
                  onPress={() => toggleFilter(category)}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      activeFilters.includes(category) && styles.activeFilterChipText,
                    ]}
                  >
                    {category}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>Date</ThemedText>
            <View style={styles.filterChipsContainer}>
              {['Last week', 'Last month', 'Last year', 'All time'].map((date) => (
                <TouchableOpacity
                  key={`date-${date}`}
                  style={[
                    styles.filterChip,
                    activeFilters.includes(date) && styles.activeFilterChip,
                  ]}
                  onPress={() => toggleFilter(date)}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      activeFilters.includes(date) && styles.activeFilterChipText,
                    ]}
                  >
                    {date}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>Sort by</ThemedText>
            <View style={styles.filterChipsContainer}>
              {[
                { id: 'relevance', label: 'Relevance' },
                { id: 'date', label: 'Most recent' },
                { id: 'citations', label: 'Most cited' },
              ].map((sortOption) => (
                <TouchableOpacity
                  key={`sort-${sortOption.id}`}
                  style={[
                    styles.filterChip,
                    sortBy === sortOption.id && styles.activeFilterChip,
                  ]}
                  onPress={() => setSorting(sortOption.id as 'relevance' | 'date' | 'citations')}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      sortBy === sortOption.id && styles.activeFilterChipText,
                    ]}
                  >
                    {sortOption.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setActiveFilters([]);
                setSortBy('relevance');
              }}
            >
              <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => {
                setShowFilters(false);
                if (query) {
                  handleSearch();
                }
              }}
            >
              <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  // Add state for search tips
  const [showSearchTips, setShowSearchTips] = useState(false);

  // Add a function to toggle search tips
  const toggleSearchTips = () => {
    setShowSearchTips(!showSearchTips);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.screenTitle}>Search</ThemedText>
          </View>
          
          {/* Animated Expandable Search Bar */}
          <View style={styles.searchOuterContainer}>
            <Animated.View style={[
              styles.searchContainer, 
              { 
                width: searchBarWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['85%', '100%']
                })
              }
            ]}>
              <View style={styles.searchBar}>
                <Feather name="search" size={20} color={colors.text} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search papers, topics, or authors..."
                  placeholderTextColor="#777"
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={handleSearch}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  returnKeyType="search"
                  autoCapitalize="none"
                />
                {query.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setQuery('')}
                    style={styles.clearButton}
                  >
                    <Feather name="x" size={18} color="#777" />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
            
            {/* Cancel Button - appears when search is focused */}
            <Animated.View style={{ opacity: cancelBtnOpacity }}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancelPress}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {!results.length && !searching ? (
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Recent Searches Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText style={styles.sectionTitle}>Recent Searches</ThemedText>
                {recentSearches.length > 0 && (
                  <TouchableOpacity onPress={clearAllRecentSearches}>
                    <ThemedText style={styles.clearAllText}>Clear All</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
              
              {recentSearches.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Feather name="search" size={24} color="#aaa" />
                  <ThemedText style={styles.emptyStateText}>No recent searches</ThemedText>
                </View>
              ) : (
                recentSearches.map((item, index) => (
                  <View key={`search-${item.query}-${item.timestamp}`} style={styles.recentSearchRow}>
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => {
                        setQuery(item.query);
                        handleSearch();
                      }}
                    >
                      <Feather name="clock" size={16} color="#777" style={styles.suggestionIcon} />
                      <View style={styles.suggestionTextContainer}>
                        <ThemedText style={styles.suggestionText}>{item.query}</ThemedText>
                        <ThemedText style={styles.timestampText}>{formatTimeAgo(item.timestamp)}</ThemedText>
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.removeButton} 
                      onPress={() => removeRecentSearch(item.query)}
                    >
                      <Feather name="x" size={16} color="#aaa" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* Trending Topics Section */}
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Trending Topics</ThemedText>
              <View style={styles.tagsContainer}>
                {[
                  { name: 'Machine Learning', color: '#E6F7FF', textColor: '#0070F3' },
                  { name: 'Climate Science', color: '#E6FFED', textColor: '#05A66B' },
                  { name: 'Quantum Computing', color: '#F3E8FF', textColor: '#6C5CE7' },
                  { name: 'Neuroscience', color: '#FFF3E0', textColor: '#FF9800' },
                  { name: 'Genomics', color: '#FFE0E0', textColor: '#FF4D4F' },
                  { name: 'Renewable Energy', color: '#E6FFFB', textColor: '#13C2C2' },
                  { name: 'AI Ethics', color: '#FFF0F6', textColor: '#EB2F96' },
                  { name: 'COVID-19', color: '#F9F0FF', textColor: '#722ED1' },
                ].map((tag, index) => (
                  <TouchableOpacity
                    key={`topic-${tag.name}`}
                    style={[styles.topicTag, { backgroundColor: tag.color }]}
                    onPress={() => {
                      setQuery(tag.name);
                      handleSearch();
                    }}
                  >
                    <ThemedText style={[styles.topicTagText, { color: tag.textColor }]}>
                      {tag.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Search Tips Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText style={styles.sectionTitle}>Search Tips</ThemedText>
                <TouchableOpacity onPress={toggleSearchTips}>
                  <ThemedText style={styles.clearAllText}>
                    {showSearchTips ? 'Hide' : 'Show'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {showSearchTips && (
                <View style={styles.searchTipsContainer}>
                  <View style={styles.searchTipItem}>
                    <Feather name="hash" size={16} color={Colors.light.primary} style={styles.tipIcon} />
                    <View>
                      <ThemedText style={styles.tipTitle}>Use keywords</ThemedText>
                      <ThemedText style={styles.tipText}>Try "machine learning" or "climate science"</ThemedText>
                    </View>
                  </View>

                  <View style={styles.searchTipItem}>
                    <Feather name="user" size={16} color={Colors.light.primary} style={styles.tipIcon} />
                    <View>
                      <ThemedText style={styles.tipTitle}>Find by author</ThemedText>
                      <ThemedText style={styles.tipText}>Search for "author:Smith" to find papers by Smith</ThemedText>
                    </View>
                  </View>

                  <View style={styles.searchTipItem}>
                    <Feather name="calendar" size={16} color={Colors.light.primary} style={styles.tipIcon} />
                    <View>
                      <ThemedText style={styles.tipTitle}>Filter by year</ThemedText>
                      <ThemedText style={styles.tipText}>Add "year:2023" to find recent papers</ThemedText>
                    </View>
                  </View>

                  <View style={styles.searchTipItem}>
                    <Feather name="file-text" size={16} color={Colors.light.primary} style={styles.tipIcon} />
                    <View>
                      <ThemedText style={styles.tipTitle}>Journal specific</ThemedText>
                      <ThemedText style={styles.tipText}>Use "journal:Nature" to narrow by publication</ThemedText>
                    </View>
                  </View>
                </View>
              )}
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
                {/* Render filter section when there are results */}
                {renderFilterSection()}
                <ThemedText style={styles.resultsHeader}>Articles</ThemedText>
                <FlatList
                  data={results}
                  renderItem={renderResultItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.resultsContainer}
                  numColumns={numColumns}
                  key={`search-results-${numColumns}`}
                  showsVerticalScrollIndicator={false}
                />

                {/* No results component */}
                {!searching && query && results.length === 0 && (
                  <View style={styles.noResultsContainer}>
                    <Feather name="search" size={50} color="#aaa" />
                    <ThemedText style={styles.noResultsTitle}>No results found</ThemedText>
                    <ThemedText style={styles.noResultsText}>
                      We couldn't find any papers matching "{query}"
                    </ThemedText>
                    <View style={styles.noResultsSuggestions}>
                      <ThemedText style={styles.noResultsSubtitle}>Try:</ThemedText>
                      <View style={styles.bulletPoint}>
                        <View style={styles.bullet} />
                        <ThemedText style={styles.noResultsTip}>Using more general keywords</ThemedText>
                      </View>
                      <View style={styles.bulletPoint}>
                        <View style={styles.bullet} />
                        <ThemedText style={styles.noResultsTip}>Check your spelling</ThemedText>
                      </View>
                      <View style={styles.bulletPoint}>
                        <View style={styles.bullet} />
                        <ThemedText style={styles.noResultsTip}>Try a different search term</ThemedText>
                      </View>
                    </View>
                  </View>
                )}

                {/* Error message */}
                {searchError && (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={24} color="#e74c3c" />
                    <ThemedText style={styles.errorText}>{searchError}</ThemedText>
                  </View>
                )}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  searchOuterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  searchContainer: {
    marginTop: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 22,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  cancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 24,
    marginTop: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  clearAllText: {
    color: Colors.light.primary,
    fontSize: 14,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  emptyStateText: {
    color: '#aaa',
    marginTop: 8,
    fontSize: 14,
  },
  recentSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  timestampText: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  removeButton: {
    padding: 10,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  topicTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  topicTagText: {
    fontWeight: '500',
    fontSize: 14,
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  toggleFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleFiltersText: {
    color: Colors.light.primary,
    fontSize: 14,
    marginRight: 4,
  },
  filtersContent: {
    marginTop: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: '#555',
  },
  activeFilterChipText: {
    color: '#fff',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#777',
  },
  applyButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  searchTipsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  searchTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  noResultsSuggestions: {
    alignSelf: 'flex-start',
    width: '100%',
  },
  noResultsSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
    marginRight: 8,
  },
  noResultsTip: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#e74c3c',
    marginLeft: 8,
    flex: 1,
  },
}); 