import React from 'react';
import { View, Image, StyleSheet, Text, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';

/**
 * A component to preview all of the AI-generated icons
 * This can be used during development to visualize how the icons look
 */
export default function IconPreview() {
  // Array of icon data for easy mapping
  const icons = [
    { name: 'Home', source: require('@/assets/icons/ai-home.png'), size: 26 },
    { name: 'Search', source: require('@/assets/icons/ai-search.png'), size: 24 },
    { name: 'Top Papers', source: require('@/assets/icons/ai-top-papers.png'), size: 26 },
    { name: 'Bookmarks', source: require('@/assets/icons/ai-bookmarks.png'), size: 26 },
    { name: 'Explore', source: require('@/assets/icons/ai-explore.png'), size: 24 },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI-Generated Icon Preview</Text>
      <View style={styles.grid}>
        {icons.map((icon, index) => (
          <View key={index} style={styles.iconContainer}>
            {/* Original icon */}
            <View style={styles.iconWrapper}>
              <Image
                source={icon.source}
                style={[
                  styles.icon,
                  { width: icon.size, height: icon.size }
                ]}
              />
              <Text style={styles.iconName}>{icon.name} (Original)</Text>
            </View>
            
            {/* Tinted icon - Light */}
            <View style={styles.iconWrapper}>
              <Image
                source={icon.source}
                style={[
                  styles.icon,
                  { width: icon.size, height: icon.size, tintColor: Colors.light.tabIconDefault }
                ]}
              />
              <Text style={styles.iconName}>{icon.name} (Light)</Text>
            </View>
            
            {/* Tinted icon - Dark */}
            <View style={[styles.iconWrapper, styles.darkWrapper]}>
              <Image
                source={icon.source}
                style={[
                  styles.icon,
                  { width: icon.size, height: icon.size, tintColor: Colors.dark.tabIconDefault }
                ]}
              />
              <Text style={[styles.iconName, styles.darkText]}>{icon.name} (Dark)</Text>
            </View>
            
            {/* Tinted icon - Selected */}
            <View style={styles.iconWrapper}>
              <Image
                source={icon.source}
                style={[
                  styles.icon,
                  { width: icon.size, height: icon.size, tintColor: Colors.light.primary }
                ]}
              />
              <Text style={styles.iconName}>{icon.name} (Selected)</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'column',
  },
  iconContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    margin: 5,
    minWidth: 120,
  },
  darkWrapper: {
    backgroundColor: '#333',
  },
  icon: {
    resizeMode: 'contain',
    marginBottom: 8,
  },
  iconName: {
    fontSize: 12,
    textAlign: 'center',
  },
  darkText: {
    color: '#fff',
  },
}); 