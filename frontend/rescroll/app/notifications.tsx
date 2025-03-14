import React from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Sample data for notifications
const NOTIFICATIONS = [
  {
    id: '1',
    type: 'new_paper',
    title: 'New paper in your field',
    message: 'A new paper on Quantum Computing has been published that matches your interests.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'citation',
    title: 'Paper cited',
    message: 'Your paper "Neural Networks in Medical Imaging" was cited in a new publication.',
    time: '1 day ago',
    read: false,
  },
  {
    id: '3',
    type: 'comment',
    title: 'New comment',
    message: 'Dr. Sarah Williams commented on your discussion of "Climate Change Impacts".',
    time: '2 days ago',
    read: true,
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Weekly recommendations',
    message: 'Check out these 5 papers we think you might be interested in based on your reading history.',
    time: '3 days ago',
    read: true,
  },
  {
    id: '5',
    type: 'event',
    title: 'Upcoming conference',
    message: 'International Conference on AI & Ethics is starting next week. 3 papers in your library are being presented.',
    time: '5 days ago',
    read: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'new_paper':
        return <IconSymbol name="doc.badge.plus" size={24} color="#3498db" />;
      case 'citation':
        return <IconSymbol name="quote.bubble" size={24} color="#2ecc71" />;
      case 'comment':
        return <IconSymbol name="text.bubble" size={24} color="#9b59b6" />;
      case 'recommendation':
        return <IconSymbol name="star" size={24} color="#f39c12" />;
      case 'event':
        return <IconSymbol name="calendar" size={24} color="#e74c3c" />;
      default:
        return <IconSymbol name="bell" size={24} color="#7f8c8d" />;
    }
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
    >
      <View style={styles.notificationIconContainer}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <ThemedText style={styles.notificationTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.notificationMessage}>{item.message}</ThemedText>
        <ThemedText style={styles.notificationTime}>{item.time}</ThemedText>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <IconSymbol name="ellipsis" size={20} color="#888" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Notifications',
          headerRight: () => (
            <TouchableOpacity 
              style={{ marginRight: 15 }}
              onPress={() => {}}
            >
              <ThemedText style={styles.markAllRead}>Mark all as read</ThemedText>
            </TouchableOpacity>
          )
        }} 
      />

      <FlatList
        data={NOTIFICATIONS}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notificationsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="bell.slash" size={60} color="#ccc" />
            <ThemedText style={styles.emptyText}>No notifications</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              You're all caught up!
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationsList: {
    padding: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
  moreButton: {
    padding: 5,
  },
  markAllRead: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
}); 