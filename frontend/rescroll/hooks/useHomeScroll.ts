import { useRef, useCallback } from 'react';
import { FlatList } from 'react-native';

// Create a singleton to store the reference and refresh function across components
// This allows components that don't have direct access to the FlatList to still control it
const HomeScrollStore = {
  flatListRef: null as FlatList | null,
  refreshArticlesFn: null as (() => void) | null,

  // Method to set the FlatList reference
  setFlatListRef(ref: FlatList | null) {
    this.flatListRef = ref;
  },

  // Method to set the refresh function
  setRefreshFunction(fn: () => void) {
    this.refreshArticlesFn = fn;
  },
};

/**
 * Hook for setting up the home screen scroll functionality
 * This is used by the home screen to register its FlatList and refresh function
 */
export function useHomeScrollSetup(refreshFn: () => void) {
  const scrollRef = useRef<FlatList>(null);

  // Register the FlatList ref and refresh function when the hook is initialized
  useCallback((ref: FlatList | null) => {
    if (ref) {
      HomeScrollStore.setFlatListRef(ref);
      HomeScrollStore.setRefreshFunction(refreshFn);
    }
  }, [refreshFn]);

  return {
    scrollRef,
    registerScrollRef: (ref: FlatList | null) => {
      if (ref) {
        HomeScrollStore.setFlatListRef(ref);
        HomeScrollStore.setRefreshFunction(refreshFn);
      }
    }
  };
}

/**
 * Hook for controlling the home screen scroll
 * This is used by other components like the tab bar to scroll to top and refresh
 */
export function useHomeScroll() {
  // Function to scroll to the top of the list
  const scrollToTop = useCallback(() => {
    if (HomeScrollStore.flatListRef) {
      HomeScrollStore.flatListRef.scrollToOffset({ offset: 0, animated: true });
    }
  }, []);

  // Function to refresh the articles
  const refreshArticles = useCallback(() => {
    if (HomeScrollStore.refreshArticlesFn) {
      HomeScrollStore.refreshArticlesFn();
    }
  }, []);

  return {
    scrollToTop,
    refreshArticles
  };
} 