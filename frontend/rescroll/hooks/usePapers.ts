import { useState, useCallback, useEffect } from 'react';

// Paper interface
export interface Paper {
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

// View state types
export type ViewState = 'loading' | 'success' | 'error' | 'empty';

// Initial papers data
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

// Sample images for new papers
const AI_GENERATED_IMAGES = [
  'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1624969862293-b749659a90b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80'
];

export function usePapers() {
  const [papers, setPapers] = useState<Paper[]>(INITIAL_PAPERS);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [viewState, setViewState] = useState<ViewState>('success');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Function to fetch more papers
  const fetchMorePapers = useCallback(() => {
    if (isLoading || !hasMoreData) return;
    
    setIsLoading(true);
    setErrorMessage(null);

    // Simulated API fetch with error handling
    const fetchPapers = () => {
      return new Promise<Paper[]>((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
          try {
            // Occasionally simulate an error for testing error handling
            if (Math.random() < 0.1) {
              throw new Error('Failed to load papers');
            }

            // Generate papers in batch for performance
            const newPapers = Array.from({ length: 3 }).map((_, index) => {
              // Generate a unique ID
              const uniqueId = `${Date.now()}-${index}`;
              
              // Select a random image from the collection for each new paper
              const randomImageIndex = Math.floor(Math.random() * AI_GENERATED_IMAGES.length);
              
              // Create new paper with unique data
              return {
                id: uniqueId,
                title: `New Research on ${['AI', 'Climate', 'Medicine', 'Physics', 'Biology'][Math.floor(Math.random() * 5)]} - ${Math.floor(Math.random() * 100)}`,
                authors: `${['Smith', 'Johnson', 'Lee', 'Wang', 'Chen'][Math.floor(Math.random() * 5)]}, ${['A.', 'M.', 'J.', 'L.', 'S.'][Math.floor(Math.random() * 5)]} and ${['Rodriguez', 'Miller', 'Zhang', 'Kim', 'Patel'][Math.floor(Math.random() * 5)]}, ${['B.', 'C.', 'D.', 'R.', 'T.'][Math.floor(Math.random() * 5)]}`,
                achievement: `${['Discovered', 'Improved', 'Optimized', 'Developed', 'Analyzed'][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 100)}% ${['better', 'faster', 'more accurate', 'more efficient', 'novel'][Math.floor(Math.random() * 5)]} results`,
                summary: `This research presents a groundbreaking approach to ${['artificial intelligence', 'climate modeling', 'disease treatment', 'quantum mechanics', 'genomics'][Math.floor(Math.random() * 5)]} that significantly enhances our understanding of ${['neural networks', 'atmospheric patterns', 'viral infections', 'particle interactions', 'genetic markers'][Math.floor(Math.random() * 5)]}.`,
                imageUrl: AI_GENERATED_IMAGES[randomImageIndex],
                likes: Math.floor(Math.random() * 500),
                saves: Math.floor(Math.random() * 200),
                comments: Math.floor(Math.random() * 50),
                isLiked: false,
                isSaved: false,
              };
            });
            
            resolve(newPapers);
          } catch (error) {
            reject(error);
          }
        }, 1000);
      });
    };
    
    // Execute the fetch and handle results
    fetchPapers()
      .then((newPapers) => {
        setPapers(prev => [...prev, ...newPapers]);
        setViewState('success');
        
        // Set hasMoreData to false after loading enough items
        if (papers.length > 15) {
          setHasMoreData(false);
        }
      })
      .catch((error: Error) => {
        console.error('Error loading papers:', error);
        setViewState('error');
        setErrorMessage(error.message || 'Failed to load papers');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [papers.length, isLoading, hasMoreData]);

  // Function to retry after error
  const retryFetch = useCallback(() => {
    setViewState('loading');
    fetchMorePapers();
  }, [fetchMorePapers]);

  // Function to handle liking a paper
  const handleLikePaper = useCallback((paperId: string) => {
    setPapers(currentPapers => 
      currentPapers.map(paper => {
        if (paper.id === paperId) {
          const newIsLiked = !paper.isLiked;
          return {
            ...paper,
            isLiked: newIsLiked,
            likes: newIsLiked ? paper.likes + 1 : Math.max(0, paper.likes - 1)
          };
        }
        return paper;
      })
    );
  }, []);

  // Function to handle saving a paper
  const handleSavePaper = useCallback((paperId: string) => {
    setPapers(currentPapers => 
      currentPapers.map(paper => {
        if (paper.id === paperId) {
          const newIsSaved = !paper.isSaved;
          return {
            ...paper,
            isSaved: newIsSaved,
            saves: newIsSaved ? paper.saves + 1 : Math.max(0, paper.saves - 1)
          };
        }
        return paper;
      })
    );
  }, []);

  // Load initial data on mount
  useEffect(() => {
    // We already have initial data, so no need to fetch on mount
    // But we could implement initial data fetching here if needed
  }, []);

  return {
    papers,
    isLoading,
    hasMoreData,
    viewState,
    errorMessage,
    fetchMorePapers,
    retryFetch,
    handleLikePaper,
    handleSavePaper,
  };
} 