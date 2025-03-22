import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  TouchableOpacity, 
  Image, 
  FlatList,
  Dimensions,
  Animated,
  Easing,
  useWindowDimensions
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

// Add type definitions at the top of the file
interface Report {
  id: string;
  title: string;
  authors: string;
  date: string;
  snippet: string;
  imageUrl: string;
  citations: number;
  likes: number;
  journal?: string;
  abstract?: string;
}

// Updated tab categories that match the design document
const TOP_CATEGORIES = [
  { id: '1', name: 'Trending', icon: 'trending-up' },
  { id: '2', name: 'Most Cited', icon: 'bar-chart-2' },
  { id: '3', name: 'Recent', icon: 'clock' },
  { id: '4', name: 'For You', icon: 'user' },
];

// Updated sample trending reports data to include the journal and abstract field
const TRENDING_REPORTS: Report[] = [
  {
    id: '1',
    title: 'Advancements in Quantum Machine Learning',
    authors: 'Dr. Emily Chen, Prof. Robert Williams',
    date: '2023-11-10',
    snippet: 'This paper explores the intersection of quantum computing and machine learning, demonstrating significant performance improvements...',
    abstract: 'Quantum machine learning represents a promising frontier where quantum computing principles enhance traditional machine learning algorithms. This research demonstrates how quantum algorithms can provide exponential speedup for specific machine learning tasks, particularly in pattern recognition and data classification. Our experiments show a 72% improvement in computational efficiency compared to classical methods, with implications for large-scale data processing applications.',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    citations: 48,
    likes: 235,
    journal: 'Nature Quantum Information',
  },
  {
    id: '2',
    title: 'Climate Change Effects on Marine Ecosystems',
    authors: 'Dr. Sarah Johnson, Dr. Michael Davis',
    date: '2023-10-28',
    snippet: 'A comprehensive analysis of how rising ocean temperatures are affecting marine biodiversity and ecosystem balance...',
    abstract: 'This research presents findings from a 5-year study on the impact of rising ocean temperatures on marine biodiversity. We analyze data from over 200 coastal regions, documenting shifts in species distribution, migration patterns, and ecosystem dynamics. The results indicate that even a 1.5°C increase in ocean temperature can lead to significant disruption of marine food webs, with cascading effects on dependent coastal communities and economies.',
    imageUrl: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    citations: 37,
    likes: 198,
    journal: 'Science Advances',
  },
  {
    id: '3',
    title: 'Neuroplasticity in Adult Learning',
    authors: 'Prof. Anna Kim, Dr. James Wilson',
    date: '2023-11-05',
    snippet: 'This study reveals new findings about the brain\'s capacity to reorganize and adapt during adult learning processes...',
    abstract: 'Contrary to traditional beliefs about reduced neuroplasticity in adulthood, our research demonstrates significant neural adaptation capabilities in adults aged 40-65 when engaging in structured learning activities. Using advanced neuroimaging techniques, we observed measurable changes in neural connectivity patterns after just 8 weeks of intensive learning. These findings have implications for educational approaches, cognitive rehabilitation, and prevention of age-related cognitive decline.',
    imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    citations: 29,
    likes: 176,
    journal: 'Neuroscience',
  },
];

// Sample most cited reports data
const MOST_CITED_REPORTS: Report[] = [
  {
    id: '1',
    title: 'Breakthrough in CRISPR Gene Editing Techniques',
    authors: 'Dr. Lisa Wong, Prof. David Miller',
    date: '2023-09-15',
    snippet: 'This groundbreaking research presents a new approach to CRISPR gene editing that significantly reduces off-target effects...',
    abstract: 'We present a novel CRISPR-Cas9 variant that demonstrates a 94% reduction in off-target effects compared to conventional systems. Through targeted modifications of the guide RNA structure and optimization of the Cas9 protein, we have achieved unprecedented specificity in gene editing applications. This advancement addresses one of the most significant barriers to therapeutic applications of CRISPR technology and opens new possibilities for treating genetic disorders with minimal risk of unintended genomic modifications.',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    citations: 187,
    likes: 432,
    journal: 'Cell',
  },
  {
    id: '2',
    title: 'Artificial General Intelligence: Progress and Challenges',
    authors: 'Prof. Alan Martinez, Dr. Rebecca Lee',
    date: '2023-08-22',
    snippet: 'A comprehensive review of current advances toward artificial general intelligence and the ethical considerations involved...',
    abstract: 'This review synthesizes the current state of artificial general intelligence (AGI) research, evaluating progress across neural network architectures, reinforcement learning paradigms, and symbolic reasoning integration. We identify key technical hurdles that remain unsolved, particularly in the areas of transfer learning, causal reasoning, and common sense knowledge acquisition. Additionally, we present a novel framework for assessing AGI safety and alignment, emphasizing the importance of interpretability and value alignment in increasingly capable AI systems.',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    citations: 156,
    likes: 389,
    journal: 'Nature Machine Intelligence',
  },
];

