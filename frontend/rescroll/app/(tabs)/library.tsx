import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Dimensions,
  SectionList,
  Modal,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

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

// Define a folder type
interface BookmarkFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSmartFolder: boolean;
  papers: SavedPaper[];
}

// Replace the bookmark categories with smart folders
const BOOKMARK_FOLDERS: BookmarkFolder[] = [
  {
    id: 'all',
    name: 'All Bookmarks',
    icon: 'bookmark',
    color: '#3498db',
    isSmartFolder: true,
    papers: [] // This will be populated dynamically
  },
  {
    id: 'recent',
    name: 'Recent',
    icon: 'clock',
    color: '#2ecc71',
    isSmartFolder: true,
    papers: [] // This will be populated with papers from last 7 days
  },
  {
    id: 'highly-cited',
    name: 'Highly Cited',
    icon: 'award',
    color: '#f39c12',
    isSmartFolder: true,
    papers: [] // This will be populated with papers that have high citation counts
  },
  {
    id: 'medicine',
    name: 'Medicine',
    icon: 'heart',
    color: '#e74c3c',
    isSmartFolder: false,
    papers: [] // This will be populated with papers tagged as medicine
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: 'cpu',
    color: '#9b59b6',
    isSmartFolder: false,
    papers: [] // This will be populated with papers tagged as technology
  },
];

