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
import { useHomeScrollSetup } from '@/hooks/useHomeScroll';
import { GestureHandlerRootView, TapGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedView } from '@/components/ThemedView';
import { Stack } from 'expo-router';
import { PaperCardSkeleton } from '@/components/ui/Skeleton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Fallback image if none is provided
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1518818608552-195ed130cda4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80';

// A small memoized button component
const ActionButton = React.memo(
  ({
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
      <IconSymbol name={iconName} size={28} color={iconColor} />
    </TouchableOpacity>
  )
);

// The PaperCard component replicates the exact layout from your reference image.
const PaperCard = React.memo(
  ({
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
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const { colorScheme } = useTheme();
    const paperColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    // Animation for double-tap like
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;

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

    // Handlers for double tap
    const doubleTapRef = useRef(null);

    const onSingleTap = useCallback(
      (event: { nativeEvent: { state: number } }) => {
        if (event.nativeEvent.state === State.ACTIVE) {
          // Single tap behavior if needed
        }
      },
      []
    );

    const onDoubleTap = useCallback(
      (event: { nativeEvent: { state: number } }) => {
        if (event.nativeEvent.state === State.ACTIVE) {
          onLike(item.id);
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
      },
      [item.id, onLike, scaleAnim]
    );

    // Allow up to 8 lines for summary
    const summaryLines = 8;

    // Use provided imageUrl or fallback
    const imageUrl = item.imageUrl || FALLBACK_IMAGE;

    // For layout debugging
    useEffect(() => {
      console.log('PaperCard mounted, title length:', item.title?.length);
      console.log('PaperCard mounted, summary length:', item.summary?.length);
    }, [item.title, item.summary]);

    const onAchievementLayout = (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      console.log('Achievement badge layout:', { x, y, width, height });
    };

    const onTitleLayout = (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      console.log('Title layout:', { x, y, width, height });
    };

    const onSummaryLayout = (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      console.log('Summary layout:', { x, y, width, height });
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
                {/* Main background image */}
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

                {/* Dark overlay */}
                <View style={styles.darkOverlay} />

                {/* Achievement badge */}
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
                    {item.achievement ||
                      "Increased accuracy by 15% over previous state-of-the-art models"}
                  </ThemedText>
                </View>

                {/* Paper title and authors */}
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
                    {item.title ||
                      "Novel Approaches to Deep Learning for Natural Language Processing"}
                  </ThemedText>
                  <ThemedText
                    style={styles.paperAuthors}
                    numberOfLines={1}
                    accessible={true}
                    accessibilityLabel={`Authors: ${item.authors}`}
                  >
                    {item.authors || "Johnson, K. and Smith, L."}
                  </ThemedText>
                </View>

                {/* Summary */}
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
                    {item.summary ||
                      "This research introduces a novel transformer architecture that significantly enhances natural language understanding tasks through improved attention mechanisms and optimized training procedures."}
                  </ThemedText>
                </View>

                {/* Action buttons */}
                <View style={styles.bottomActionsContainer}>
                  <ActionButton
                    onPress={handleLikePress}
                    iconName="heart"
                    iconColor={item.isLiked ? "#FF5A5F" : "#FFFFFF"}
                    accessibilityLabel="Like this paper"
                  />
                  <ActionButton
                    onPress={handleSavePress}
                    iconName={item.isSaved ? "bookmark.fill" : "bookmark"}
                    iconColor="#FFFFFF"
                    accessibilityLabel={
                      item.isSaved
                        ? "Remove from bookmarks"
                        : "Add to bookmarks"
                    }
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
                    <ActivityIndicator
                      size="large"
                      color={paperColors.primary}
                    />
                  </View>
                )}

                {/* Double-tap heart animation */}
                {showLikeAnimation && (
                  <Animated.View
                    style={[
                      styles.heartAnimationContainer,
                      {
                        transform: [{ scale: scaleAnim }],
                        opacity: scaleAnim,
                      },
                    ]}
                  >
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
  }
);

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
    handleSavePaper,
    refreshPapers,
  } = usePapers();
  const responsiveSize = useResponsiveSize();
  const accessibility = useAccessibility();
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = Colors[isDarkMode ? 'dark' : 'light'];

  /**
   * BACKEND INTEGRATION NOTE:
   * 
   * This component uses the useHomeScrollSetup hook to register the FlatList and refresh function.
   * When integrating with the backend:
   * 
   * 1. The refreshPapers function from usePapers.ts should be updated to make real API calls
   * 2. The FlatList should be registered with the useHomeScrollSetup hook as is done below
   * 3. Loading states should be handled by the usePapers hook and reflected in the UI
   */
  
  // Register the FlatList for scrollToTop functionality
  const { registerScrollRef } = useHomeScrollSetup(refreshPapers);

  // Use this height to match your reference image exactly
  const itemHeight = SCREEN_HEIGHT - 129.5;

  useEffect(() => {
    setIsMounted(true);
    if (Platform.OS === 'web') {
      const header = document.querySelector('.expo-router-head');
      if (header) {
        header.setAttribute('style', 'display: none;');
      }
    }
    return () => {
      if (Platform.OS === 'web') {
        const header = document.querySelector('.expo-router-head');
        if (header) {
          header.removeAttribute('style');
        }
      }
    };
  }, []);

  // Register the FlatList ref whenever it changes
  useEffect(() => {
    if (flatListRef.current) {
      registerScrollRef(flatListRef.current);
    }
  }, [flatListRef.current, registerScrollRef]);

  const navigateSafely = useCallback(
    (route: '/notifications' | '/profile-settings' | '/(tabs)') => {
      if (isMounted) {
        router.push(route);
      }
    },
    [isMounted, router]
  );

  useEffect(() => {
    console.log('Screen dimensions:', { width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    console.log('Item height:', itemHeight);
  }, [itemHeight]);

  const handleLike = useCallback(
    (id: string) => {
      handleLikePaper(id);
    },
    [handleLikePaper]
  );

  const handleSave = useCallback(
    (id: string) => {
      handleSavePaper(id);
    },
    [handleSavePaper]
  );

  const handleShare = useCallback(
    (id: string) => {
      Alert.alert("Share", "Sharing paper with ID: " + id, [
        { text: "Cancel", style: "cancel" },
        { text: "OK" },
      ]);
    },
    []
  );

  const renderPaperCard = useCallback(
    ({ item }: { item: Paper }) => (
      <PaperCard
        item={item}
        onLike={handleLike}
        onSave={handleSave}
        onShare={handleShare}
        itemHeight={itemHeight}
        responsiveSize={responsiveSize}
        accessibility={accessibility}
      />
    ),
    [handleLike, handleSave, handleShare, itemHeight, responsiveSize, accessibility]
  );

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
          <IconSymbol name="star.fill" size={48} color={isDarkMode ? colors.primary : "#FF3B30"} />
          <ThemedText style={styles.emptyListText}>
            Something went wrong while loading papers.
          </ThemedText>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              // Try to refresh papers on error
              refreshPapers();
            }}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyListContainer}>
        <IconSymbol name="magnifyingglass" size={48} color={colors.textSecondary} />
        <ThemedText style={styles.emptyListText}>
          No research papers found
        </ThemedText>
      </View>
    );
  }, [viewState, refreshPapers, itemHeight, isDarkMode, colors]);

  const handleEndReached = useCallback(() => {
    if (viewState !== 'loading' && papers.length > 0) {
      fetchMorePapers();
    }
  }, [viewState, papers.length, fetchMorePapers]);

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

  const keyExtractor = useCallback((item: Paper) => item.id, []);

  useEffect(() => {
    console.log('[HomeScreen] Theme colors loaded:', colorScheme);
    console.log('[HomeScreen] Header background color:', colors.background);
    console.log('[HomeScreen] Header text color:', colors.text);
  }, [colorScheme, colors]);

  if (!papers) return renderEmptyList();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'right', 'left']}>
        {/* Header with logo and icons */}
        <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.headerLogo, { color: colors.text }]}>ReScroll</ThemedText>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => {
                if (isMounted) {
                  setTimeout(() => {
                    try {
                      router.replace({
                        pathname: '/notifications',
                        params: { t: Date.now(), source: 'headerBell' },
                      });
                    } catch (error) {
                      router.push('/notifications');
                    }
                  }, 50);
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
                if (isMounted) {
                  setTimeout(() => {
                    try {
                      router.replace({
                        pathname: '/profile-settings',
                        params: { t: Date.now(), source: 'headerProfile' },
                      });
                    } catch (error) {
                      router.push('/profile-settings');
                    }
                  }, 50);
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
            keyExtractor={keyExtractor}
            renderItem={renderPaperCard}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmptyList}
            ListFooterComponent={renderFooter}
            contentContainerStyle={papers.length === 0 ? { flex: 1 } : undefined}
            showsVerticalScrollIndicator={false}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={itemHeight}
            scrollEventThrottle={16}
            initialNumToRender={2}
            maxToRenderPerBatch={3}
            removeClippedSubviews={true}
            // Added pull-to-refresh functionality
            refreshing={viewState === 'loading' && papers.length > 0}
            onRefresh={refreshPapers}
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
    fontSize: 24,
    fontWeight: 'bold',
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
  achievementContainer: {
    position: 'absolute',
    top: '32%',
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
  paperContentContainer: {
    position: 'absolute',
    top: '45%',
    left: 20,
    right: 20,
    zIndex: 5,
    marginBottom: 20,
  },
  paperTitle: {
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    letterSpacing: 0,
    fontSize: 26,
    lineHeight: 32,
  },
  paperAuthors: {
    color: '#E0E0E0',
    marginBottom: 6,
    fontSize: 16,
    lineHeight: 20,
  },
  summaryContainer: {
    position: 'absolute',
    top: '63%',
    left: 20,
    right: 20,
    zIndex: 3,
    maxHeight: '25%',
  },
  summaryText: {
    color: '#E0E0E0',
    lineHeight: 22,
    fontSize: 15,
    marginBottom: 10,
  },
  bottomActionsContainer: {
    position: 'absolute',
    bottom: 35,
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
