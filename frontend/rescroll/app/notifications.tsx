import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  View, 
  TouchableOpacity, 
  Animated, 
  SectionList,
  Switch,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { AppContext } from './_layout';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

// Define notification types
export type NotificationType = 
  | 'like' 
  | 'share' 
  | 'annotation' 
  | 'highlight' 
  | 'follow' 
  | 'citation'
  | 'new_paper'
  | 'comment';

// Define notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number; // Unix timestamp
  read: boolean;
  entityId?: string; // ID of the related paper, user, etc.
  entityType?: string; // Type of the entity (paper, user, etc.)
  actionUserId?: string; // ID of the user who performed the action
  actionUserName?: string; // Name of the user who performed the action
  actionUserAvatar?: string; // Avatar of the user who performed the action
  paperTitle?: string; // Title of the related paper
}

// Helper to group notifications by date
const groupNotificationsByDate = (notifications: Notification[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const thisMonth = new Date(today);
  thisMonth.setDate(1);

  const groups: { title: string, data: Notification[] }[] = [
    { title: 'Today', data: [] },
    { title: 'Yesterday', data: [] },
    { title: 'This Week', data: [] },
    { title: 'This Month', data: [] },
    { title: 'Earlier', data: [] }
  ];

  notifications.forEach(notification => {
    const date = new Date(notification.timestamp);
    
    if (date >= today) {
      groups[0].data.push(notification);
    } else if (date >= yesterday) {
      groups[1].data.push(notification);
    } else if (date >= lastWeek) {
      groups[2].data.push(notification);
    } else if (date >= thisMonth) {
      groups[3].data.push(notification);
    } else {
      groups[4].data.push(notification);
    }
  });

  // Remove empty groups
  return groups.filter(group => group.data.length > 0);
};

// Format timestamp to relative time
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
};

