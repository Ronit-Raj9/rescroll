import React, { useState, useContext } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../app/_layout';

// Sample interests data
const INTERESTS = [
  { id: '1', name: 'Artificial Intelligence' },
  { id: '2', name: 'Machine Learning' },
  { id: '3', name: 'Climate Science' },
  { id: '4', name: 'Medicine' },
  { id: '5', name: 'Neuroscience' },
  { id: '6', name: 'Quantum Physics' },
  { id: '7', name: 'Robotics' },
  { id: '8', name: 'Space Exploration' },
  { id: '9', name: 'Biotechnology' },
  { id: '10', name: 'Psychology' },
  { id: '11', name: 'Computer Science' },
  { id: '12', name: 'Mathematics' },
  { id: '13', name: 'Economics' },
  { id: '14', name: 'Political Science' },
  { id: '15', name: 'Philosophy' },
];

export const InterestSelection = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const router = useRouter();
  const { setIsFirstTime } = useContext(AuthContext);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(item => item !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleContinue = () => {
    if (selectedInterests.length === 0) {
      alert('Please select at least one interest');
      return;
    }

    // In a real app, we would save the selected interests to the user's profile
    console.log('Selected interests:', selectedInterests);
    
    // Mark that it's no longer the user's first time
    setIsFirstTime(false);
    
    // Navigate directly to the main app
    router.replace('/(tabs)');
  };

  const renderInterestItem = ({ item }: { item: { id: string; name: string } }) => {
    const isSelected = selectedInterests.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.interestItem, isSelected && styles.selectedInterest]}
        onPress={() => toggleInterest(item.id)}
      >
        <ThemedText style={[styles.interestText, isSelected && styles.selectedInterestText]}>
          {item.name}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Select Your Interests</ThemedText>
        <ThemedText style={styles.subtitle}>
          Choose research topics that interest you to get personalized recommendations
        </ThemedText>
      </View>

      <FlatList
        data={INTERESTS}
        renderItem={renderInterestItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.interestsList}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedInterests.length === 0 && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={selectedInterests.length === 0}
        >
          <ThemedText style={styles.continueButtonText}>
            Continue
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  interestsList: {
    paddingBottom: 20,
  },
  interestItem: {
    flex: 1,
    margin: 6,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
  },
  selectedInterest: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  interestText: {
    textAlign: 'center',
    fontWeight: '500',
    color: '#333',
  },
  selectedInterestText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
  },
  continueButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 