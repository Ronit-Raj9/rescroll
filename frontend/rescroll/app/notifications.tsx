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
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

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
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = Colors[isDarkMode ? 'dark' : 'light'];
  
  // Add logging to debug color theme
  useEffect(() => {
    console.log('[NotificationsScreen] Theme colors loaded:', colorScheme);
    console.log('[NotificationsScreen] Background color:', colors.background);
  }, [colorScheme, colors]);
  
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

  // Add notification type icon mapping with theme colors
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <IconSymbol name="heart.fill" size={24} color={colors.error} />; 
      case 'share':
        return <IconSymbol name="square.and.arrow.up" size={24} color={colors.info} />;
      case 'comment':
        return <IconSymbol name="text.bubble" size={24} color={colors.primary} />;
      case 'annotation':
        return <IconSymbol name="pencil" size={24} color={colors.warning} />;
      case 'highlight':
        return <IconSymbol name="doc.text" size={24} color={colors.success} />;
      case 'follow':
        return <IconSymbol name="person.circle" size={24} color={colors.primary} />;
      case 'citation':
        return <IconSymbol name="doc.text" size={24} color={colors.secondary} />;
      case 'new_paper':
        return <IconSymbol name="doc.text" size={24} color={colors.info} />;
      default:
        return <IconSymbol name="bell" size={24} color={colors.icon} />;
    }
  };

  // Convert to a proper React component to fix the hooks rules
  const NotificationItem = React.memo(({ notification, onDismiss, onPress }) => {
    const swipeRef = useRef(null);
    const heightRef = useRef(new Animated.Value(1));
    
    const handlePress = () => {
      // If unread, mark as read
      if (!notification.read) {
        markAsRead(notification.id);
      }
      
      // Navigate to the related content depending on notification type
      if (notification.entityId && notification.entityType) {
        if (notification.entityType === 'paper') {
          router.push(`/paper/${notification.entityId}` as any);
        } else if (notification.entityType === 'user') {
          router.push('/(tabs)');
        }
      }
    };
    
    // Render delete button for swipe action
    const renderRightActions = (
      progress: Animated.AnimatedInterpolation<number>, 
      dragX: Animated.AnimatedInterpolation<number>
    ) => {
      const trans = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [0, 100],
        extrapolate: 'clamp',
      });
      
      return (
        <Animated.View 
          style={[
            styles.deleteButtonContainer, 
            {
              transform: [{ translateX: trans }],
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.deleteButton, { backgroundColor: colors.error }]} 
            onPress={() => {
              deleteNotification(notification.id);
              swipeRef.current?.close();
            }}
          >
            <IconSymbol name="xmark" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      );
    };
    
    const onPressIn = () => {
      Animated.spring(heightRef.current, {
        toValue: 0.97,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };
    
    const onPressOut = () => {
      Animated.spring(heightRef.current, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };
    
    return (
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
      >
        <Animated.View 
          style={[
            styles.notificationContainer,
            { transform: [{ scale: heightRef.current }] }
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={[
              styles.notificationItem,
              { backgroundColor: colors.card },
              !notification.read && [styles.unreadNotification, { backgroundColor: colors.backgroundSecondary }]
            ]}
          >
            {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            
            <View style={styles.notificationIconContainer}>
              {getNotificationIcon(notification.type)}
            </View>
            
            <View style={styles.notificationContent}>
              <ThemedText style={[styles.notificationTitle, { color: colors.text }]}>
                {notification.title}
              </ThemedText>
              
              <ThemedText style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                {notification.message}
              </ThemedText>
              
              <ThemedText style={[styles.notificationTime, { color: colors.textTertiary }]}>
                {formatRelativeTime(notification.timestamp)}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Swipeable>
    );
  });

  // Updated to use the component
  const renderNotificationItem = ({ item }) => (
    <NotificationItem 
      notification={item} 
      onDismiss={() => deleteNotification(item.id)} 
      onPress={() => {
        markAsRead(item.id);
        if (item.entityId && item.entityType) {
          if (item.entityType === 'paper') {
            router.push(`/paper/${item.entityId}` as any);
          } else if (item.entityType === 'user') {
            router.push('/(tabs)');
          }
        }
      }}
    />
  );
  
  // Render section header
  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.backgroundSecondary }]}>
      <ThemedText style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>{section.title}</ThemedText>
    </View>
  );
  
  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="bell.slash" size={60} color={colors.textSecondary} />
      <ThemedText style={[styles.emptyText, { color: colors.text }]}>No notifications</ThemedText>
      <ThemedText style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        You're all caught up!
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Notifications',
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <IconSymbol name="arrow.right" size={24} color={colors.text} style={{ transform: [{ scaleX: -1 }] }} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              {notifications.filter(n => !n.read).length > 0 && (
                <TouchableOpacity
                  onPress={markAllAsRead}
                  style={styles.markAllButton}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 20 }}
                >
                  <ThemedText style={[styles.markAllText, { color: colors.primary }]}>
                    Mark all as read
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ),
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            color: colors.text,
          },
        }}
      />
      
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      {loading ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        renderEmpty()
      ) : (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
          <SectionList
            sections={groupedNotifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotificationItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={[
              styles.notificationList,
              { backgroundColor: colors.background }
            ]}
            onRefresh={() => {
              setRefreshing(true);
              // Simulated refresh
              setTimeout(() => {
                setRefreshing(false);
              }, 1000);
            }}
            refreshing={refreshing}
            stickySectionHeadersEnabled={true}
          />
        </GestureHandlerRootView>
      )}
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  markAllButton: {
    padding: 5,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    paddingBottom: 20,
    minHeight: '100%',
  },
  notificationContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: 'relative',
    borderBottomWidth: 1,
  },
  unreadNotification: {
    borderLeftWidth: 3,
  },
  unreadDot: {
    position: 'absolute',
    top: 20,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  deleteButtonContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationList: {
    paddingBottom: 20,
    minHeight: '100%',
  },
}); 