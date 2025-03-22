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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('all');
  const [isCreateBookmarkModalVisible, setIsCreateBookmarkModalVisible] = useState(false);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
  const [folders, setFolders] = useState<BookmarkFolder[]>(BOOKMARK_FOLDERS);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors.light; // Always use light theme to match other tabs
  
  const screenWidth = Dimensions.get('window').width;
  const numColumns = 2; // Number of columns in the grid

  // Organize papers into smart folders based on criteria
  const organizedFolders = useMemo(() => {
    // Helper function to determine if a paper is recent (within last 7 days)
    const isRecent = (date: string): boolean => {
      if (date.includes('day')) {
        const days = parseInt(date.split(' ')[0]);
        return days <= 7;
      }
      return false;
    };

    // Helper function to determine if a paper is highly cited (more than 30 citations)
    const isHighlyCited = (citationCount?: number): boolean => {
      return citationCount !== undefined && citationCount > 30;
    };

    // Helper function to categorize papers by keyword
    const categorizeByKeyword = (paper: SavedPaper, category: string): boolean => {
      if (!paper.keywords) return false;
      
      const keywordMap: Record<string, string[]> = {
        'medicine': ['medicine', 'health', 'bioethics', 'gene', 'CRISPR'],
        'technology': ['technology', 'machine learning', 'transformer', 'deep learning', 'AI'],
      };
      
      return paper.keywords.some(keyword => 
        keywordMap[category]?.some(catKey => 
          keyword.toLowerCase().includes(catKey.toLowerCase())
        )
      );
    };
    
    // Start with a copy of the folder structure
    return folders.map(folder => {
      // Create a new folder object to avoid mutating the original
      const updatedFolder = { ...folder, papers: [] as SavedPaper[] };
      
      // Fill each folder based on its criteria
      if (folder.id === 'all') {
        updatedFolder.papers = SAVED_PAPERS;
      } else if (folder.id === 'recent') {
        updatedFolder.papers = SAVED_PAPERS.filter(paper => isRecent(paper.date));
      } else if (folder.id === 'highly-cited') {
        updatedFolder.papers = SAVED_PAPERS.filter(paper => isHighlyCited(paper.citationCount));
      } else if (folder.id === 'medicine') {
        updatedFolder.papers = SAVED_PAPERS.filter(paper => categorizeByKeyword(paper, 'medicine'));
      } else if (folder.id === 'technology') {
        updatedFolder.papers = SAVED_PAPERS.filter(paper => categorizeByKeyword(paper, 'technology'));
      }
      
      // Filter papers if there's a search query
      if (searchQuery) {
        updatedFolder.papers = updatedFolder.papers.filter(paper => 
          paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paper.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paper.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      return updatedFolder;
    });
  }, [searchQuery, folders]);

  // Function to add a new bookmark
  const addNewBookmark = () => {
    if (newBookmarkTitle.trim()) {
      // In a real app, this would create an actual bookmark
      // For now we just close the modal
      setNewBookmarkTitle('');
      setNewBookmarkUrl('');
      setIsCreateBookmarkModalVisible(false);
    }
  };

  // Render a collection item (folder)
  const renderCollectionItem = ({ item }: { item: BookmarkFolder }) => {
    const paperCount = organizedFolders.find(f => f.id === item.id)?.papers.length || 0;
    const paperImages = organizedFolders.find(f => f.id === item.id)?.papers.slice(0, 4).map(p => p.imageUrl) || [];
    
    return (
      <TouchableOpacity
        style={styles.collectionItem}
        onPress={() => setSelectedFolderId(item.id)}
      >
        <View style={styles.collectionPreview}>
          {paperImages.length > 0 ? (
            <View style={styles.previewGrid}>
              {paperImages.slice(0, Math.min(4, paperImages.length)).map((imgUrl, idx) => (
                <Image 
                  key={idx}
                  source={{ uri: imgUrl }}
                  style={styles.previewImage}
                />
              ))}
              {/* Fill empty spaces if needed */}
              {Array.from({ length: Math.max(0, 4 - paperImages.length) }).map((_, idx) => (
                <View key={`empty-${idx}`} style={[styles.previewImage, styles.emptyPreview]} />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyCollectionIcon, { backgroundColor: item.color }]}>
              <Feather name={item.icon as React.ComponentProps<typeof Feather>['name']} size={30} color="#fff" />
            </View>
          )}
        </View>
        <ThemedText style={styles.collectionName}>{item.name}</ThemedText>
      </TouchableOpacity>
    );
  };

  // Render a bookmark item in the grid
  const renderBookmarkItem = ({ item }: { item: SavedPaper }) => {
    return (
      <TouchableOpacity 
        style={styles.bookmarkGridItem}
        onPress={() => {
          // Navigate to paper detail view when implemented
          // router.push(`/paper/${item.id}`);
        }}
      >
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.bookmarkGridImage}
        />
        <View style={styles.bookmarkGridOverlay}>
          <ThemedText style={styles.bookmarkGridTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="chevron-left" size={24} color="#000" />
            </TouchableOpacity>
            <ThemedText style={styles.screenTitle}>Saved</ThemedText>
            <TouchableOpacity onPress={() => setIsCreateBookmarkModalVisible(true)}>
              <Feather name="plus" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.contentContainer}>
          {/* Collections/Folders Section */}
          <View style={styles.sectionContainer}>
            <FlatList
              data={folders}
              renderItem={renderCollectionItem}
              keyExtractor={item => item.id}
              numColumns={2}
              key="folders-grid"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.collectionsGrid}
              scrollEnabled={false}
            />
          </View>
          
          {/* Selected Collection Papers - Only show if a collection is selected */}
          {selectedFolderId !== 'all' && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>{
                  folders.find(f => f.id === selectedFolderId)?.name || 'All Posts'
                }</ThemedText>
              </View>
              
              {organizedFolders.find(f => f.id === selectedFolderId)?.papers.length ? (
                <FlatList
                  data={organizedFolders.find(f => f.id === selectedFolderId)?.papers || []}
                  renderItem={renderBookmarkItem}
                  keyExtractor={item => item.id}
                  numColumns={2}
                  key={`folder-papers-${selectedFolderId}`}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.bookmarksGrid}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyBookmarksContainer}>
                  <Feather name="bookmark" size={60} color="#ddd" />
                  <ThemedText style={styles.emptyBookmarksText}>
                    No saved bookmarks
                  </ThemedText>
                </View>
              )}
            </View>
          )}
          
          {/* All Posts (Default) - Show all bookmarks when no specific collection is selected */}
          {selectedFolderId === 'all' && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>All Posts</ThemedText>
              </View>
              
              {SAVED_PAPERS.length > 0 ? (
                <FlatList
                  data={SAVED_PAPERS}
                  renderItem={renderBookmarkItem}
                  keyExtractor={item => item.id}
                  numColumns={2}
                  key="all-papers-grid"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.bookmarksGrid}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyBookmarksContainer}>
                  <Feather name="bookmark" size={60} color="#ddd" />
                  <ThemedText style={styles.emptyBookmarksText}>
                    No saved bookmarks
                  </ThemedText>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Create Bookmark Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isCreateBookmarkModalVisible}
          onRequestClose={() => setIsCreateBookmarkModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>Add New Bookmark</ThemedText>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Title"
                value={newBookmarkTitle}
                onChangeText={setNewBookmarkTitle}
                autoFocus
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="URL or DOI"
                value={newBookmarkUrl}
                onChangeText={setNewBookmarkUrl}
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setIsCreateBookmarkModalVisible(false)}
                >
                  <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalPrimaryButton]}
                  onPress={addNewBookmark}
                >
                  <ThemedText style={styles.modalPrimaryButtonText}>Save</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  collectionsGrid: {
    paddingHorizontal: 8,
  },
  collectionItem: {
    width: Dimensions.get('window').width / 2 - 16,
    margin: 8,
    alignItems: 'center',
  },
  collectionPreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: '50%',
    height: '50%',
  },
  emptyPreview: {
    backgroundColor: '#e0e0e0',
  },
  emptyCollectionIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
  },
  collectionName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  bookmarksGrid: {
    paddingHorizontal: 8,
  },
  bookmarkGridItem: {
    width: Dimensions.get('window').width / 2 - 16,
    height: 200,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  bookmarkGridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookmarkGridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
  },
  bookmarkGridTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyBookmarksContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBookmarksText: {
    marginTop: 16,
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
  modalContent: {
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
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
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
  modalButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalPrimaryButton: {
    backgroundColor: Colors.light.primary,
  },
  modalPrimaryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
}); 