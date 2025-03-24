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
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/contexts/ThemeContext';

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
  const rotationValue = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(new Animated.Value(0)).current;
  
  // Get theme colors
  const colorScheme = useColorScheme();
  const { colorScheme: themeMode } = useTheme();
  const isDarkMode = themeMode === 'dark';
  const colors = Colors[colorScheme || 'light'];

  const toggleAbstract = () => {
    setExpanded(!expanded);
    
    // Rotate the chevron icon
    Animated.timing(rotationValue, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    }).start();
    
    // Expand/collapse the abstract
    Animated.timing(contentHeight, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  };
  
  const rotateAnimation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  const abstractHeight = contentHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });
  
  return (
    <TouchableOpacity 
      style={[
        styles.reportCard, 
        { 
          backgroundColor: isDarkMode ? colors.backgroundSecondary : '#FFF',
          borderColor: isDarkMode ? colors.border : '#E5E5E5'
        }
      ]} 
      onPress={() => onNavigate(item.id)}
      activeOpacity={0.9}
    >
      <View style={styles.cardContent}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.reportImage} 
          resizeMode="cover"
        />
        
        <View style={styles.reportInfo}>
          <ThemedText style={styles.reportTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          
          <ThemedText style={[styles.reportAuthors, { color: isDarkMode ? colors.textSecondary : '#666' }]} numberOfLines={1}>
            {item.authors}
          </ThemedText>
          
          <View style={styles.reportMeta}>
            <View style={styles.metaItem}>
              <Feather 
                name="calendar" 
                size={14} 
                color={isDarkMode ? colors.textSecondary : '#666'} 
                style={styles.metaIcon} 
              />
              <ThemedText style={[styles.metaText, { color: isDarkMode ? colors.textSecondary : '#666' }]}>
                {new Date(item.date).toLocaleDateString()}
              </ThemedText>
            </View>
            
            <View style={styles.metaItem}>
              <Feather 
                name="external-link" 
                size={14} 
                color={isDarkMode ? colors.textSecondary : '#666'} 
                style={styles.metaIcon} 
              />
              <ThemedText style={[styles.metaText, { color: isDarkMode ? colors.textSecondary : '#666' }]}>
                {item.journal || 'Journal'}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
      
      <View style={[styles.reportStats, { borderTopColor: isDarkMode ? colors.border : '#F0F0F0' }]}>
        <View style={styles.statsItem}>
          <Feather 
            name="file-text" 
            size={16} 
            color={isDarkMode ? colors.textSecondary : '#555'} 
            style={styles.statsIcon} 
          />
          <ThemedText style={[styles.statsText, { color: isDarkMode ? colors.textSecondary : '#555' }]}>
            {item.citations} citations
          </ThemedText>
        </View>
        
        <View style={styles.statsItem}>
          <Feather 
            name="heart" 
            size={16} 
            color={isDarkMode ? colors.textSecondary : '#555'} 
            style={styles.statsIcon} 
          />
          <ThemedText style={[styles.statsText, { color: isDarkMode ? colors.textSecondary : '#555' }]}>
            {item.likes} saves
          </ThemedText>
        </View>
        
        <TouchableOpacity 
          style={styles.expandButton} 
          onPress={toggleAbstract}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Animated.View style={{ transform: [{ rotate: rotateAnimation }] }}>
            <Feather 
              name="chevron-down" 
              size={20} 
              color={isDarkMode ? colors.textSecondary : '#555'} 
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      {item.abstract && (
        <Animated.View style={[styles.abstractContainer, { height: abstractHeight }]}>
          <ThemedText style={[styles.abstractText, { color: isDarkMode ? colors.textSecondary : '#555' }]} numberOfLines={4}>
            {item.abstract}
          </ThemedText>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

export default function TopsScreen() {
  const [activeCategory, setActiveCategory] = useState('1');
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Get theme colors directly from ThemeContext
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? 'dark' : 'light';
  const colors = Colors[theme];
  
  const categoryData = TOP_CATEGORIES.map(item => ({
    ...item,
    active: item.id === activeCategory
  }));
  
  const handleTabPress = (id: string) => {
    setActiveCategory(id);
  };
  
  const handleNavigateToReport = (id: string) => {
    router.push(`/report/${id}`);
  };
  
  const getReportData = (category: string) => {
    switch(category) {
      case '1': // Trending
        return TRENDING_REPORTS;
      case '2': // Most Cited
        return MOST_CITED_REPORTS;
      case '3': // Recent
        return RECENT_REPORTS;
      case '4': // For You
        return RECOMMENDED_REPORTS;
      default:
        return TRENDING_REPORTS;
    }
  };
  
  const renderReportCard = ({ item }: { item: Report }) => {
    return <ReportCard item={item} onNavigate={handleNavigateToReport} />;
  };
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Top Papers</ThemedText>
        </View>
        
        <View style={styles.content}>
          {/* Category Tabs */}
          <View style={[
            styles.categoryTabs, 
            { 
              backgroundColor: colors.background,
              borderBottomColor: isDarkMode ? colors.border : '#e0e0e0' 
            }
          ]}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabsContent}
            >
              {categoryData.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryTab,
                    category.active && { 
                      backgroundColor: colors.primary,
                      borderColor: colors.primary
                    },
                    !category.active && { 
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }
                  ]}
                  onPress={() => handleTabPress(category.id)}
                >
                  <Feather
                    name={category.icon as any}
                    size={16}
                    color={category.active ? '#fff' : colors.text}
                    style={styles.categoryIcon}
                  />
                  <ThemedText
                    style={[
                      styles.categoryName,
                      { color: category.active ? '#fff' : colors.text }
                    ]}
                  >
                    {category.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Report List */}
          <FlatList
            data={getReportData(activeCategory)}
            renderItem={renderReportCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.reportList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  categoryTabs: {
    padding: 16,
    borderBottomWidth: 1,
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  reportList: {
    padding: 15,
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
  cardContent: {
    flexDirection: 'row',
  },
  reportImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  reportAuthors: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  statsItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    marginRight: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#555',
  },
  expandButton: {
    padding: 5,
  },
  abstractContainer: {
    marginTop: 10,
  },
  abstractText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 