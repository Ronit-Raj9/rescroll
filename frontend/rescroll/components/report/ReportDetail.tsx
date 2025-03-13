import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useRouter } from 'expo-router';
import { IconSymbol } from '../ui/IconSymbol';

// Sample report data
const SAMPLE_REPORT = {
  id: '1',
  title: 'Advances in Quantum Machine Learning Algorithms',
  authors: 'Dr. Emily Chen, Prof. Robert Williams',
  institution: 'MIT Quantum Computing Lab',
  date: 'November 15, 2023',
  abstract: 'This paper introduces novel quantum machine learning algorithms that demonstrate significant performance improvements over classical approaches for specific optimization problems. We present a theoretical framework and experimental results using the latest quantum hardware.',
  content: `
    Quantum computing has emerged as a promising paradigm for solving computational problems that are intractable for classical computers. In particular, quantum machine learning (QML) algorithms leverage quantum mechanical phenomena such as superposition and entanglement to potentially offer exponential speedups for certain learning tasks.

    In this paper, we present a new class of quantum machine learning algorithms specifically designed for high-dimensional data classification. Our approach combines variational quantum circuits with classical optimization techniques to create a hybrid algorithm that outperforms purely classical approaches on benchmark datasets.

    The key contributions of this work include:
    1. A novel quantum feature mapping that preserves the relevant structure of classical data in quantum Hilbert space
    2. An adaptive learning protocol that optimizes the quantum circuit parameters based on training performance
    3. Experimental validation using both quantum simulators and actual quantum hardware
    4. Theoretical analysis of the computational complexity and potential quantum advantage

    Our experimental results demonstrate that for certain classes of problems, particularly those involving complex pattern recognition in high-dimensional spaces, our QML approach achieves higher accuracy with fewer training examples compared to state-of-the-art classical deep learning models.

    Furthermore, we analyze the scalability of our approach and identify the regimes where quantum advantage is expected to be most significant. As quantum hardware continues to improve in terms of qubit count and error rates, we project that the performance gap will widen further.

    The implications of this research extend beyond machine learning to other domains where optimization of complex objective functions is required, including drug discovery, materials science, and financial modeling.
  `,
  relatedTopics: ['Quantum Computing', 'Machine Learning', 'Algorithms', 'Computational Complexity'],
  citations: 37,
  likes: 215,
  doi: '10.1038/s41567-023-01234-x',
};

// Sample similar articles
const SIMILAR_ARTICLES = [
  {
    id: '2',
    title: 'Quantum Neural Networks for Image Classification',
    authors: 'Dr. Sarah Johnson, Prof. David Kim',
  },
  {
    id: '3',
    title: 'Error Mitigation in Quantum Machine Learning',
    authors: 'Prof. Michael Thompson, Dr. Lisa Wong',
  },
  {
    id: '4',
    title: 'Classical-Quantum Transfer Learning',
    authors: 'Dr. James Wilson, Prof. Emma Roberts',
  },
];

export const ReportDetail = ({ reportId = '1' }) => {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // In a real app, we would fetch the report data based on the reportId
  const report = SAMPLE_REPORT;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cover Image/Banner - Placeholder */}
        <View style={styles.coverImage}>
          <View style={styles.coverImagePlaceholder}>
            <IconSymbol name="doc.text.image" size={50} color="#999" />
          </View>
        </View>
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ThemedText style={styles.title}>{report.title}</ThemedText>
          <ThemedText style={styles.authors}>{report.authors}</ThemedText>
          <ThemedText style={styles.institution}>{report.institution}</ThemedText>
          <ThemedText style={styles.date}>{report.date}</ThemedText>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <IconSymbol name="quote.bubble" size={16} color="#666" />
              <ThemedText style={styles.statText}>{report.citations} citations</ThemedText>
            </View>
            <View style={styles.statItem}>
              <IconSymbol name="heart.fill" size={16} color="#e74c3c" />
              <ThemedText style={styles.statText}>{report.likes} likes</ThemedText>
            </View>
            <View style={styles.statItem}>
              <IconSymbol name="link" size={16} color="#666" />
              <ThemedText style={styles.statText}>DOI: {report.doi}</ThemedText>
            </View>
          </View>
        </View>
        
        {/* Abstract */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Abstract</ThemedText>
          <ThemedText style={styles.abstractText}>{report.abstract}</ThemedText>
        </View>
        
        {/* Full Content */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Full Report</ThemedText>
          <ThemedText style={styles.contentText}>{report.content}</ThemedText>
        </View>
        
        {/* Related Topics */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Related Topics</ThemedText>
          <View style={styles.topicsContainer}>
            {report.relatedTopics.map((topic, index) => (
              <TouchableOpacity key={index} style={styles.topicButton}>
                <ThemedText style={styles.topicText}>{topic}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Similar Articles */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Similar Articles</ThemedText>
          <View style={styles.similarArticlesContainer}>
            {SIMILAR_ARTICLES.map((article) => (
              <TouchableOpacity key={article.id} style={styles.similarArticleCard}>
                <ThemedText style={styles.similarArticleTitle}>{article.title}</ThemedText>
                <ThemedText style={styles.similarArticleAuthors}>{article.authors}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Download and Full Paper Link */}
        <View style={styles.accessSection}>
          <TouchableOpacity style={styles.fullPaperButton}>
            <IconSymbol name="doc.text" size={20} color="white" />
            <ThemedText style={styles.fullPaperButtonText}>Access Full Paper</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadButton}>
            <IconSymbol name="arrow.down.doc" size={20} color="#3498db" />
            <ThemedText style={styles.downloadButtonText}>Download PDF</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Floating action buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity 
          style={[styles.floatingButton, isLiked && styles.activeFloatingButton]}
          onPress={() => setIsLiked(!isLiked)}
        >
          <IconSymbol name={isLiked ? "heart.fill" : "heart"} size={22} color={isLiked ? "white" : "#666"} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.floatingButton, isBookmarked && styles.activeFloatingButton]}
          onPress={() => setIsBookmarked(!isBookmarked)}
        >
          <IconSymbol name={isBookmarked ? "bookmark.fill" : "bookmark"} size={22} color={isBookmarked ? "white" : "#666"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton}>
          <IconSymbol name="square.and.arrow.up" size={22} color="#666" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Space for floating buttons
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  coverImagePlaceholder: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  authors: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 5,
  },
  institution: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  abstractText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  contentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topicButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 5,
  },
  topicText: {
    fontSize: 14,
    color: '#555',
  },
  similarArticlesContainer: {
    marginTop: 5,
  },
  similarArticleCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  similarArticleTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  similarArticleAuthors: {
    fontSize: 13,
    color: '#666',
  },
  accessSection: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fullPaperButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  fullPaperButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  downloadButton: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: '#3498db',
    marginLeft: 8,
    fontWeight: '500',
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
  },
  floatingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  activeFloatingButton: {
    backgroundColor: '#3498db',
  },
}); 