export default function LibraryScreen() {
  const [activeSection, setActiveSection] = useState('collections');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  // Get theme colors directly from ThemeContext
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? 'dark' : 'light';
  const colors = Colors[theme];
  
  // Filter saved papers based on search query
  const filteredBookmarks = useMemo(() => 
    SAVED_PAPERS.filter(paper => 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some(author => 
        author.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ), 
    [searchQuery]
  );
  
  // Create structured folder data
  const folders = useMemo(() => {
    const isRecent = (date: string): boolean => {
      const now = new Date();
      const paperDate = new Date(date);
      const diffTime = Math.abs(now.getTime() - paperDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    };
    
    const isHighlyCited = (citationCount?: number): boolean => {
      return (citationCount || 0) > 50;
    };
    
    const categorizeByKeyword = (paper: SavedPaper, category: string): boolean => {
      const categoryKeywords: Record<string, string[]> = {
        'AI & Machine Learning': ['AI', 'machine learning', 'deep learning', 'neural', 'NLP', 'computer vision'],
        'Climate & Energy': ['climate', 'energy', 'renewable', 'sustainability', 'environment'],
        'Biology & Health': ['gene', 'biology', 'health', 'medicine', 'CRISPR', 'virus'],
      };
      
      return (paper.keywords || []).some(keyword => 
        categoryKeywords[category]?.some(catKeyword => 
          keyword.toLowerCase().includes(catKeyword.toLowerCase())
        )
      );
    };
    
    // Generate "smart" folders based on content
    return [
      {
        id: 'all',
        name: 'All Papers',
        icon: 'archive',
        color: '#6366F1',
        isSmartFolder: true,
        papers: SAVED_PAPERS,
      },
      {
        id: 'recent',
        name: 'Recently Saved',
        icon: 'clock',
        color: '#22C55E',
        isSmartFolder: true,
        papers: SAVED_PAPERS.filter(paper => isRecent(paper.date)),
      },
      {
        id: 'cited',
        name: 'Highly Cited',
        icon: 'bar-chart-2',
        color: '#F59E0B',
        isSmartFolder: true,
        papers: SAVED_PAPERS.filter(paper => isHighlyCited(paper.citationCount)),
      },
      {
        id: 'ml',
        name: 'AI & Machine Learning',
        icon: 'cpu',
        color: '#7C3AED',
        isSmartFolder: true,
        papers: SAVED_PAPERS.filter(paper => categorizeByKeyword(paper, 'AI & Machine Learning')),
      },
      {
        id: 'climate',
        name: 'Climate & Energy',
        icon: 'sun',
        color: '#10B981',
        isSmartFolder: true,
        papers: SAVED_PAPERS.filter(paper => categorizeByKeyword(paper, 'Climate & Energy')),
      },
      {
        id: 'bio',
        name: 'Biology & Health',
        icon: 'activity',
        color: '#EF4444',
        isSmartFolder: true,
        papers: SAVED_PAPERS.filter(paper => categorizeByKeyword(paper, 'Biology & Health')),
      },
      // User-created folders would be added here
    ];
  }, []);
  
  const addNewFolder = () => {
    if (newFolderName.trim()) {
      // Would update state or make API call in a real app
      setNewFolderName('');
      setShowFolderModal(false);
    }
  };
  
  const renderCollectionItem = ({ item }: { item: BookmarkFolder }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.folderItem, 
          { backgroundColor: isDarkMode ? colors.backgroundSecondary : '#FFF' }
        ]} 
        onPress={() => {
          // Use a simpler navigation approach
          router.push('/(tabs)');
        }}
      >
        <View style={[styles.folderIconContainer, { backgroundColor: item.color }]}>
          <Feather name={item.icon as any} size={20} color="#FFF" />
        </View>
        <View style={styles.folderInfo}>
          <ThemedText style={styles.folderName}>{item.name}</ThemedText>
          <ThemedText style={[styles.folderCount, { color: isDarkMode ? colors.textSecondary : '#666' }]}>
            {item.papers.length} papers
          </ThemedText>
        </View>
        <Feather 
          name="chevron-right" 
          size={20} 
          color={isDarkMode ? colors.textSecondary : '#999'} 
        />
      </TouchableOpacity>
    );
  };
  
  const renderBookmarkItem = ({ item }: { item: SavedPaper }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.bookmarkItem, 
          { backgroundColor: isDarkMode ? colors.backgroundSecondary : '#FFF' }
        ]} 
        onPress={() => {
          // Use a simpler navigation approach
          router.push('/(tabs)');
        }}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.bookmarkImage} />
        <View style={styles.bookmarkInfo}>
          <ThemedText style={styles.bookmarkTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          
          <ThemedText style={[styles.bookmarkAuthors, { color: isDarkMode ? colors.textSecondary : '#666' }]} numberOfLines={1}>
            {item.authors.map(a => a.name).join(', ')}
          </ThemedText>
          
          <View style={styles.bookmarkMeta}>
            <View style={styles.metaItem}>
              <Feather 
                name="file-text" 
                size={14} 
                color={isDarkMode ? colors.textSecondary : '#666'} 
                style={styles.metaIcon} 
              />
              <ThemedText style={[styles.metaText, { color: isDarkMode ? colors.textSecondary : '#666' }]}>
                {item.journal || 'Journal'}
              </ThemedText>
            </View>
            
            <View style={styles.metaItem}>
              <Feather 
                name="clock" 
                size={14} 
                color={isDarkMode ? colors.textSecondary : '#666'} 
                style={styles.metaIcon} 
              />
              <ThemedText style={[styles.metaText, { color: isDarkMode ? colors.textSecondary : '#666' }]}>
                {item.date}
              </ThemedText>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.bookmarkMore}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Feather 
            name="more-vertical" 
            size={20} 
            color={isDarkMode ? colors.textSecondary : '#999'} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { 
          backgroundColor: colors.background,
          borderBottomColor: colors.border 
        }]}>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Library</ThemedText>
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeSection === 'collections' && [
                styles.activeTab,
                { borderBottomColor: colors.primary }
              ]
            ]}
            onPress={() => setActiveSection('collections')}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeSection === 'collections' && [
                  styles.activeTabText,
                  { color: colors.primary }
                ]
              ]}
            >
              Collections
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeSection === 'saved' && [
                styles.activeTab,
                { borderBottomColor: colors.primary }
              ]
            ]}
            onPress={() => setActiveSection('saved')}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeSection === 'saved' && [
                  styles.activeTabText,
                  { color: colors.primary }
                ]
              ]}
            >
              Saved Papers
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        {activeSection === 'collections' ? (
          <View style={styles.content}>
            <FlatList
              data={folders}
              renderItem={renderCollectionItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.folderList}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                <TouchableOpacity 
                  style={[
                    styles.addFolderButton, 
                    { 
                      backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.backgroundTertiary,
                      borderColor: colors.border 
                    }
                  ]} 
                  onPress={() => setShowFolderModal(true)}
                >
                  <Feather 
                    name="plus" 
                    size={20} 
                    color={colors.text}
                  />
                  <ThemedText style={styles.addFolderText}>
                    Create New Collection
                  </ThemedText>
                </TouchableOpacity>
              }
            />
          </View>
        ) : (
          <View style={styles.content}>
            <FlatList
              data={filteredBookmarks}
              renderItem={renderBookmarkItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.bookmarkList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Feather 
                    name="bookmark" 
                    size={50} 
                    color={isDarkMode ? 'rgba(255,255,255,0.2)' : '#DDD'} 
                  />
                  <ThemedText style={styles.emptyStateTitle}>
                    No saved papers
                  </ThemedText>
                  <ThemedText style={[styles.emptyStateText, { color: isDarkMode ? colors.textSecondary : '#666' }]}>
                    Your saved papers will appear here. Tap the bookmark icon on any paper to save it.
                  </ThemedText>
                </View>
              }
            />
          </View>
        )}
        
        {/* New Folder Modal */}
        <Modal
          visible={showFolderModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFolderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContainer, 
              { backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.background }
            ]}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Create New Collection</ThemedText>
              
              <TextInput
                style={[
                  styles.folderInput,
                  { 
                    color: colors.text,
                    backgroundColor: isDarkMode ? colors.backgroundTertiary : colors.backgroundTertiary,
                    borderColor: colors.border
                  }
                ]}
                placeholder="Folder name"
                placeholderTextColor={colors.textTertiary}
                value={newFolderName}
                onChangeText={setNewFolderName}
                autoFocus
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton, 
                    styles.cancelButton,
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setShowFolderModal(false)}
                >
                  <ThemedText style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.createButton,
                    { backgroundColor: colors.primary }
                  ]}
                  onPress={addNewFolder}
                >
                  <ThemedText style={styles.createButtonText}>Create</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 8,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#6366F1',
  },
  content: {
    flex: 1,
  },
  folderList: {
    padding: 8,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  folderIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  folderName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  folderCount: {
    fontSize: 14,
    color: '#666',
  },
  bookmarkList: {
    padding: 8,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  bookmarkImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookmarkAuthors: {
    fontSize: 14,
    color: '#666',
  },
  bookmarkMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  bookmarkMore: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  folderInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginLeft: 12,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    backgroundColor: '#6366F1',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  addFolderButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFolderText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 