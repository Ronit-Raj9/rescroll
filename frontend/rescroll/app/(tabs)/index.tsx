import React, { useRef, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Tabs } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { AppContext } from '../../app/_layout';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbolName } from '@/components/ui/IconSymbol';
import { Image } from 'expo-image';
import { usePapers, Paper, ViewState } from '@/hooks/usePapers';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { useAccessibility } from '@/hooks/useAccessibility';
import { GestureHandlerRootView, PanGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedView } from '@/components/ThemedView';
import { Stack } from 'expo-router';
import { PaperCardSkeleton } from '@/components/ui/Skeleton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Add these high-quality fallback images
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1518818608552-195ed130cda4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80';

// Optimized button component to reduce unnecessary renders
const ActionButton = React.memo(({ 
  onPress, 
  iconName, 
  iconColor,
  accessibilityLabel,
}: { 
  onPress: () => void; 
  iconName: IconSymbolName; 
  iconColor: string;
  accessibilityLabel: string;
}) => (
  <TouchableOpacity 
    style={styles.actionButton} 
    onPress={onPress}
    activeOpacity={0.7}
    accessible={true}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
  >
    <IconSymbol
      name={iconName}
      size={28}
      color={iconColor}
    />
  </TouchableOpacity>
));

// Paper card component with optimized implementation for Instagram Reels-like experience
const PaperCard = React.memo(({ 
  item, 
  onLike, 
  onSave,
  onShare,
  itemHeight,
  responsiveSize,
  accessibility,
}: { 
  item: Paper;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
  itemHeight: number;
  responsiveSize: ReturnType<typeof useResponsiveSize>;
  accessibility: ReturnType<typeof useAccessibility>;
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);
  const { colorScheme } = useTheme();
  const paperColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Animation for double-tap like
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
  // Create memoized event handlers to prevent recreation on each render
  const handleLikePress = useCallback(() => {
    onLike(item.id);
    if (accessibility.isScreenReaderEnabled) {
      accessibility.announceToScreenReader(
        item.isLiked ? 'Removed like' : 'Added like'
      );
    }
  }, [onLike, item.id, item.isLiked, accessibility]);
  
  const handleSavePress = useCallback(() => {
    onSave(item.id);
    if (accessibility.isScreenReaderEnabled) {
      accessibility.announceToScreenReader(
        item.isSaved ? 'Removed from saved items' : 'Saved to your library'
      );
    }
  }, [onSave, item.id, item.isSaved, accessibility]);
  
  const handleSharePress = useCallback(() => {
    onShare(item.id);
  }, [onShare, item.id]);

  // Handler for double tap
  const doubleTapRef = useRef(null);
  
  const onSingleTap = useCallback((event: { nativeEvent: { state: number } }) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      // Single tap behavior if needed
    }
  }, []);
  
  const onDoubleTap = useCallback((event: { nativeEvent: { state: number } }) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      onLike(item.id);
      // Show heart animation
      setShowLikeAnimation(true);
      scaleAnim.setValue(0);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowLikeAnimation(false);
      });
    }
  }, [item.id, onLike, scaleAnim]);
  
  // Calculate number of summary lines based on screen size
  const summaryLines = 8; // Increase to ensure full visibility of text
  
  // Use imageUrl property from Paper type
  const imageUrl = item.imageUrl || FALLBACK_IMAGE;
  
  // Add more detailed logging to diagnose layout issues
  useEffect(() => {
    console.log('PaperCard mounted, title length:', item.title?.length);
    console.log('PaperCard mounted, summary length:', item.summary?.length);
  }, [item.title, item.summary]);
  
  // Get element layout measurements 
  const onAchievementLayout = (event: LayoutChangeEvent) => {
    const {x, y, width, height} = event.nativeEvent.layout;
    console.log('Achievement badge layout:', {x, y, width, height});
  };
  
  const onTitleLayout = (event: LayoutChangeEvent) => {
    const {x, y, width, height} = event.nativeEvent.layout;
    console.log('Title layout:', {x, y, width, height});
  };
  
  const onSummaryLayout = (event: LayoutChangeEvent) => {
    const {x, y, width, height} = event.nativeEvent.layout;
    console.log('Summary layout:', {x, y, width, height});
  };
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View 
        style={[styles.fullScreenCard, { height: itemHeight }]}
        accessible={true}
        accessibilityRole="none"
        accessibilityLabel={`Research paper: ${item.title} by ${item.authors}`}
      >
        <TapGestureHandler
          waitFor={doubleTapRef}
          onHandlerStateChange={onSingleTap}
        >
          <TapGestureHandler
            ref={doubleTapRef}
            numberOfTaps={2}
            onHandlerStateChange={onDoubleTap}
          >
            <View style={styles.fullCardContent}>
              {/* Main background image with improved caching */}
        <Image 
                source={{ uri: imageError ? FALLBACK_IMAGE : imageUrl }}
                style={styles.fullCardImage}
                contentFit="cover"
                transition={300}
          onError={() => setImageError(true)}
                onLoadStart={() => setImageLoading(true)}
                onLoad={() => setImageLoading(false)}
                cachePolicy="memory-disk"
        />
        
        {/* Dark overlay for better readability */}
        <View style={styles.darkOverlay} />
        
              {/* Achievement badge positioned where it appears in the reference image */}
              <View 
                style={styles.achievementContainer}
                onLayout={onAchievementLayout}
              >
                <IconSymbol 
                  name="star.fill" 
                  size={16} 
                  color="#4D9DE0" 
                  style={styles.achievementIcon} 
                />
                <ThemedText style={styles.achievementText} numberOfLines={2}>
                  {item.achievement || "Demonstrated 200x speedup for specific optimization problems"}
                </ThemedText>
          </View>
              
              {/* Paper title and authors with proper spacing */}
              <View 
                style={styles.paperContentContainer}
                onLayout={onTitleLayout}
              >
                <ThemedText 
                  style={styles.paperTitle}
                  numberOfLines={2}
                  accessible={true}
                  accessibilityLabel={`Title: ${item.title}`}
                >
                  {item.title || "Advances in Quantum Computing Algorithms"}
              </ThemedText>

                <ThemedText 
                  style={styles.paperAuthors}
                  numberOfLines={1}
                  accessible={true}
                  accessibilityLabel={`Authors: ${item.authors}`}
                >
                  {item.authors || "Patel, A. and Wong, S."}
              </ThemedText>
            </View>

              {/* Summary with enhanced styling */}
              <View 
                style={styles.summaryContainer}
                onLayout={onSummaryLayout}
              >
                <ThemedText 
                  style={styles.summaryText}
                  numberOfLines={summaryLines}
                  accessible={true}
                  accessibilityLabel={`Summary: ${item.summary}`}
                >
                  {item.summary || "This work presents a new class of quantum algorithms that provide exponential speedup for certain optimization problems, potentially revolutionizing computational approaches to drug discovery and materials science."}
                </ThemedText>
              </View>
              
              {/* Action buttons aligned to match reference */}
              <View style={styles.bottomActionsContainer}>
                <ActionButton
                  onPress={handleLikePress}
                  iconName="heart" // Changed from safari to heart
                  iconColor={item.isLiked ? "#FF5A5F" : "#FFFFFF"} // Red if liked
                  accessibilityLabel="Like this paper"
                />
                <ActionButton
                  onPress={handleSavePress}
                  iconName={item.isSaved ? "bookmark.fill" : "bookmark"}
                  iconColor="#FFFFFF"
                  accessibilityLabel={item.isSaved ? "Remove from bookmarks" : "Add to bookmarks"}
                />
                <ActionButton
                  onPress={handleSharePress}
                  iconName="square.and.arrow.up"
                  iconColor="#FFFFFF"
                  accessibilityLabel="Share this paper"
                />
              </View>
              
              {/* Loading indicator */}
              {imageLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={paperColors.primary} />
                </View>
              )}
              
              {/* Double-tap heart animation */}
              {showLikeAnimation && (
                <Animated.View style={[
                  styles.heartAnimationContainer,
                  {
                    transform: [
                      { scale: scaleAnim },
                    ],
                    opacity: scaleAnim
                  }
                ]}>
                  <IconSymbol
                    name="heart.fill"
                    size={120}
                    color="#FF5A5F"
                  />
                </Animated.View>
              )}
            </View>
          </TapGestureHandler>
        </TapGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
});

