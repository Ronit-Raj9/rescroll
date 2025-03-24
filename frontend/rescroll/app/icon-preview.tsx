import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import IconPreview from '@/components/IconPreview';

/**
 * Screen to preview all AI-generated icons
 */
export default function IconPreviewScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <IconPreview />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 