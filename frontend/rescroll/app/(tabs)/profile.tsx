import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Linking,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { AuthContext } from '../../app/_layout';

// Define the types for settings items
interface SettingItem {
  id: string;
  icon: "bell" | "house.fill" | "magnifyingglass" | "bookmark.fill" | "star.fill" | "safari" | "person.circle" | "arrow.right" | "heart" | "bookmark" | "square.and.arrow.up" | "doc.text";
  label: string;
  hasToggle: boolean;
  value?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const router = useRouter();
  const { setIsAuthenticated, setBypassAuth } = useContext(AuthContext);

  const handleLogout = async () => {
    // Use the context to handle logout
    setIsAuthenticated(false);
    setBypassAuth(false);
    router.replace('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Here you would implement the actual theme change logic
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
    // Here you would implement the actual notification settings change
  };

  const profileImage = 'https://via.placeholder.com/150';
  const userName = 'Alex Johnson';
  const userEmail = 'alex.johnson@example.com';

  const settingsSections: SettingSection[] = [
    {
      title: 'Preferences',
      items: [
        {
          id: 'dark-mode',
          icon: 'star.fill',
          label: 'Dark Mode',
          hasToggle: true,
          value: darkMode,
          onToggle: toggleDarkMode,
        },
        {
          id: 'notifications',
          icon: 'bell',
          label: 'Notifications',
          hasToggle: true,
          value: notifications,
          onToggle: toggleNotifications,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'edit-profile',
          icon: 'person.circle',
          label: 'Edit Profile',
          hasToggle: false,
          onPress: () => router.push('/'),
        },
        {
          id: 'change-password',
          icon: 'doc.text',
          label: 'Change Password',
          hasToggle: false,
          onPress: () => router.push('/'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          icon: 'safari',
          label: 'Help Center',
          hasToggle: false,
          onPress: () => Linking.openURL('https://rescroll.com/help'),
        },
        {
          id: 'feedback',
          icon: 'bookmark',
          label: 'Send Feedback',
          hasToggle: false,
          onPress: () => Linking.openURL('mailto:feedback@rescroll.com'),
        },
        {
          id: 'privacy',
          icon: 'bookmark.fill',
          label: 'Privacy Policy',
          hasToggle: false,
          onPress: () => Linking.openURL('https://rescroll.com/privacy'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.hasToggle ? undefined : item.onPress}
      activeOpacity={item.hasToggle ? 1 : 0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <IconSymbol name={item.icon} size={20} color={colors.primary} />
        </View>
        <ThemedText style={styles.settingLabel}>{item.label}</ThemedText>
      </View>
      {item.hasToggle ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: colors.lightGray, true: colors.primary }}
          thumbColor={Platform.OS === 'ios' ? '' : '#fff'}
          ios_backgroundColor={colors.lightGray}
        />
      ) : (
        <IconSymbol name="arrow.right" size={18} color={colors.darkGray} />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.screenTitle}>Profile</ThemedText>
        </View>

        <View style={styles.profileSection}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <ThemedText style={styles.userName}>{userName}</ThemedText>
          <ThemedText style={styles.userEmail}>{userEmail}</ThemedText>
        </View>

        {settingsSections.map((section) => (
          <View key={section.title} style={styles.settingsSection}>
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            <View style={styles.settingsContainer}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="arrow.right" size={20} color="#fff" />
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>

        <View style={styles.footer}>
          <ThemedText style={styles.version}>ReScroll v1.0.0</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 16,
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#888',
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ebebeb',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF5A60',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  version: {
    fontSize: 14,
    color: '#888',
  },
}); 