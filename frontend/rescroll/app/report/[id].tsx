import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { ReportDetail } from '@/components/report/ReportDetail';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Research Report',
        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={{ marginRight: 15 }}>
              <IconSymbol name="bell" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        )
      }} />
      <ReportDetail reportId={id as string} />
    </>
  );
} 