import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SkeletonBase } from './SkeletonBase';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PaperCardSkeletonProps {
  itemHeight?: number;
}

export const PaperCardSkeleton: React.FC<PaperCardSkeletonProps> = ({ 
  itemHeight = SCREEN_HEIGHT - 130,
}) => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { height: itemHeight }]}>
      {/* Background image skeleton */}
      <SkeletonBase
        width="100%"
        height="100%"
        style={styles.backgroundImage}
      />
      
      {/* Dark overlay for better readability */}
      <View style={styles.darkOverlay} />
      
      {/* Achievement badge skeleton */}
      <View style={styles.achievementContainer}>
        <SkeletonBase
          width={16}
          height={16}
          borderRadius={8}
          style={styles.achievementIcon}
        />
        <SkeletonBase
          width="85%"
          height={16}
          style={styles.achievementText}
        />
      </View>
      
      {/* Paper title and authors skeleton */}
      <View style={styles.paperContentContainer}>
        <SkeletonBase
          width="90%"
          height={32}
          style={styles.paperTitle}
        />
        <SkeletonBase
          width="70%"
          height={20}
          style={styles.paperAuthors}
        />
      </View>
      
      {/* Summary skeleton */}
      <View style={styles.summaryContainer}>
        <SkeletonBase
          width="100%"
          height={16}
          style={styles.summaryLine}
        />
        <SkeletonBase
          width="95%"
          height={16}
          style={styles.summaryLine}
        />
        <SkeletonBase
          width="90%"
          height={16}
          style={styles.summaryLine}
        />
        <SkeletonBase
          width="85%"
          height={16}
          style={styles.summaryLine}
        />
      </View>
      
      {/* Action buttons skeleton */}
      <View style={styles.bottomActionsContainer}>
        <SkeletonBase
          width={52}
          height={52}
          borderRadius={26}
          style={styles.actionButton}
        />
        <SkeletonBase
          width={52}
          height={52}
          borderRadius={26}
          style={styles.actionButton}
        />
        <SkeletonBase
          width={52}
          height={52}
          borderRadius={26}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#111',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  },
  achievementIcon: {
    marginRight: 10,
  },
  achievementText: {
    flex: 1,
  },
  paperContentContainer: {
    position: 'absolute',
    top: '45%',
    left: 20,
    right: 20,
    zIndex: 5,
  },
  paperTitle: {
    marginBottom: 12,
  },
  paperAuthors: {
    marginBottom: 6,
  },
  summaryContainer: {
    position: 'absolute',
    top: '63%',
    left: 20,
    right: 20,
    zIndex: 3,
    maxHeight: '25%',
  },
  summaryLine: {
    marginBottom: 8,
  },
  bottomActionsContainer: {
    position: 'absolute',
    bottom: 35,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 6,
  },
  actionButton: {
    marginHorizontal: 15,
  },
}); 