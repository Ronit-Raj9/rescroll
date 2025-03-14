import React, { useState, useRef, useCallback, useContext } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { AppContext } from '../../app/_layout';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = SCREEN_HEIGHT - 150; // Adjust to allow more space for tab bar and header

interface Paper {
  id: string;
  title: string;
  authors: string;
  achievement: string;
  summary: string;
  imageUrl: string;
  likes: number;
  saves: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
}

// Add these high-quality fallback images
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1518818608552-195ed130cda4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80';

// Create a separate PaperCard component to use hooks properly
const PaperCard = ({ 
  item, 
  onLike, 
  onSave,
  itemHeight 
}: { 
  item: Paper;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  itemHeight: number;
}) => {
  const [imageError, setImageError] = useState(false);
  const colors = Colors.light;
  
  return (
    <View style={[styles.cardContainer, { height: itemHeight }]}>
      <View style={styles.cardContent}>
        <View style={styles.imagePlaceholder} />
        <Image 
          source={{ uri: imageError ? FALLBACK_IMAGE : item.imageUrl }}
          style={styles.cardImage} 
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        <View style={styles.overlay}>
          <View style={styles.paperDetails}>
            <View style={styles.achievementContainer}>
              <IconSymbol name="star.fill" size={14} color={colors.primary} />
              <ThemedText style={styles.achievementText}>{item.achievement}</ThemedText>
            </View>

            <ThemedText style={styles.paperTitle} numberOfLines={2}>
              {item.title}
            </ThemedText>
            <ThemedText style={styles.paperAuthors} numberOfLines={1}>
              {item.authors}
            </ThemedText>

            <ThemedText style={styles.paperSummary} numberOfLines={7}>
              {item.summary}
            </ThemedText>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => onLike(item.id)}>
              <IconSymbol
                name="heart"
                size={20}
                color={item.isLiked ? colors.primary : '#555'}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => onSave(item.id)}>
              <IconSymbol
                name="bookmark.fill"
                size={20}
                color={item.isSaved ? colors.primary : '#555'}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol name="square.and.arrow.up" size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// Update the INITIAL_PAPERS with better image URLs
const INITIAL_PAPERS: Paper[] = [
  {
    id: '1',
    title: 'Novel Approaches to Deep Learning for Natural Language Processing',
    authors: 'Johnson, K. and Smith, L.',
    achievement: 'Increased accuracy by 15% over previous state-of-the-art models',
    summary:
      'This research introduces a novel transformer architecture that significantly enhances natural language understanding tasks through improved attention mechanisms and optimized training procedures.',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    likes: 342,
    saves: 89,
    comments: 27,
    isLiked: false,
    isSaved: false,
  },
  {
    id: '2',
    title: 'Climate Change Impacts on Marine Ecosystems',
    authors: 'Rivera, M. and Chen, H.',
    achievement: 'First comprehensive study of polar ecosystem changes',
    summary:
      'This paper documents significant shifts in marine biodiversity patterns across polar regions as a result of climate change, with implications for global fisheries and conservation efforts.',
    imageUrl: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    likes: 287,
    saves: 122,
    comments: 19,
    isLiked: false,
    isSaved: false,
  },
  {
    id: '3',
    title: 'Advances in Quantum Computing Algorithms',
    authors: 'Patel, A. and Wong, S.',
    achievement: 'Demonstrated 200x speedup for specific optimization problems',
    summary:
      'This work presents a new class of quantum algorithms that provide exponential speedup for certain optimization problems, potentially revolutionizing computational approaches to drug discovery and materials science.',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    likes: 412,
    saves: 156,
    comments: 42,
    isLiked: false,
    isSaved: false,
  },
];

export default function HomeScreen() {
  const [papers, setPapers] = useState<Paper[]>(INITIAL_PAPERS);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [viewIndex, setViewIndex] = useState(0);
  const colorScheme = useColorScheme();
  const colors = Colors.light; // Always use light theme
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { navigateTo } = useContext(AppContext);

  const loadMorePapers = useCallback(() => {
    if (isLoading || !hasMoreData) return;
    setIsLoading(true);

    // Collection of AI-generated science images with higher quality
    const aiGeneratedImages = [
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1624969862293-b749659a90b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80'
    ];

    // Simulate API call
    setTimeout(() => {
      const newPapers = papers.map((paper, index) => {
        // Select a random image from the collection for each new paper
        const randomImageIndex = Math.floor(Math.random() * aiGeneratedImages.length);
        
        return {
          ...paper,
          id: `${papers.length + index + 1}`,
          imageUrl: aiGeneratedImages[randomImageIndex],
        };
      });
      setPapers([...papers, ...newPapers]);
      setIsLoading(false);

      if (papers.length > 15) {
        setHasMoreData(false);
      }
    }, 1500);
  }, [papers, isLoading, hasMoreData]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setViewIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 90,
  };

  const handleLike = (paperId: string) => {
    setPapers((prevPapers) =>
      prevPapers.map((paper) =>
        paper.id === paperId
          ? {
              ...paper,
              isLiked: !paper.isLiked,
              likes: paper.isLiked ? paper.likes - 1 : paper.likes + 1,
            }
          : paper
      )
    );
  };

  const handleSave = (paperId: string) => {
    setPapers((prevPapers) =>
      prevPapers.map((paper) =>
        paper.id === paperId
          ? {
              ...paper,
              isSaved: !paper.isSaved,
              saves: paper.isSaved ? paper.saves - 1 : paper.saves + 1,
            }
          : paper
      )
    );
  };

  const navigateToNotifications = () => {
    router.push('/notifications');
  };

  const navigateToProfile = () => {
    navigateTo('/profile-settings');
  };

  // Update renderItem to use the separate PaperCard component
  const renderPaperCard = ({ item }: { item: Paper }) => {
    return (
      <PaperCard 
        item={item} 
        onLike={handleLike} 
        onSave={handleSave} 
        itemHeight={ITEM_HEIGHT}
      />
    );
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>Loading more papers...</ThemedText>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="doc.text" size={60} color={colors.lightGray} />
      <ThemedText style={styles.emptyText}>No papers available</ThemedText>
      <ThemedText style={styles.emptySubtext}>Check back later for new research</ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.screenTitle}>ReScroll</ThemedText>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={navigateToNotifications}
              >
                <IconSymbol name="bell" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={navigateToProfile}
              >
                <IconSymbol name="person.circle" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={papers}
          renderItem={renderPaperCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          onEndReached={loadMorePapers}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyList}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
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
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  cardContainer: {
    width: SCREEN_WIDTH,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  cardContent: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f0f0f0', // Light background for when images don't load
    overflow: 'hidden',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e0e0e0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    justifyContent: 'space-between',
    borderRadius: 20,
  },
  paperDetails: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 60,
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementText: {
    color: '#333',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  paperTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  paperAuthors: {
    color: '#eee',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'left',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  paperSummary: {
    color: '#f0f0f0',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    textAlign: 'center',
  },
});
