import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import AIIcon from '@/components/AIIcon';

// Icons to showcase
const ICON_SETS = [
  {
    family: 'Ionicons' as const,
    icons: [
      { name: 'home', description: 'Home' },
      { name: 'search', description: 'Search' },
      { name: 'bookmark', description: 'Bookmarks' },
      { name: 'compass', description: 'Explore' },
      { name: 'document-text', description: 'Document' },
      { name: 'library', description: 'Library' },
      { name: 'book', description: 'Book' },
      { name: 'newspaper', description: 'News' },
      { name: 'cloud-download', description: 'Download' },
      { name: 'star', description: 'Favorite' },
    ],
  },
  {
    family: 'FontAwesome5' as const,
    icons: [
      { name: 'file-alt', description: 'File' },
      { name: 'book', description: 'Book' },
      { name: 'university', description: 'University' },
      { name: 'graduation-cap', description: 'Education' },
      { name: 'microscope', description: 'Science' },
      { name: 'atom', description: 'Physics' },
      { name: 'brain', description: 'Neuroscience' },
      { name: 'dna', description: 'Biology' },
      { name: 'chart-bar', description: 'Statistics' },
      { name: 'flask', description: 'Chemistry' },
    ],
  },
  {
    family: 'MaterialCommunityIcons' as const,
    icons: [
      { name: 'robot', description: 'AI' },
      { name: 'brain', description: 'Intelligence' },
      { name: 'file-document', description: 'Document' },
      { name: 'chart-line', description: 'Trends' },
      { name: 'clipboard-text', description: 'Research' },
      { name: 'notebook', description: 'Notes' },
      { name: 'magnify', description: 'Search' },
      { name: 'database', description: 'Data' },
      { name: 'book-open-variant', description: 'Reading' },
      { name: 'lightbulb', description: 'Ideas' },
    ],
  },
];

// Gradient color options
const GRADIENTS = [
  { name: 'Blue Ocean', colors: ['#4F8EF7', '#3b5998'] as [string, string] },
  { name: 'Sunset', colors: ['#FF9190', '#FF6A88'] as [string, string] },
  { name: 'Nature', colors: ['#43E97B', '#38F9D7'] as [string, string] },
  { name: 'Royal', colors: ['#A155FB', '#F59E0B'] as [string, string] },
  { name: 'Candy', colors: ['#FA709A', '#FEE140'] as [string, string] },
  { name: 'Berry', colors: ['#5E72EB', '#FF9190'] as [string, string] },
  { name: 'Forest', colors: ['#0BA360', '#3CBA92'] as [string, string] },
  { name: 'Passion', colors: ['#FF512F', '#DD2476'] as [string, string] },
  { name: 'Ocean', colors: ['#1A2980', '#26D0CE'] as [string, string] },
  { name: 'Sky', colors: ['#4776E6', '#8E54E9'] as [string, string] },
];

export default function AIIconsDemo() {
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [selectedSize, setSelectedSize] = useState(24);
  
  // Size options
  const SIZES = [16, 20, 24, 28, 32, 36, 40, 48];
  
  return (
    <SafeAreaView style={styles.container}>
      <ThemedText style={styles.title}>AI-Generated Icons</ThemedText>
      <ThemedText style={styles.subtitle}>
        Explore our collection of AI-enhanced icons
      </ThemedText>
      
      {/* Gradient selector */}
      <ThemedText style={styles.sectionTitle}>Gradient Style</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradientSelector}>
        {GRADIENTS.map((gradient, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.gradientOption,
              selectedGradient.name === gradient.name && styles.selectedGradient,
            ]}
            onPress={() => setSelectedGradient(gradient)}
          >
            <View
              style={[
                styles.gradientPreview,
                {
                  backgroundColor: gradient.colors[0],
                  shadowColor: gradient.colors[1],
                },
              ]}
            />
            <ThemedText style={styles.gradientName}>{gradient.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Size selector */}
      <ThemedText style={styles.sectionTitle}>Icon Size</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sizeSelector}>
        {SIZES.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeOption,
              selectedSize === size && styles.selectedSize,
            ]}
            onPress={() => setSelectedSize(size)}
          >
            <ThemedText
              style={[
                styles.sizeText,
                selectedSize === size && styles.selectedSizeText,
              ]}
            >
              {size}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Icon showcase */}
      <ScrollView style={styles.iconShowcase}>
        {ICON_SETS.map((set, setIndex) => (
          <View key={setIndex} style={styles.iconSet}>
            <ThemedText style={styles.iconSetTitle}>{set.family}</ThemedText>
            <View style={styles.iconsGrid}>
              {set.icons.map((icon, iconIndex) => (
                <View key={iconIndex} style={styles.iconItem}>
                  <View style={styles.iconWrapper}>
                    <AIIcon
                      family={set.family}
                      name={icon.name}
                      size={selectedSize}
                      focused={true}
                      gradientColors={selectedGradient.colors}
                    />
                  </View>
                  <ThemedText style={styles.iconName}>{icon.description}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  gradientSelector: {
    marginBottom: 24,
  },
  gradientOption: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  selectedGradient: {
    opacity: 1,
  },
  gradientPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  gradientName: {
    fontSize: 12,
    textAlign: 'center',
  },
  sizeSelector: {
    marginBottom: 24,
  },
  sizeOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.card,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedSize: {
    backgroundColor: Colors.light.primary,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedSizeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  iconShowcase: {
    flex: 1,
  },
  iconSet: {
    marginBottom: 32,
  },
  iconSetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconName: {
    fontSize: 12,
    textAlign: 'center',
  },
}); 