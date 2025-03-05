import React, { useState, useRef, useCallback } from 'react';
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = SCREEN_HEIGHT - 120; // Allow space for tab bar and header

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

const INITIAL_PAPERS: Paper[] = [
  {
    id: '1',
    title: 'Novel Approaches to Deep Learning for Natural Language Processing',
    authors: 'Johnson, K. and Smith, L.',
    achievement: 'Increased accuracy by 15% over previous state-of-the-art models',
    summary:
      'This research introduces a novel transformer architecture that significantly enhances natural language understanding tasks through improved attention mechanisms and optimized training procedures.',
    imageUrl: 'https://via.placeholder.com/400x600',
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
    imageUrl: 'https://via.placeholder.com/400x600',
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
    imageUrl: 'https://via.placeholder.com/400x600',
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
  const colors = Colors[colorScheme || 'light'];
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const loadMorePapers = useCallback(() => {
    if (isLoading || !hasMoreData) return;
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newPapers = papers.map((paper, index) => ({
        ...paper,
        id: `${papers.length + index + 1}`,
      }));
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

  const navigateToProfile = () => {
    router.push('/profile');
  };

  const navigateToNotifications = () => {
    router.push('/notifications');
  };

  const renderPaperCard = ({ item, index }: { item: Paper; index: number }) => {
    return (
      <View style={[styles.cardContainer, { height: ITEM_HEIGHT }]}>
        <View style={styles.cardContent}>
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
          <View style={styles.overlay}>
            <View style={styles.paperDetails}>
              <View style={styles.achievementContainer}>
                <IconSymbol name="star.fill" size={16} color={colors.primary} />
                <ThemedText style={styles.achievementText}>{item.achievement}</ThemedText>
              </View>

              <ThemedText style={styles.paperTitle} numberOfLines={3}>
                {item.title}
              </ThemedText>
              {/* Author name on the left, more opaque */}
              <ThemedText style={styles.paperAuthors} numberOfLines={1}>
                {item.authors}
              </ThemedText>

              <ThemedText style={styles.paperSummary} numberOfLines={6}>
                {item.summary}
              </ThemedText>
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
                <IconSymbol
                  name="heart"
                  size={22}
                  color={item.isLiked ? colors.primary : '#fff'}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => handleSave(item.id)}>
                <IconSymbol
                  name="bookmark.fill"
                  size={22}
                  color={item.isSaved ? colors.primary : '#fff'}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <IconSymbol name="square.and.arrow.up" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Slightly smaller title */}
            <ThemedText style={styles.screenTitle}>Discover</ThemedText>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={navigateToNotifications}>
                <IconSymbol name="bell" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={navigateToProfile}>
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
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Slightly smaller than before (24 -> 20)
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
  },
  cardContent: {
    flex: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 20,
    justifyContent: 'space-between',
  },
  paperDetails: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 60,
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 96, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  achievementText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
  },
  // Slightly smaller than before (28 -> 24)
  paperTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 30,
  },
  // More opaque (was #ccc, now #eee), left-aligned
  paperAuthors: {
    color: '#cccccc80',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'left',
  },
  paperSummary: {
    color: '#ddd',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  // Moved buttons slightly lower (bottom: 10) and made them smaller
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
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