// Sample recent reports data
const RECENT_REPORTS: Report[] = [
  {
    id: '1',
    title: 'Deep Learning Applications in Healthcare',
    authors: 'Dr. Kevin Thompson, Dr. Maria Garcia',
    date: '2023-11-20',
    snippet: 'This paper presents novel deep learning applications for medical diagnosis and treatment planning...',
    abstract: 'We demonstrate how deep learning architectures can be effectively applied to analyze complex medical imaging data, achieving diagnostic accuracy that rivals experienced radiologists. Our model, trained on over 100,000 annotated medical images, shows particular promise in early detection of subtle abnormalities that are frequently missed in conventional screening procedures. Additionally, we propose a new framework for integrating these AI systems into clinical workflows while maintaining appropriate human oversight and decision-making authority.',
    imageUrl: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    citations: 12,
    likes: 87,
    journal: 'Journal of Medical AI',
  },
  {
    id: '2',
    title: 'Sustainable Urban Planning Strategies',
    authors: 'Prof. Jennifer Wright, Dr. Thomas Brown',
    date: '2023-11-15',
    snippet: 'A comprehensive analysis of urban sustainability metrics and their application in future city planning...',
    abstract: 'This research presents a comprehensive framework for evaluating urban sustainability that integrates environmental, social, and economic factors into a unified assessment methodology. Using data from 50 global cities, we identify key determinants of sustainable urban development and propose innovative planning strategies that optimize resource efficiency while enhancing quality of life. Our findings emphasize the importance of mixed-use development, efficient public transportation, and green infrastructure in creating resilient urban environments for the 21st century.',
    imageUrl: 'https://images.unsplash.com/photo-1624969862293-b749659a90b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    citations: 8,
    likes: 64,
    journal: 'Urban Development Studies',
  },
];

// Sample recommended reports data
const RECOMMENDED_REPORTS: Report[] = [
  {
    id: '1',
    title: 'Advances in Renewable Energy Storage',
    authors: 'Dr. Carlos Mendez, Prof. Laura Wilson',
    date: '2023-10-05',
    snippet: 'This research presents breakthrough technologies in energy storage for renewable sources...',
    abstract: 'We introduce a novel energy storage technology based on advanced flow battery chemistry that achieves unprecedented energy density and cycle stability. Our system demonstrates a levelized cost of storage that is 42% lower than lithium-ion batteries while offering superior safety characteristics and reduced environmental impact. Large-scale implementation of this technology could overcome one of the primary barriers to renewable energy adoption by providing reliable, cost-effective storage solutions for grid stabilization and demand shifting.',
    imageUrl: 'https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    citations: 43,
    likes: 178,
    journal: 'Sustainable Energy Review',
  },
  {
    id: '2',
    title: 'The Impact of Social Media on Cognitive Development',
    authors: 'Dr. Sarah Johnson, Prof. Michael Chen',
    date: '2023-09-22',
    snippet: 'A longitudinal study examining the effects of social media usage on cognitive abilities across age groups...',
    abstract: 'This longitudinal study follows 2,500 participants aged 13-25 over a period of four years, examining the relationship between social media usage patterns and cognitive development. Our findings reveal complex and age-dependent effects, with moderate usage associated with enhanced certain cognitive domains including visual processing and multitasking ability, while heavy usage correlates with diminished attention span and verbal memory performance. We propose a balanced approach to social media engagement that maximizes potential benefits while mitigating negative impacts on developing brains.',
    imageUrl: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    citations: 31,
    likes: 142,
    journal: 'Digital Psychology',
  },
];

// Update the sample data to include journal field
TRENDING_REPORTS.forEach(report => {
  report.journal = ['Nature', 'Science', 'Cell', 'PNAS', 'Journal of Medicine'][Math.floor(Math.random() * 5)];
});

MOST_CITED_REPORTS.forEach(report => {
  report.journal = ['Nature', 'Science', 'Cell', 'PNAS', 'Journal of Medicine'][Math.floor(Math.random() * 5)];
});

// First, let's define a CategoryItem type near the top of the file, with other types
interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

// Create a TabContentItem interface
interface TabContentItem {
  id: string;
  title: string;
  icon: string;
  data: Report[];
}

