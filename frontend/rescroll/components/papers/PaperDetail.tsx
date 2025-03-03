import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Define types
interface Author {
  id: string;
  name: string;
  affiliation: string;
  imageUrl?: string;
}

interface Citation {
  id: string;
  title: string;
  authors: string;
  year: string;
  journal: string;
  citationCount: number;
}

export interface PaperDetailProps {
  id: string;
  title: string;
  abstract: string;
  summary: string;
  authors: Author[];
  journal: string;
  year: string;
  doi: string;
  citationCount: number;
  citations: Citation[];
  pdfUrl: string;
  keywords: string[];
  hasAudioSummary?: boolean;
  audioSummaryUrl?: string;
  onClose?: () => void;
}

// Audio Player component for paper summaries
export const AudioPlayer: React.FC<{ audioUrl: string; onClose: () => void }> = ({ 
  audioUrl,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [totalTime, setTotalTime] = useState('2:30'); // Placeholder
  const colorScheme = useColorScheme();

  // Simulate loading and playing
  React.useEffect(() => {
    setIsLoading(true);
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // Simulate progress
    let currentProgress = 0;
    const progressTimer = setInterval(() => {
      if (isPlaying && !isLoading) {
        currentProgress += 0.5;
        if (currentProgress > 100) {
          clearInterval(progressTimer);
          onClose();
          return;
        }
        
        setProgress(currentProgress);
        
        // Update time display
        const totalSeconds = 150; // 2:30 in seconds
        const currentSeconds = Math.floor((currentProgress / 100) * totalSeconds);
        const minutes = Math.floor(currentSeconds / 60);
        const seconds = currentSeconds % 60;
        setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 500);

    return () => {
      clearTimeout(loadTimer);
      clearInterval(progressTimer);
    };
  }, [isPlaying, isLoading, onClose]);

  return (
    <View style={[
      styles.audioPlayer,
      { backgroundColor: colorScheme === 'dark' ? '#222' : '#f5f5f5' }
    ]}>
      <View style={styles.audioPlayerControls}>
        <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} disabled={isLoading}>
          <IconSymbol 
            name={isLoading ? "circle.dotted" : isPlaying ? "pause.circle.fill" : "play.circle.fill"} 
            size={36} 
            color="#3498db" 
          />
        </TouchableOpacity>
        
        <View style={styles.audioProgressContainer}>
          <View style={styles.audioTimes}>
            <ThemedText style={styles.audioTimeText}>{currentTime}</ThemedText>
            <ThemedText style={styles.audioTimeText}>{totalTime}</ThemedText>
          </View>
          <View style={styles.progressBarContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#3498db" />
            ) : (
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress}%` }
                  ]} 
                />
              </View>
            )}
          </View>
        </View>
        
        <TouchableOpacity onPress={onClose}>
          <IconSymbol name="xmark.circle.fill" size={28} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const PaperDetail: React.FC<Partial<PaperDetailProps>> = ({
  title = 'Attention Is All You Need',
  abstract = 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely...',
  summary = 'The paper introduces the Transformer model architecture, which relies entirely on self-attention mechanisms instead of recurrence or convolution. The Transformer uses multi-head attention to jointly attend to information from different representation subspaces. The model achieves state-of-the-art results on English-to-German and English-to-French translation tasks, while being more parallelizable and requiring significantly less time to train than recurrent or convolutional models.',
  authors = [
    { id: '1', name: 'Ashish Vaswani', affiliation: 'Google Brain', imageUrl: 'https://via.placeholder.com/50' },
    { id: '2', name: 'Noam Shazeer', affiliation: 'Google Brain', imageUrl: 'https://via.placeholder.com/50' },
    { id: '3', name: 'Niki Parmar', affiliation: 'Google Research', imageUrl: 'https://via.placeholder.com/50' },
    { id: '4', name: 'Jakob Uszkoreit', affiliation: 'Google Research', imageUrl: 'https://via.placeholder.com/50' },
    { id: '5', name: 'Llion Jones', affiliation: 'Google Research', imageUrl: 'https://via.placeholder.com/50' },
    { id: '6', name: 'Aidan N. Gomez', affiliation: 'University of Toronto', imageUrl: 'https://via.placeholder.com/50' },
    { id: '7', name: 'Łukasz Kaiser', affiliation: 'Google Brain', imageUrl: 'https://via.placeholder.com/50' },
    { id: '8', name: 'Illia Polosukhin', affiliation: 'Google Research', imageUrl: 'https://via.placeholder.com/50' },
  ],
  journal = 'Advances in Neural Information Processing Systems (NeurIPS)',
  year = '2017',
  doi = '10.48550/arXiv.1706.03762',
  citationCount = 78592,
  citations = [
    { id: '1', title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', authors: 'Devlin, J., Chang, M., Lee, K., & Toutanova, K.', year: '2018', journal: 'arXiv preprint', citationCount: 49830 },
    { id: '2', title: 'Deep Residual Learning for Image Recognition', authors: 'He, K., Zhang, X., Ren, S., & Sun, J.', year: '2016', journal: 'CVPR', citationCount: 126141 },
    { id: '3', title: 'GPT-3: Language Models are Few-Shot Learners', authors: 'Brown, T.B., et al.', year: '2020', journal: 'NeurIPS', citationCount: 13589 },
  ],
  pdfUrl = 'https://arxiv.org/pdf/1706.03762.pdf',
  keywords = ['transformer', 'attention', 'neural networks', 'NLP', 'machine translation'],
  hasAudioSummary = true,
  audioSummaryUrl = 'https://example.com/audio/summary.mp3',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'citations'>('summary');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerActions}>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={18} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.iconButton, styles.saveButton]} 
              onPress={() => setIsSaved(!isSaved)}
            >
              <IconSymbol 
                name={isSaved ? "bookmark.fill" : "bookmark"} 
                size={20} 
                color={isSaved ? "#f39c12" : colors.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <IconSymbol name="square.and.arrow.up" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <View style={styles.journalInfo}>
          <ThemedText style={styles.journalText}>{journal} • {year}</ThemedText>
        </View>
        <View style={styles.citationContainer}>
          <IconSymbol name="chart.bar.doc.horizontal" size={16} color="#888" />
          <ThemedText style={styles.citationText}>
            {citationCount.toLocaleString()} citations
          </ThemedText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.authorList}>
          {authors.map(author => (
            <TouchableOpacity key={author.id} style={styles.authorItem}>
              {author.imageUrl ? (
                <Image source={{ uri: author.imageUrl }} style={styles.authorImage} />
              ) : (
                <View style={[styles.authorImage, styles.authorImagePlaceholder]}>
                  <ThemedText style={styles.authorInitial}>
                    {author.name.charAt(0)}
                  </ThemedText>
                </View>
              )}
              <ThemedText style={styles.authorName} numberOfLines={1}>
                {author.name}
              </ThemedText>
              <ThemedText style={styles.authorAffiliation} numberOfLines={1}>
                {author.affiliation}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'summary' ? styles.activeTab : null
            ]}
            onPress={() => setActiveTab('summary')}
          >
            <ThemedText 
              style={[
                styles.tabText, 
                activeTab === 'summary' ? styles.activeTabText : null
              ]}
            >
              Summary
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'citations' ? styles.activeTab : null
            ]}
            onPress={() => setActiveTab('citations')}
          >
            <ThemedText 
              style={[
                styles.tabText, 
                activeTab === 'citations' ? styles.activeTabText : null
              ]}
            >
              Citations
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'summary' ? (
          <View style={styles.summaryTab}>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Abstract</ThemedText>
              <ThemedText style={styles.abstractText}>{abstract}</ThemedText>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <ThemedText style={styles.sectionTitle}>Summary</ThemedText>
                {hasAudioSummary && (
                  <TouchableOpacity 
                    style={styles.audioButton}
                    onPress={() => setIsPlayingAudio(!isPlayingAudio)}
                  >
                    <IconSymbol 
                      name={isPlayingAudio ? "pause.circle" : "play.circle"} 
                      size={20} 
                      color="#3498db" 
                    />
                    <ThemedText style={styles.audioButtonText}>
                      {isPlayingAudio ? 'Pause' : 'Listen'}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
              <ThemedText style={styles.summaryText}>{summary}</ThemedText>
            </View>

            {isPlayingAudio && hasAudioSummary && (
              <View style={styles.audioPlayerContainer}>
                <AudioPlayer 
                  audioUrl={audioSummaryUrl || ''} 
                  onClose={() => setIsPlayingAudio(false)}
                />
              </View>
            )}
            
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Keywords</ThemedText>
              <View style={styles.keywordContainer}>
                {keywords.map((keyword, index) => (
                  <TouchableOpacity key={index} style={styles.keywordBadge}>
                    <ThemedText style={styles.keywordText}>{keyword}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.primaryButton}>
                <IconSymbol name="arrow.down.doc" size={18} color="white" />
                <ThemedText style={styles.primaryButtonText}>Download PDF</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton}>
                <IconSymbol name="quote.bubble" size={18} color="#333" />
                <ThemedText style={styles.secondaryButtonText}>Cite</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.citationsTab}>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Cited by {citationCount.toLocaleString()} papers</ThemedText>
              
              <View style={styles.citationsList}>
                {citations.map(citation => (
                  <TouchableOpacity key={citation.id} style={styles.citationItem}>
                    <ThemedText style={styles.citationTitle}>{citation.title}</ThemedText>
                    <ThemedText style={styles.citationAuthors}>{citation.authors}</ThemedText>
                    <View style={styles.citationMeta}>
                      <ThemedText style={styles.citationJournal}>
                        {citation.journal} ({citation.year})
                      </ThemedText>
                      <View style={styles.citationCount}>
                        <IconSymbol name="quote.bubble" size={12} color="#888" />
                        <ThemedText style={styles.citationCountText}>
                          {citation.citationCount.toLocaleString()}
                        </ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity style={styles.moreButton}>
                <ThemedText style={styles.moreButtonText}>View all citations</ThemedText>
                <IconSymbol name="chevron.right" size={14} color="#3498db" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  journalInfo: {
    marginBottom: 5,
  },
  journalText: {
    fontSize: 14,
    color: '#666',
  },
  citationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  citationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  authorList: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  authorItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 70,
  },
  authorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  authorImagePlaceholder: {
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  authorName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  authorAffiliation: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3498db',
  },
  content: {
    flex: 1,
  },
  summaryTab: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  abstractText: {
    fontSize: 14,
    lineHeight: 22,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 24,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  audioButtonText: {
    fontSize: 12,
    color: '#3498db',
    marginLeft: 5,
  },
  audioPlayerContainer: {
    marginBottom: 20,
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  keywordText: {
    fontSize: 12,
    color: '#3498db',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.5,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  citationsTab: {
    padding: 20,
  },
  citationsList: {
    marginBottom: 15,
  },
  citationItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  citationTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  citationAuthors: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  citationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  citationJournal: {
    fontSize: 12,
    color: '#888',
  },
  citationCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  citationCountText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 3,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  moreButtonText: {
    fontSize: 14,
    color: '#3498db',
    marginRight: 5,
  },
  audioPlayer: {
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  audioPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioProgressContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  audioTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  audioTimeText: {
    fontSize: 12,
    color: '#888',
  },
  progressBarContainer: {
    height: 36,
    justifyContent: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ddd',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 3,
  },
}); 