import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the type for the saved paper items
interface Author {
  id: string;
  name: string;
}

interface SavedPaper {
  id: string;
  title: string;
  summary: string;
  journal?: string;
  year?: string;
  authors: Author[];
  citationCount?: number;
  imageUrl: string;
  date: string;
  keywords?: string[];
}

// Sample data for saved papers
const SAVED_PAPERS: SavedPaper[] = [
  {
    id: 'b1',
    title: 'Transformer Models for Natural Language Processing: A Comprehensive Survey',
    authors: [{ id: 'a7', name: 'James Wilson' }, { id: 'a8', name: 'Emily Zhao' }],
    journal: 'Journal of Artificial Intelligence',
    year: '2023',
    summary: 'This survey explores the evolution and impact of transformer models in NLP, covering recent advances and future directions.',
    date: '2 days ago',
    citationCount: 87,
    keywords: ['transformer', 'NLP', 'deep learning'],
    imageUrl: 'https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'b2',
    title: 'Sustainable Energy Storage Solutions for Renewable Integration',
    authors: [{ id: 'a9', name: 'Michael Tran' }],
    journal: 'Renewable Energy Advances',
    year: '2022',
    summary: 'This paper evaluates novel energy storage technologies for renewable energy integration, with a focus on grid-scale applications.',
    date: '1 week ago',
    citationCount: 52,
    keywords: ['energy storage', 'renewable energy', 'sustainability'],
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'b3',
    title: 'Gene Editing Technologies: Ethical Considerations and Future Directions',
    authors: [{ id: 'a10', name: 'Sarah Johnson' }, { id: 'a11', name: 'Robert Chen' }],
    journal: 'Journal of Bioethics',
    year: '2023',
    summary: 'This analysis examines the ethical implications of advanced gene editing technologies and proposes a framework for responsible research.',
    date: '4 days ago',
    citationCount: 34,
    keywords: ['CRISPR', 'ethics', 'gene editing'],
    imageUrl: 'https://images.unsplash.com/photo-1626750234836-5f6f41e77ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'b4',
    title: 'Advanced Machine Learning Techniques for Climate Prediction',
    authors: [{ id: 'a12', name: 'Alex Chang' }, { id: 'a13', name: 'Priya Patel' }],
    journal: 'Nature Climate Science',
    year: '2023',
    summary: 'A novel approach using ensemble deep learning models to improve long-term climate predictions with significantly reduced uncertainty.',
    date: '3 days ago',
    citationCount: 29,
    keywords: ['machine learning', 'climate science', 'predictive modeling'],
    imageUrl: 'https://images.unsplash.com/photo-1580777361964-27e9cdd2f838?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];

// Define bookmark categories
const BOOKMARK_CATEGORIES = ['All', 'Recent', 'Research', 'Medicine', 'Technology'];

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors.light; // Always use light theme to match other tabs
  
  const screenWidth = Dimensions.get('window').width;

  const filteredPapers = SAVED_PAPERS.filter(paper => 
    paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderBookmarkItem = ({ item }: { item: SavedPaper }) => (
    <TouchableOpacity 
      style={styles.bookmarkCard}
      onPress={() => router.push(`/paper/${item.id}`)}
    >
      <View style={styles.bookmarkContainer}>
        <Image 
          source={{ uri: item.imageUrl }}
          style={styles.bookmarkImage} 
        />
        <View style={styles.bookmarkContent}>
          <ThemedText style={styles.bookmarkTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.bookmarkAuthors} numberOfLines={1}>
            {item.authors.map(author => author.name).join(', ')}
          </ThemedText>
          <View style={styles.bookmarkMeta}>
            <ThemedText style={styles.bookmarkJournal}>
              {item.journal} • {item.year}
            </ThemedText>
            {item.citationCount !== undefined && (
              <View style={styles.citationContainer}>
                <IconSymbol name="star.fill" size={12} color="#FFB800" />
                <ThemedText style={styles.citationText}>{item.citationCount} citations</ThemedText>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.bookmarkActions}>
        <ThemedText style={styles.bookmarkDate}>{item.date}</ThemedText>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.bookmarkAction}>
            <IconSymbol name="square.and.arrow.up" size={20} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookmarkAction}>
            <IconSymbol name="bookmark.fill" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategoryItem,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <ThemedText
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText,
        ]}
      >
        {item}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.screenTitle}>Bookmarks</ThemedText>
          </View>
          
          {/* Search Bar with grey shade styling matching home page */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <IconSymbol name="magnifyingglass" size={16} color="#777" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search bookmarks..."
                placeholderTextColor="#777"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <IconSymbol name="xmark.circle.fill" size={16} color="#777" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Categories Horizontal Scroll */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={BOOKMARK_CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {filteredPapers.length > 0 ? (
          <FlatList
            data={filteredPapers}
            renderItem={renderBookmarkItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <IconSymbol name="bookmark" size={60} color={colors.lightGray} />
            <ThemedText style={styles.emptyText}>No bookmarks found</ThemedText>
            <ThemedText style={styles.emptySubtext}>Papers you save will appear here</ThemedText>
          </View>
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
    paddingBottom: 8,
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
    marginBottom: 8,
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
  categoriesContainer: {
    marginVertical: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryItem: {
    backgroundColor: Colors.light.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  bookmarkCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  bookmarkContainer: {
    flexDirection: 'row',
  },
  bookmarkImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  bookmarkContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  bookmarkTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  bookmarkAuthors: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  bookmarkMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  bookmarkJournal: {
    fontSize: 12,
    color: '#777',
    flex: 1,
  },
  citationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  citationText: {
    fontSize: 11,
    color: '#555',
    marginLeft: 4,
  },
  bookmarkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bookmarkDate: {
    fontSize: 12,
    color: '#777',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  bookmarkAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80, // Extra padding to center the content better
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },
}); 