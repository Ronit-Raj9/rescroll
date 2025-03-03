import React, { useContext, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { AuthContext } from '../../app/_layout';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// Mock user data
const DEFAULT_USER = {
  username: '--',
  email: '--',
  profileImageUrl: null as string | null,
  bio: '--',
  interests: ['--'],
  joinedDate: 'Recently',
  isAuthenticated: false,
};

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const { isAuthenticated, bypassAuth, setIsAuthenticated, setBypassAuth } = useContext(AuthContext);
  
  // State for user data
  const [userData, setUserData] = useState(DEFAULT_USER);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');
  
  useEffect(() => {
    // In a real app, this would fetch user data from an API
    // For now, we'll use our mock data based on auth state
    if (isAuthenticated) {
      setUserData({
        username: 'JohnDoe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://via.placeholder.com/150',
        bio: 'Researcher in the field of AI and Machine Learning',
        interests: ['Artificial Intelligence', 'Machine Learning', 'Neural Networks'],
        joinedDate: 'January 2023',
        isAuthenticated: true,
      });
    } else if (bypassAuth) {
      // Keep the default user data for users who just clicked "Get Started"
      setUserData({
        ...DEFAULT_USER,
        isAuthenticated: false,
      });
    }
  }, [isAuthenticated, bypassAuth]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            setIsAuthenticated(false);
            setBypassAuth(false);
            router.replace('/login');
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleLoginSignup = () => {
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Profile',
        headerRight: () => (
          <TouchableOpacity 
            style={{ marginRight: 15 }}
            onPress={() => Alert.alert('Settings', 'Settings functionality will be implemented in a future update.')}
          >
            <IconSymbol name="gearshape" size={22} color="#333" />
          </TouchableOpacity>
        )
      }} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          {userData.profileImageUrl ? (
            <Image 
              source={{ uri: userData.profileImageUrl }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <IconSymbol name="person.fill" size={50} color="#ccc" />
            </View>
          )}
          
          <ThemedText style={styles.username}>{userData.username}</ThemedText>
          <ThemedText style={styles.email}>{userData.email}</ThemedText>
          
          {!isAuthenticated && !bypassAuth ? (
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLoginSignup}
            >
              <ThemedText style={styles.loginButtonText}>Log In / Sign Up</ThemedText>
            </TouchableOpacity>
          ) : (
            <ThemedText style={styles.joinDate}>Member since {userData.joinedDate}</ThemedText>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Bio</ThemedText>
          <ThemedText style={styles.bioText}>{userData.bio}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Research Interests</ThemedText>
          <View style={styles.interestsContainer}>
            {userData.interests.map((interest, index) => (
              <View key={index} style={styles.interestBadge}>
                <ThemedText style={styles.interestText}>{interest}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>Notifications</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Receive updates about new papers and features
              </ThemedText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#d0d0d0', true: '#3498db' }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>Dark Mode</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Switch between light and dark themes
              </ThemedText>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#d0d0d0', true: '#3498db' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {(isAuthenticated || bypassAuth) && (
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color="#e74c3c" />
            <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
          </TouchableOpacity>
        )}

        <View style={styles.footerContainer}>
          <ThemedText style={styles.versionText}>ReScroll v1.0.0</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  joinDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  loginButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestBadge: {
    backgroundColor: '#f0f5fa',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  interestText: {
    fontSize: 14,
    color: '#3498db',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 20,
    backgroundColor: '#f8e6e6',
    borderRadius: 8,
  },
  logoutButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#e74c3c',
  },
  footerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#888',
  },
}); 