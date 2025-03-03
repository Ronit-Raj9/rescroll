import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Sample data for saved papers
const SAVED_PAPERS = [
  {
    id: '1',
    title: 'Attention Is All You Need',
    authors: 'Vaswani, A., et al.',
    journal: 'NeurIPS',
    year: '2017',
    imageUrl: 'https://via.placeholder.com/100',
  },
  {
    id: '2',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: 'Devlin, J., et al.',
    journal: 'NAACL',
    year: '2019',
    imageUrl: 'https://via.placeholder.com/100',
  },
  {
    id: '3',
    title: 'Deep Residual Learning for Image Recognition',
    authors: 'He, K., et al.',
    journal: 'CVPR',
    year: '2016',
    imageUrl: 'https://via.placeholder.com/100',
  },
];

// Sample data for reading history
const READING_HISTORY = [
  {
    id: '4',
    title: 'GPT-3: Language Models are Few-Shot Learners',
    authors: 'Brown, T.B., et al.',
    journal: 'NeurIPS',
    year: '2020',
    lastRead: '2 days ago',
    imageUrl: 'https://via.placeholder.com/100',
  },
  {
    id: '5',
    title: 'Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer',
    authors: 'Raffel, C., et al.',
    journal: 'JMLR',
    year: '2020',
    lastRead: '1 week ago',
    imageUrl: 'https://via.placeholder.com/100',
  },
];

export default function LibraryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');

  const handlePaperPress = (paperId: string) => {
    router.push(`/paper/${paperId}`);
  };

  const renderSavedPaper = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.paperItem}
      onPress={() => handlePaperPress(item.id)}
    >
      <View style={styles.paperImageContainer}>
        <View style={styles.paperImagePlaceholder}>
          <IconSymbol name="doc.text" size={24} color="#ccc" />
        </View>
      </View>
      <View style={styles.paperInfo}>
        <ThemedText style={styles.paperTitle} numberOfLines={2}>{item.title}</ThemedText>
        <ThemedText style={styles.paperAuthors} numberOfLines={1}>{item.authors}</ThemedText>
        <ThemedText style={styles.paperJournal}>{item.journal} • {item.year}</ThemedText>
      </View>
      <TouchableOpacity style={styles.bookmarkButton}>
        <IconSymbol name="bookmark.fill" size={20} color="#3498db" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.paperItem}
      onPress={() => handlePaperPress(item.id)}
    >
      <View style={styles.paperImageContainer}>
        <View style={styles.paperImagePlaceholder}>
          <IconSymbol name="doc.text" size={24} color="#ccc" />
        </View>
      </View>
      <View style={styles.paperInfo}>
        <ThemedText style={styles.paperTitle} numberOfLines={2}>{item.title}</ThemedText>
        <ThemedText style={styles.paperAuthors} numberOfLines={1}>{item.authors}</ThemedText>
        <View style={styles.historyMeta}>
          <ThemedText style={styles.paperJournal}>{item.journal} • {item.year}</ThemedText>
          <ThemedText style={styles.lastRead}>Last read: {item.lastRead}</ThemedText>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <IconSymbol name="ellipsis" size={20} color="#888" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'My Library',
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

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'saved' ? styles.activeTab : null
          ]}
          onPress={() => setActiveTab('saved')}
        >
          <ThemedText 
            style={[
              styles.tabText, 
              activeTab === 'saved' ? styles.activeTabText : null
            ]}
          >
            Saved Papers
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'history' ? styles.activeTab : null
          ]}
          onPress={() => setActiveTab('history')}
        >
          <ThemedText 
            style={[
              styles.tabText, 
              activeTab === 'history' ? styles.activeTabText : null
            ]}
          >
            Reading History
          </ThemedText>
        </TouchableOpacity>
      </View>

      {activeTab === 'saved' ? (
        <FlatList
          data={SAVED_PAPERS}
          renderItem={renderSavedPaper}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol name="bookmark" size={60} color="#ccc" />
              <ThemedText style={styles.emptyText}>No saved papers yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Papers you save will appear here
              </ThemedText>
            </View>
          }
        />
      ) : (
        <FlatList
          data={READING_HISTORY}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol name="clock" size={60} color="#ccc" />
              <ThemedText style={styles.emptyText}>No reading history</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Papers you've read will appear here
              </ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#3498db',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 40,
  },
  paperItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  paperImageContainer: {
    width: 60,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginRight: 15,
    overflow: 'hidden',
  },
  paperImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paperInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  paperTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  paperAuthors: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  paperJournal: {
    fontSize: 12,
    color: '#888',
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastRead: {
    fontSize: 12,
    color: '#3498db',
    fontStyle: 'italic',
  },
  bookmarkButton: {
    padding: 5,
  },
  moreButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
}); 