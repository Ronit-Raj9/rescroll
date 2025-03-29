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
import { useTheme } from '@/contexts/ThemeContext';
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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortingOption, setSortingOption] = useState<'relevance' | 'date' | 'citations'>('relevance');
  const [showSearchTips, setShowSearchTips] = useState(false);
  const [focused, setFocused] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  
  // Get theme colors directly from ThemeContext
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? 'dark' : 'light';
  const colors = Colors[theme];
  
  // Animation values
  const searchWidth = useRef(new Animated.Value(Dimensions.get('window').width - 80)).current;
  const cancelOpacity = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);
  
  const router = useRouter();
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
    setFocused(true);
    Animated.parallel([
      Animated.timing(searchWidth, {
        toValue: 0.85,
        duration: 250,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(cancelOpacity, {
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
      setFocused(false);
      Animated.parallel([
        Animated.timing(searchWidth, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(cancelOpacity, {
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
        const filtered = prev.filter(item => item !== currentQuery);
        // Add to the beginning with current timestamp
        return [currentQuery, ...filtered.slice(0, 9)];
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
    setRecentSearches(prev => prev.filter(item => item !== query));
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

  // Add a function to toggle search tips
  const toggleSearchTips = () => {
    setShowSearchTips(!showSearchTips);
  };

  // Update the styles that depend on theme
  const dynamicStyles = {
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: isDarkMode ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? Colors.dark.border : Colors.light.border,
    },
    searchInput: {
      color: colors.text,
      backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.backgroundTertiary,
    },
    filterButton: {
      backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.backgroundTertiary,
    },
    activeFilterButton: {
      backgroundColor: colors.primary,
    },
    filterButtonText: {
      color: colors.text,
    },
    activeFilterButtonText: {
      color: '#FFF',
    },
    resultCard: {
      backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.background,
      shadowColor: isDarkMode ? '#000' : '#000',
      borderColor: colors.border,
    },
    sectionHeader: {
      color: colors.textSecondary,
    },
    divider: {
      backgroundColor: colors.border,
    },
    searchTipsContainer: {
      backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.background,
      borderColor: colors.border,
    }
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
      backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
      padding: 12,
      backgroundColor: isDarkMode ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? Colors.dark.border : Colors.light.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
      backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
      borderRadius: 20,
      paddingHorizontal: 16,
      color: isDarkMode ? Colors.dark.text : Colors.light.text,
  },
  cancelButtonContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
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
  },
  filterScrollView: {
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    marginBottom: 24,
    marginTop: 10,
  },
  sectionHeaderContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  clearAllText: {
    color: Colors.light.primary,
    fontSize: 14,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  recentSearchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentSearchText: {
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    padding: 10,
  },
  showMoreText: {
    color: Colors.light.primary,
    fontSize: 14,
  },
  searchTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  searchTipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  searchTipContent: {
    flex: 1,
  },
  searchTipTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  searchTipDescription: {
    fontSize: 14,
    color: '#555',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  defaultContent: {
    flex: 1,
  },
  searchTipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  emptyResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyResultsText: {
    color: '#777',
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
  },
  emptyResultsSubText: {
    color: '#555',
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 24,
    marginTop: 10,
  },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: isDarkMode ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? Colors.dark.border : Colors.light.border,
    },
    suggestionText: {
      marginLeft: 12,
      fontSize: 16,
      color: isDarkMode ? Colors.dark.text : Colors.light.text,
    },
  });

  const renderSuggestionItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        { backgroundColor: isDarkMode ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary }
      ]}
      onPress={() => {
        setQuery(item);
        handleSearch();
      }}
    >
      <Feather 
        name="clock" 
        size={16} 
        color={isDarkMode ? Colors.dark.textSecondary : Colors.light.textSecondary} 
      />
      <ThemedText style={styles.suggestionText}>{item}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerTitle: 'Search',
          headerShown: false
        }} 
      />
      
      <SafeAreaView 
        style={{ 
          flex: 1, 
          backgroundColor: colors.background 
        }}
        edges={['top', 'left', 'right']}
      >
        {/* Header with search */}
        <View style={[styles.header, { 
          backgroundColor: colors.background,
          borderBottomColor: colors.border 
        }]}>
          {/* Search section */}
          <View style={styles.searchSection}>
            <Animated.View 
              style={[
                styles.searchContainer, 
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                  width: focused ? '85%' : '100%'
                }
              ]}
            >
              <IconSymbol name="magnifyingglass" size={18} color={colors.icon} />
              <TextInput
                ref={searchInputRef}
                style={[
                  styles.searchInput,
                  { color: colors.text }
                ]}
                placeholder="Search papers, authors, topics..."
                placeholderTextColor={colors.textSecondary}
                value={query}
                onChangeText={setQuery}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </Animated.View>
            
            {/* Cancel button */}
            <Animated.View 
              style={[
                styles.cancelButtonContainer,
                { opacity: cancelOpacity }
              ]}
            >
              <TouchableOpacity 
                onPress={handleCancelPress}
                style={styles.cancelButton}
              >
                <ThemedText style={styles.cancelButtonText}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
        
        {/* Rest of the screen content */}
        <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
          {/* Filter tabs */}
          {query.length > 0 && results.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={[styles.filterScrollView, { borderBottomColor: colors.border }]}
              contentContainerStyle={styles.filterContainer}
            >
              {renderFilterSection()}
            </ScrollView>
          )}
          
          {/* Main content */}
          <View style={[styles.resultsContainer, { backgroundColor: colors.background }]}>
            {searching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : results.length > 0 ? (
              <View style={{ flex: 1 }}>
                {renderFilterSection()}
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.id}
                  renderItem={renderResultItem}
                  contentContainerStyle={{ paddingVertical: 16 }}
                  ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            ) : query.length > 0 ? (
              <View style={styles.emptyResultsContainer}>
                <IconSymbol name="magnifyingglass" size={40} color={colors.textSecondary} />
                <ThemedText style={styles.emptyResultsText}>No results found</ThemedText>
                <ThemedText style={styles.emptyResultsSubText}>
                  Try different keywords or check your search terms
                </ThemedText>
              </View>
            ) : (
              <ScrollView contentContainerStyle={{ paddingTop: 16 }}>
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderContainer}>
                      <ThemedText style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>Recent Searches</ThemedText>
                      <TouchableOpacity onPress={clearAllRecentSearches}>
                        <ThemedText style={styles.clearAllText}>Clear All</ThemedText>
                      </TouchableOpacity>
                    </View>
                    {recentSearches.map((search, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={styles.recentSearchItem}
                        onPress={() => {
                          setQuery(search);
                          handleSearch();
                        }}
                      >
                        <View style={styles.recentSearchLeft}>
                          <Feather name="clock" size={16} color={isDarkMode ? colors.textSecondary : "#777"} />
                          <ThemedText style={styles.recentSearchText}>{search}</ThemedText>
                        </View>
                        <TouchableOpacity 
                          style={styles.removeButton}
                          onPress={() => removeRecentSearch(search)}
                        >
                          <Feather name="x" size={16} color={isDarkMode ? colors.textSecondary : "#999"} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                <View style={styles.section}>
                  <ThemedText style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>Suggested Searches</ThemedText>
                  {SEARCH_SUGGESTIONS.map((suggestion, index) => (
                    renderSuggestionItem({ item: suggestion }))
                  )}
                </View>
                
                <View style={styles.section}>
                  <View style={styles.sectionHeaderContainer}>
                    <ThemedText style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>Search Tips</ThemedText>
                    <TouchableOpacity onPress={toggleSearchTips}>
                      <ThemedText style={styles.showMoreText}>
                        {showSearchTips ? 'Show Less' : 'Show More'}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={[styles.searchTipsContainer, dynamicStyles.searchTipsContainer]}>
                    <View style={styles.searchTipItem}>
                      <View style={[styles.searchTipIcon, { backgroundColor: colors.primaryLight }]}>
                        <Feather name="type" size={16} color={colors.primary} />
                      </View>
                      <View style={styles.searchTipContent}>
                        <ThemedText style={styles.searchTipTitle}>Use quotes for exact phrases</ThemedText>
                        <ThemedText style={styles.searchTipDescription}>
                          Example: "quantum computing"
                        </ThemedText>
                      </View>
                    </View>
                    
                    <View style={[styles.divider, dynamicStyles.divider]} />
                    
                    <View style={styles.searchTipItem}>
                      <View style={[styles.searchTipIcon, { backgroundColor: colors.primaryLight }]}>
                        <Feather name="plus" size={16} color={colors.primary} />
                      </View>
                      <View style={styles.searchTipContent}>
                        <ThemedText style={styles.searchTipTitle}>Combine keywords with AND</ThemedText>
                        <ThemedText style={styles.searchTipDescription}>
                          Example: neural networks AND healthcare
                        </ThemedText>
                      </View>
                    </View>
                    
                    {showSearchTips && (
                      <>
                        <View style={[styles.divider, dynamicStyles.divider]} />
                        
                        <View style={styles.searchTipItem}>
                          <View style={[styles.searchTipIcon, { backgroundColor: colors.primaryLight }]}>
                            <Feather name="minus" size={16} color={colors.primary} />
                          </View>
                          <View style={styles.searchTipContent}>
                            <ThemedText style={styles.searchTipTitle}>Exclude terms with NOT</ThemedText>
                            <ThemedText style={styles.searchTipDescription}>
                              Example: climate change NOT politics
                            </ThemedText>
                          </View>
                        </View>
                        
                        <View style={[styles.divider, dynamicStyles.divider]} />
                        
                        <View style={styles.searchTipItem}>
                          <View style={[styles.searchTipIcon, { backgroundColor: colors.primaryLight }]}>
                            <Feather name="user" size={16} color={colors.primary} />
                          </View>
                          <View style={styles.searchTipContent}>
                            <ThemedText style={styles.searchTipTitle}>Search by author</ThemedText>
                            <ThemedText style={styles.searchTipDescription}>
                              Example: author:"Jane Smith"
                            </ThemedText>
                          </View>
                        </View>
                        
                        <View style={[styles.divider, dynamicStyles.divider]} />
                        
                        <View style={styles.searchTipItem}>
                          <View style={[styles.searchTipIcon, { backgroundColor: colors.primaryLight }]}>
                            <Feather name="calendar" size={16} color={colors.primary} />
                          </View>
                          <View style={styles.searchTipContent}>
                            <ThemedText style={styles.searchTipTitle}>Filter by date range</ThemedText>
                            <ThemedText style={styles.searchTipDescription}>
                              Example: neural networks year:2020-2023
                            </ThemedText>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
} 