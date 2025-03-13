import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// Sample data for saved papers
const SAVED_PAPERS = [
  {
    id: '1',
    title: "Nature's Beauty",
    summary: 'Discover the beauty of nature in this breathtaking article.',
    date: '2 days ago',
    imageUrl: 'https://via.placeholder.com/300x200',
  },
  {
    id: '2',
    title: 'Interior Design Tips',
    summary: 'Explore tips for creating a cozy and stylish living space.',
    date: '1 week ago',
    imageUrl: 'https://via.placeholder.com/300x200',
  },
  {
    id: '3',
    title: 'Gourmet Cooking',
    summary: 'Learn the secrets behind gourmet cooking from top chefs.',
    date: '4 days ago',
    imageUrl: 'https://via.placeholder.com/300x200',
  },
  {
    id: '4',
    title: 'Picnic Ideas',
    summary: 'Ideas for the perfect outdoor picnic with friends.',
    date: '3 days ago',
    imageUrl: 'https://via.placeholder.com/300x200',
  },
];

// Define the type for the saved paper items
interface SavedPaper {
  id: string;
  title: string;
  summary: string;
  date: string;
  imageUrl: string;
}

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme as 'light' | 'dark'];

  const filteredPapers = SAVED_PAPERS.filter(paper => 
    paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBookmarkItem = ({ item }: { item: SavedPaper }) => (
    <View style={styles.bookmarkItem}>
      <View style={styles.bookmarkContent}>
        <ThemedText style={styles.bookmarkTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.bookmarkSummary}>{item.summary}</ThemedText>
        <ThemedText style={styles.bookmarkDate}>Published {item.date}</ThemedText>
        <TouchableOpacity 
          style={styles.readMoreButton}
          onPress={() => router.push(`/paper/${item.id}`)}
        >
          <ThemedText style={styles.readMoreText}>Read More</ThemedText>
        </TouchableOpacity>
      </View>
      <Image 
        source={{ uri: item.imageUrl }}
        style={styles.bookmarkImage}
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <ThemedText style={styles.screenTitle}>Bookmarks</ThemedText>
        
        <View style={styles.searchBarContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bookmarks"
            placeholderTextColor={colors.darkGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ThemedText style={styles.sectionTitle}>Bookmarks</ThemedText>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 16,
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBarContainer: {
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  bookmarkItem: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center',
  },
  bookmarkContent: {
    flex: 1,
    marginRight: 16,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bookmarkSummary: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  bookmarkDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  readMoreButton: {
    backgroundColor: '#FF5A60',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  bookmarkImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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