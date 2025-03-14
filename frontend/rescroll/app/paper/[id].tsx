import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { PaperDetail, PaperDetailProps } from '@/components/papers/PaperDetail';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

// Mock data fetching function - in a real app, this would be an API call
const fetchPaperDetails = async (id: string): Promise<Partial<PaperDetailProps>> => {
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data for demo purposes
  return {
    id,
    title: 'Attention Is All You Need',
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely...',
    summary: 'The paper introduces the Transformer model architecture, which relies entirely on self-attention mechanisms instead of recurrence or convolution. The Transformer uses multi-head attention to jointly attend to information from different representation subspaces. The model achieves state-of-the-art results on English-to-German and English-to-French translation tasks, while being more parallelizable and requiring significantly less time to train than recurrent or convolutional models.',
    authors: [
      { id: '1', name: 'Ashish Vaswani', affiliation: 'Google Brain', imageUrl: 'https://via.placeholder.com/50' },
      { id: '2', name: 'Noam Shazeer', affiliation: 'Google Brain', imageUrl: 'https://via.placeholder.com/50' },
      { id: '3', name: 'Niki Parmar', affiliation: 'Google Research', imageUrl: 'https://via.placeholder.com/50' },
      { id: '4', name: 'Jakob Uszkoreit', affiliation: 'Google Research', imageUrl: 'https://via.placeholder.com/50' },
      { id: '5', name: 'Llion Jones', affiliation: 'Google Research', imageUrl: 'https://via.placeholder.com/50' },
      { id: '6', name: 'Aidan N. Gomez', affiliation: 'University of Toronto', imageUrl: 'https://via.placeholder.com/50' },
      { id: '7', name: 'Łukasz Kaiser', affiliation: 'Google Brain', imageUrl: 'https://via.placeholder.com/50' },
      { id: '8', name: 'Illia Polosukhin', affiliation: 'Google Research', imageUrl: 'https://via.placeholder.com/50' },
    ],
    journal: 'Advances in Neural Information Processing Systems (NeurIPS)',
    year: '2017',
    doi: '10.48550/arXiv.1706.03762',
    citationCount: 78592,
    citations: [
      { id: '1', title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', authors: 'Devlin, J., Chang, M., Lee, K., & Toutanova, K.', year: '2018', journal: 'arXiv preprint', citationCount: 49830 },
      { id: '2', title: 'Deep Residual Learning for Image Recognition', authors: 'He, K., Zhang, X., Ren, S., & Sun, J.', year: '2016', journal: 'CVPR', citationCount: 126141 },
      { id: '3', title: 'GPT-3: Language Models are Few-Shot Learners', authors: 'Brown, T.B., et al.', year: '2020', journal: 'NeurIPS', citationCount: 13589 },
    ],
    pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
    keywords: ['transformer', 'attention', 'neural networks', 'NLP', 'machine translation'],
    hasAudioSummary: true,
    audioSummaryUrl: 'https://example.com/audio/summary.mp3',
  };
};

export default function PaperDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [paperDetails, setPaperDetails] = useState<Partial<PaperDetailProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaperDetails = async () => {
      try {
        if (!id) {
          throw new Error('Paper ID is required');
        }
        
        setIsLoading(true);
        const details = await fetchPaperDetails(id);
        setPaperDetails(details);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load paper details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaperDetails();
  }, [id]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false, 
          animation: 'slide_from_right',
        }} 
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <ThemedText style={styles.loadingText}>Loading paper details...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
        </View>
      ) : paperDetails ? (
        <PaperDetail {...paperDetails} />
      ) : (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>No paper details found</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#e74c3c',
  },
}); 