export default function HomeScreen() {
  const router = useRouter();
  const appContext = useContext(AppContext);
  const flatListRef = useRef<FlatList>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { 
    papers, 
    viewState, 
    fetchMorePapers, 
    handleLikePaper, 
    handleSavePaper 
  } = usePapers();
  const responsiveSize = useResponsiveSize();
  const accessibility = useAccessibility();
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = Colors[isDarkMode ? 'dark' : 'light'];
  
  // Set mounted flag after component mounts
  useEffect(() => {
    setIsMounted(true);
    
    // Hide the header from _layout.tsx when this screen is focused
    if (Platform.OS === 'web') {
      // For web, we need to manually update the header style
      const header = document.querySelector('.expo-router-head');
      if (header) {
        header.setAttribute('style', 'display: none;');
      }
    }
    
    return () => {
      // Clean up if needed
      if (Platform.OS === 'web') {
        const header = document.querySelector('.expo-router-head');
        if (header) {
          header.removeAttribute('style');
        }
      }
    };
  }, []);

  // Safe navigation helper - using proper route type
  const navigateSafely = useCallback((route: '/notifications' | '/profile-settings' | '/(tabs)') => {
    if (isMounted) {
      router.push(route);
    }
  }, [isMounted, router]);
  
  // Full screen height for each card - ensure proper height to avoid cutting content
  const itemHeight = SCREEN_HEIGHT - 130; // More space for navigation below
  
  // Add console logs to help debug positioning (these will appear in the developer console)
  useEffect(() => {
    console.log('Screen dimensions:', { width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    console.log('Item height:', itemHeight);
  }, [itemHeight]);
  
  // Event handlers
  const handleLike = useCallback((id: string) => {
    handleLikePaper(id);
  }, [handleLikePaper]);
  
  const handleSave = useCallback((id: string) => {
    handleSavePaper(id);
  }, [handleSavePaper]);
  
  const handleShare = useCallback((id: string) => {
    // Share functionality
    Alert.alert(
      "Share",
      "Sharing paper with ID: " + id,
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK" }
      ]
    );
  }, []);

  // Render each paper card
  const renderPaperCard = useCallback(({ item }: { item: Paper }) => {
    return (
      <PaperCard
        item={item}
        onLike={handleLike}
        onSave={handleSave}
        onShare={handleShare}
        itemHeight={itemHeight}
        responsiveSize={responsiveSize}
        accessibility={accessibility}
      />
    );
  }, [handleLike, handleSave, handleShare, itemHeight, responsiveSize, accessibility]);
  
  // Empty list placeholder when no papers are available
  const renderEmptyList = useCallback(() => {
    if (viewState === 'loading') {
      return (
        <View style={styles.emptyListContainer}>
          <PaperCardSkeleton itemHeight={itemHeight} />
          <ThemedText style={styles.emptyListText}>
            Loading research papers...
          </ThemedText>
        </View>
      );
    }
    
    if (viewState === 'error') {
      return (
        <View style={styles.emptyListContainer}>
          <IconSymbol name="star.fill" size={48} color={Colors.light.error} />
          <ThemedText style={styles.emptyListText}>
            Something went wrong while loading papers.
          </ThemedText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchMorePapers()}
          >
            <ThemedText style={styles.retryButtonText}>
              Retry
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyListContainer}>
        <IconSymbol name="magnifyingglass" size={48} color={Colors.light.textSecondary} />
        <ThemedText style={styles.emptyListText}>
          No research papers found
        </ThemedText>
      </View>
    );
  }, [viewState, fetchMorePapers, itemHeight]);
  
  // Get more papers when reaching the end of the list
  const handleEndReached = useCallback(() => {
    if (viewState !== 'loading' && papers.length > 0) {
      fetchMorePapers();
    }
  }, [viewState, papers.length, fetchMorePapers]);
  
  // Loading indicator for pagination
  const renderFooter = useCallback(() => {
    if (viewState !== 'loading' || papers.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <View style={styles.footerSkeletonContainer}>
          <PaperCardSkeleton itemHeight={200} />
        </View>
      </View>
    );
  }, [viewState, papers.length]);
  
  // Using keyExtractor for performance
  const keyExtractor = useCallback((item: Paper) => item.id, []);
  
  // Add logs to validate theme color usage
  useEffect(() => {
    console.log('[HomeScreen] Theme colors loaded:', colorScheme);
    console.log('[HomeScreen] Header background color:', colors.background);
    console.log('[HomeScreen] Header text color:', colors.text);
  }, [colorScheme, colors]);
  
  // Safety check for papers data
  if (!papers) return renderEmptyList();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'right', 'left']}>
        {/* Updated header with ReScroll logo and icons */}
        <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.headerLogo, { color: colors.text }]}>ReScroll</ThemedText>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => {
                console.log('[HomeScreen] Notification bell clicked, isMounted:', isMounted);
                if (isMounted) {
                  console.log('[HomeScreen] Attempting navigation to /notifications');
                  
                  // Wait until the end of the current event loop to navigate
                  setTimeout(() => {
                    console.log('[HomeScreen] Delayed navigation executing now');
                    try {
                      // Add parameters to ensure it's considered a new route
                      console.log('[HomeScreen] Using router.replace with params');
                      router.replace({
                        pathname: '/notifications',
                        params: { 
                          t: Date.now(),
                          source: 'headerBell'
                        }
                      });
                    } catch (error) {
                      console.error('[HomeScreen] Navigation error:', error);
                      console.log('[HomeScreen] Falling back to router.push');
                      router.push('/notifications');
                    }
                  }, 50);
                } else {
                  console.log('[HomeScreen] Component not mounted, skipping navigation');
                }
              }}
              accessibilityLabel="View notifications"
            >
              <View style={styles.notificationContainer}>
                <IconSymbol name="bell" size={22} color={colors.icon} />
                {appContext.unreadNotificationsCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <ThemedText style={styles.notificationBadgeText}>
                      {appContext.unreadNotificationsCount > 99 ? '99+' : appContext.unreadNotificationsCount}
                    </ThemedText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => {
                console.log('[HomeScreen] Profile button clicked, isMounted:', isMounted);
                if (isMounted) {
                  console.log('[HomeScreen] Attempting navigation to /profile-settings');
                  
                  // Wait until the end of the current event loop to navigate
                  setTimeout(() => {
                    console.log('[HomeScreen] Delayed profile navigation executing now');
                    try {
                      // Add parameters to ensure it's considered a new route
                      console.log('[HomeScreen] Using router.replace with params for profile');
                      router.replace({
                        pathname: '/profile-settings',
                        params: { 
                          t: Date.now(),
                          source: 'headerProfile'
                        }
                      });
                    } catch (error) {
                      console.error('[HomeScreen] Profile navigation error:', error);
                      console.log('[HomeScreen] Falling back to router.push');
                      router.push('/profile-settings');
                    }
                  }, 50);
                } else {
                  console.log('[HomeScreen] Component not mounted, skipping profile navigation');
                }
              }}
            >
              <IconSymbol name="person.circle" size={22} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>
        
      <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
        <FlatList
          ref={flatListRef}
          data={papers}
            renderItem={renderPaperCard}
            keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
            snapToInterval={itemHeight}
            snapToAlignment="start"
            decelerationRate="fast"
          pagingEnabled
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={
              papers.length === 0 ? styles.emptyContentContainer : undefined
            }
            getItemLayout={(data, index) => ({
              length: itemHeight,
              offset: itemHeight * index,
              index,
            })}
        />
      </View>
    </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    height: 50,
    paddingTop: 8,
    zIndex: 2,
  },
  headerLogo: {
    fontSize: 24, // Reduced from 36px
    fontWeight: 'bold',
    // Color will be set by inline style
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    marginTop: 0,
  },
  fullScreenCard: {
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0,
  },
  fullCardContent: {
    flex: 1,
    position: 'relative',
  },
  fullCardImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  paperContentContainer: {
    position: 'absolute',
    top: '45%', // Adjusted to provide more spacing from achievement badge
    left: 20,
    right: 20,
    zIndex: 5,
    marginBottom: 20, // Add bottom margin for better spacing
  },
  paperTitle: {
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12, // Increased spacing after title
    letterSpacing: 0,
    fontSize: 26,
    lineHeight: 32,
  },
  paperAuthors: {
    color: '#E0E0E0',
    marginBottom: 6, // Increased spacing after authors
    fontSize: 16,
    lineHeight: 20,
  },
  achievementContainer: {
    position: 'absolute',
    top: '32%', // Moved up slightly
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: '90%',
    alignSelf: 'center',
    zIndex: 4,
  },
  achievementIcon: {
    marginRight: 10,
  },
  achievementText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    fontWeight: '400',
  },
  summaryContainer: {
    position: 'absolute',
    top: '63%', // Further moved down to avoid collision
    left: 20,
    right: 20,
    zIndex: 3,
    maxHeight: '25%', // Limit height to prevent overflow
  },
  summaryText: {
    color: '#E0E0E0',
    lineHeight: 22,
    fontSize: 15, // Slightly reduced font size
    marginBottom: 10,
  },
  bottomActionsContainer: {
    position: 'absolute',
    bottom: 35, // Moved up slightly to avoid potential collision with summary
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
    zIndex: 6,
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  emptyListContainer: {
    flex: 1,
    height: SCREEN_HEIGHT - 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    color: '#FFF',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  footerSkeletonContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartAnimationContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
