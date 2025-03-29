import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SkeletonBase } from './SkeletonBase';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PaperDetailSkeleton: React.FC = () => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  return (
    <View style={styles.container}>
      {/* Header with back button and title */}
      <View style={styles.header}>
        <SkeletonBase
          width={40}
          height={40}
          borderRadius={20}
          style={styles.backButton}
        />
        <View style={styles.titleContainer}>
          <SkeletonBase
            width="60%"
            height={24}
            style={styles.title}
          />
        </View>
        <SkeletonBase
          width={40}
          height={40}
          borderRadius={20}
          style={styles.actionButton}
        />
      </View>
      
      {/* Paper information */}
      <View style={styles.infoContainer}>
        <SkeletonBase
          width="90%"
          height={32}
          style={styles.paperTitle}
        />
        
        <View style={styles.authorContainer}>
          <SkeletonBase
            width={40}
            height={40}
            borderRadius={20}
            style={styles.authorImage}
          />
          <View style={styles.authorInfo}>
            <SkeletonBase
              width="50%"
              height={18}
              style={styles.authorName}
            />
            <SkeletonBase
              width="70%"
              height={16}
              style={styles.authorAffiliation}
            />
          </View>
        </View>
        
        <View style={styles.metaContainer}>
          <SkeletonBase
            width="40%"
            height={16}
            style={styles.metaItem}
          />
          <SkeletonBase
            width="40%"
            height={16}
            style={styles.metaItem}
          />
        </View>
        
        <SkeletonBase
          width="100%"
          height={1}
          style={styles.divider}
        />
        
        <View style={styles.abstractContainer}>
          <SkeletonBase
            width="50%"
            height={24}
            style={styles.sectionTitle}
          />
          <SkeletonBase
            width="100%"
            height={16}
            style={styles.textLine}
          />
          <SkeletonBase
            width="95%"
            height={16}
            style={styles.textLine}
          />
          <SkeletonBase
            width="90%"
            height={16}
            style={styles.textLine}
          />
          <SkeletonBase
            width="97%"
            height={16}
            style={styles.textLine}
          />
          <SkeletonBase
            width="85%"
            height={16}
            style={styles.textLine}
          />
        </View>
        
        <SkeletonBase
          width="100%"
          height={1}
          style={styles.divider}
        />
        
        <View style={styles.keywordsContainer}>
          <SkeletonBase
            width="40%"
            height={24}
            style={styles.sectionTitle}
          />
          <View style={styles.keywordsList}>
            <SkeletonBase
              width={100}
              height={32}
              borderRadius={16}
              style={styles.keywordItem}
            />
            <SkeletonBase
              width={80}
              height={32}
              borderRadius={16}
              style={styles.keywordItem}
            />
            <SkeletonBase
              width={120}
              height={32}
              borderRadius={16}
              style={styles.keywordItem}
            />
          </View>
        </View>
      </View>
      
      {/* Bottom action bar */}
      <View style={styles.actionBar}>
        <SkeletonBase
          width={60}
          height={60}
          borderRadius={30}
          style={styles.floatingAction}
        />
        <View style={styles.actionButtons}>
          <SkeletonBase
            width={80}
            height={40}
            borderRadius={20}
            style={styles.actionButtonSmall}
          />
          <SkeletonBase
            width={80}
            height={40}
            borderRadius={20}
            style={styles.actionButtonSmall}
          />
          <SkeletonBase
            width={80}
            height={40}
            borderRadius={20}
            style={styles.actionButtonSmall}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    alignSelf: 'center',
  },
  actionButton: {
    marginLeft: 16,
  },
  infoContainer: {
    flex: 1,
  },
  paperTitle: {
    marginBottom: 24,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorImage: {
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    marginBottom: 4,
  },
  authorAffiliation: {},
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  metaItem: {},
  divider: {
    marginVertical: 24,
    backgroundColor: '#E0E0E0',
  },
  abstractContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  textLine: {
    marginBottom: 12,
  },
  keywordsContainer: {
    marginBottom: 24,
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordItem: {
    marginRight: 8,
    marginBottom: 8,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  floatingAction: {},
  actionButtons: {
    flexDirection: 'row',
  },
  actionButtonSmall: {
    marginLeft: 12,
  },
}); 