// Move the ReportCard component outside of the TopsScreen component to fix hook errors
// Define at the file level, before the TopsScreen component
const ReportCard = ({ 
  item, 
  onNavigate 
}: { 
  item: Report;
  onNavigate: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = windowWidth > 768;
  
  const toggleAbstract = () => {
    setExpanded(!expanded);
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.reportCard, 
        isLargeScreen && styles.reportCardWide
      ]}
      onPress={() => onNavigate(item.id)}
      activeOpacity={0.9}
    >
      {/* Card Header with Journal and Date Info */}
      <View style={styles.cardMetadata}>
        <ThemedText style={styles.journalName}>{item.journal}</ThemedText>
        <ThemedText style={styles.publishDate}>{item.date}</ThemedText>
      </View>
      
      {/* Paper Title and Authors */}
      <View style={styles.reportHeader}>
        <ThemedText style={styles.reportTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.reportAuthors}>
          {item.authors}
        </ThemedText>
      </View>
      
      {/* Paper Snippet/Abstract with "Read More" functionality */}
      <View style={styles.abstractContainer}>
        <ThemedText style={styles.reportSnippet} numberOfLines={expanded ? undefined : 3}>
          {expanded && item.abstract ? item.abstract : item.snippet}
        </ThemedText>
        
        {item.abstract && (
          <TouchableOpacity 
            style={styles.readMoreButton}
            onPress={toggleAbstract}
          >
            <ThemedText style={styles.readMoreText}>
              {expanded ? 'Show less' : 'Read abstract'}
            </ThemedText>
            <Feather 
              name={expanded ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={Colors.light.primary}
              style={{ marginLeft: 4 }} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Stats row with improved visual metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <View style={styles.metricIconContainer}>
            <Feather name="file-text" size={16} color="#fff" />
          </View>
          <View>
            <ThemedText style={styles.metricValue}>{item.citations}</ThemedText>
            <ThemedText style={styles.metricLabel}>Citations</ThemedText>
          </View>
        </View>
        
        <View style={styles.metricDivider} />
        
        <View style={styles.metricItem}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#e74c3c' }]}>
            <Feather name="heart" size={16} color="#fff" />
          </View>
          <View>
            <ThemedText style={styles.metricValue}>{item.likes}</ThemedText>
            <ThemedText style={styles.metricLabel}>Likes</ThemedText>
          </View>
        </View>
        
        <View style={styles.metricDivider} />
        
        <View style={styles.metricItem}>
          <TouchableOpacity 
            style={styles.readButton}
            onPress={() => onNavigate(item.id)}
          >
            <ThemedText style={styles.readButtonText}>Read Paper</ThemedText>
            <Feather name="arrow-right" size={16} color="#fff" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.reportActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="heart" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="bookmark" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="share-2" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function TopsScreen() {
  const [activeCategory, setActiveCategory] = useState('1'); // Default to Trending
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Get window dimensions for responsive layout
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLargeScreen = windowWidth > 768;
  
  // Use dimensions in animated calculations
  const tabIndicatorPosition = scrollX.interpolate({
    inputRange: TOP_CATEGORIES.map((_, i) => i * windowWidth),
    outputRange: TOP_CATEGORIES.map((_, i) => i * (windowWidth / TOP_CATEGORIES.length)),
    extrapolate: 'clamp',
  });

  const flatListRef = useRef<FlatList>(null);
  
  const handleTabPress = (id: string) => {
    setActiveCategory(id);
  };

  const handleNavigateToReport = (id: string) => {
    router.push(`/report/${id}`);
  };

  const getReportData = (category: string) => {
    switch(category) {
      case '1': return TRENDING_REPORTS;
      case '2': return MOST_CITED_REPORTS;
      case '3': return RECENT_REPORTS;
      case '4': return RECOMMENDED_REPORTS;
      default: return TRENDING_REPORTS;
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  // Update to use the standalone ReportCard component
  const renderReportCard = ({ item }: { item: Report }) => {
    return <ReportCard item={item} onNavigate={handleNavigateToReport} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Top Papers',
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerShadowVisible: false,
      }} />

      <View style={styles.categoryContainer}>
          <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {TOP_CATEGORIES.map((item) => (
              <TouchableOpacity 
                key={`category-${item.id}`}
                style={[
                  styles.categoryButton,
                  activeCategory === item.id && styles.activeCategoryButton
                ]} 
                onPress={() => handleTabPress(item.id)}
              >
                <Feather 
                  name={item.icon as React.ComponentProps<typeof Feather>['name']} 
                  size={18} 
                  color={activeCategory === item.id ? '#FFFFFF' : '#666'} 
                  style={styles.categoryIcon} 
                />
                <ThemedText 
                  style={[
                    styles.categoryButtonText, 
                    activeCategory === item.id && styles.activeCategoryButtonText
                  ]}
                >
                  {item.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
      </View>

      <FlatList
          data={getReportData(activeCategory)}
        renderItem={renderReportCard}
        keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.reportsList,
            isLargeScreen && styles.reportsListWide
          ]}
          showsVerticalScrollIndicator={false}
          numColumns={isLargeScreen ? 2 : 1}
          key={`reports-list-${isLargeScreen ? 'large' : 'small'}`}
          columnWrapperStyle={isLargeScreen ? { justifyContent: 'space-between' } : undefined}
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
  categoryContainer: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  activeCategoryButton: {
    backgroundColor: Colors.light.primary,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reportsList: {
    padding: 15,
  },
  reportsListWide: {
    paddingHorizontal: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  reportCard: {
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
  reportCardWide: {
    width: '48%', // Leave some space between cards
    marginHorizontal: 0,
    marginBottom: 24,
  },
  cardMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  journalName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  publishDate: {
    fontSize: 12,
    color: '#888',
  },
  reportHeader: {
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
    lineHeight: 24,
  },
  reportAuthors: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  abstractContainer: {
    marginBottom: 16,
  },
  reportSnippet: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6c5ce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  readButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    padding: 5,
    marginLeft: 15,
  },
}); 