// Sample mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: 'New like on your paper',
    message: 'Dr. Sarah Chen liked your paper "Advances in Quantum Computing"',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    read: false,
    actionUserName: 'Dr. Sarah Chen',
    paperTitle: 'Advances in Quantum Computing'
  },
  {
    id: '2',
    type: 'share',
    title: 'Your paper was shared',
    message: 'Prof. James Wilson shared your paper "Neural Networks in Healthcare"',
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    read: false,
    actionUserName: 'Prof. James Wilson',
    paperTitle: 'Neural Networks in Healthcare'
  },
  {
    id: '3',
    type: 'annotation',
    title: 'New annotation on your paper',
    message: 'Dr. Emily Wong added an annotation to your paper',
    timestamp: Date.now() - 1000 * 60 * 60 * 22, // 22 hours ago
    read: false,
    actionUserName: 'Dr. Emily Wong',
    paperTitle: 'Climate Change Mitigation Strategies'
  },
  {
    id: '4',
    type: 'follow',
    title: 'New follower',
    message: 'Dr. Michael Brown started following you',
    timestamp: Date.now() - 1000 * 60 * 60 * 25, // Yesterday
    read: true,
    actionUserName: 'Dr. Michael Brown'
  },
  {
    id: '5',
    type: 'citation',
    title: 'Your paper was cited',
    message: 'Your paper was cited in "Advances in Deep Learning"',
    timestamp: Date.now() - 1000 * 60 * 60 * 30, // 30 hours ago
    read: true,
    paperTitle: 'Advances in Deep Learning'
  },
  {
    id: '6',
    type: 'highlight',
    title: 'Someone highlighted your paper',
    message: 'Dr. Lisa Thompson highlighted a section in your paper',
    timestamp: Date.now() - 1000 * 60 * 60 * 72, // 3 days ago
    read: true,
    actionUserName: 'Dr. Lisa Thompson',
    paperTitle: 'Sustainable Energy Solutions'
  },
  {
    id: '7',
    type: 'new_paper',
    title: 'New paper in your field',
    message: 'A new paper on Quantum Computing has been published that matches your interests',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
    read: true,
    paperTitle: 'Quantum Algorithms for Machine Learning'
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const appContext = useContext(AppContext);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [groupedNotifications, setGroupedNotifications] = useState<{ title: string, data: Notification[] }[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state after component mounts to prevent early navigation
  useEffect(() => {
    console.log('[NotificationsScreen] Component mounted');
    setIsMounted(true);
    
    return () => {
      console.log('[NotificationsScreen] Component unmounting');
    };
  }, []);
  
  // Animation ref for new notifications
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Update groupedNotifications when notifications change
  useEffect(() => {
    const grouped = groupNotificationsByDate(notifications);
    setGroupedNotifications(grouped);
    
    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.read).length;
    appContext.setUnreadNotificationsCount(unreadCount);
    
    // Animate new notifications
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, [notifications, fadeAnim]);
  
  const handleBack = () => {
    // Only navigate if the component is mounted
    if (isMounted) {
      console.log('[NotificationsScreen] Back button pressed, attempting navigation');
      
      // Wait until the end of the current event loop to navigate
      setTimeout(() => {
        console.log('[NotificationsScreen] Delayed back navigation executing now');
        try {
          // Use a state-based approach for navigation to avoid the refresh
          console.log('[NotificationsScreen] Using router.replace with params for back');
          router.replace({
            pathname: '/(tabs)',
            params: { 
              t: Date.now(),
              source: 'notificationBack'
            }
          });
        } catch (error) {
          console.error('[NotificationsScreen] Error navigating back:', error);
          router.back();
        }
      }, 50);
    } else {
      console.log('[NotificationsScreen] Back button pressed but component not mounted, ignoring');
    }
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Delete a notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };
  
  // Refresh notifications
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      // Add a new notification at the top
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: 'like',
        title: 'New like on your paper',
        message: 'Dr. Robert Chen liked your paper "Quantum Computing Applications"',
        timestamp: Date.now(),
        read: false,
        actionUserName: 'Dr. Robert Chen',
        paperTitle: 'Quantum Computing Applications'
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setRefreshing(false);
    }, 1000);
  }, []);

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch(type) {
      case 'like':
        return <IconSymbol name="heart" size={22} color="#FF3B30" />;
      case 'share':
        return <IconSymbol name="square.and.arrow.up" size={22} color="#007AFF" />;
      case 'annotation':
        return <IconSymbol name="doc.text" size={22} color="#FF9500" />;
      case 'highlight':
        return <IconSymbol name="doc.text" size={22} color="#5856D6" />;
      case 'follow':
        return <IconSymbol name="person.circle" size={22} color="#34C759" />;
      case 'citation':
        return <IconSymbol name="bookmark.fill" size={22} color="#AF52DE" />;
      case 'new_paper':
        return <IconSymbol name="doc.text" size={22} color="#5AC8FA" />;
      case 'comment':
        return <IconSymbol name="bell" size={22} color="#FF2D55" />;
      default:
        return <IconSymbol name="bell" size={22} color="#8E8E93" />;
    }
  };

  // Render a notification item with swipe-to-delete
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    // Reference to the swipeable component
    const swipeableRef = useRef<Swipeable>(null);
    
    // Action to perform when card is tapped - using a proper navigation approach
    const handlePress = () => {
      console.log('[NotificationsScreen] Notification tapped, marking as read');
      markAsRead(item.id);
      
      // Only navigate if the component is mounted
      if (isMounted) {
        console.log('[NotificationsScreen] Component is mounted, attempting navigation to /(tabs)');
        
        // Wait until the end of the current event loop to navigate
        // This prevents navigation during render/animation cycles
        setTimeout(() => {
          console.log('[NotificationsScreen] Delayed navigation executing now');
          try {
            // Use a state-based approach for navigation to avoid the refresh
            console.log('[NotificationsScreen] Using router.replace with params');
            router.replace({
              pathname: '/(tabs)',
              // Adding a timestamp helps ensure the route is considered "different"
              params: { 
                t: Date.now(),
                source: 'notification'
              }
            });
          } catch (error) {
            console.error('[NotificationsScreen] Navigation error:', error);
            router.push('/(tabs)');
          }
        }, 50);
      } else {
        console.log('[NotificationsScreen] Component not mounted, skipping navigation');
      }
    };
    
    // Right swipe actions (delete)
    const renderRightActions = (
      progress: Animated.AnimatedInterpolation<number>, 
      dragX: Animated.AnimatedInterpolation<number>
    ) => {
      const trans = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [0, 80],
        extrapolate: 'clamp',
      });
      
      return (
        <View style={styles.rightAction}>
          <Animated.View
            style={[
              styles.actionButton,
              {
                transform: [{ translateX: trans }],
              },
            ]}>
            <TouchableOpacity
              onPress={() => {
                swipeableRef.current?.close();
                deleteNotification(item.id);
              }}
              style={styles.deleteButton}>
              <IconSymbol name="xmark" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    };
    
    // Animated press effect
    const scale = useRef(new Animated.Value(1)).current;
    
    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };
    
    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };
    
    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
      >
        <Animated.View 
          style={[
            styles.notificationContainer,
            { transform: [{ scale }] }
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={[
              styles.notificationItem,
              !item.read && styles.unreadNotification
            ]}
          >
            {!item.read && <View style={styles.unreadDot} />}
            
            <View style={styles.notificationIconContainer}>
              {getNotificationIcon(item.type)}
            </View>
            
            <View style={styles.notificationContent}>
              <ThemedText style={styles.notificationTitle}>
                {item.title}
              </ThemedText>
              
              <ThemedText style={styles.notificationMessage}>
                {item.message}
              </ThemedText>
              
              <ThemedText style={styles.notificationTime}>
                {formatRelativeTime(item.timestamp)}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Swipeable>
    );
  };
  
  // Render section header
  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionHeaderText}>{section.title}</ThemedText>
    </View>
  );
  
  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="bell.slash" size={60} color="#8E8E93" />
      <ThemedText style={styles.emptyText}>No notifications</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        You're all caught up!
      </ThemedText>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <IconSymbol 
              name="arrow.right" 
              size={24} 
              color="#FFFFFF" 
              style={{ transform: [{ scaleX: -1 }] }} 
            />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
          
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <ThemedText style={styles.markAllText}>Mark all as read</ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Notifications List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
          </View>
        ) : (
          <SectionList
            sections={groupedNotifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotificationItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.notificationsList}
            stickySectionHeadersEnabled
            onRefresh={onRefresh}
            refreshing={refreshing}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  backButton: {
    padding: 5,
  },
  markAllButton: {
    padding: 5,
  },
  markAllText: {
    color: '#3498db',
    fontSize: 14,
  },
  notificationsList: {
    paddingBottom: 20,
    minHeight: '100%',
  },
  notificationContainer: {
    width: '100%',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#111',
  },
  unreadDot: {
    position: 'absolute',
    top: 20,
    left: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498db',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#CCC',
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  rightAction: {
    backgroundColor: '#dd2c00',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#dd2c00',
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
}); 