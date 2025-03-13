import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, TextInput, Alert, ScrollView, Platform, Modal, Dimensions, StatusBar, Switch, KeyboardAvoidingView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from './_layout';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Keys for AsyncStorage
const PROFILE_IMAGE_STORAGE_KEY = 'rescroll_profile_image';
const USERNAME_STORAGE_KEY = 'rescroll_username';
const DARK_MODE_STORAGE_KEY = 'rescroll_dark_mode';
const NOTIFICATIONS_ENABLED_KEY = 'rescroll_notifications_enabled';
const NEWS_LANGUAGE_KEY = 'rescroll_news_language';

// Language data structure for backend integration
interface LanguageData {
  code: string;
  name: string;
  native: string;
  rtl?: boolean;
}

// Language helper service
const LanguageService = {
  languages: {
    en: { code: 'en', name: 'English', native: 'English' },
    es: { code: 'es', name: 'Spanish', native: 'Español' },
    fr: { code: 'fr', name: 'French', native: 'Français' },
    de: { code: 'de', name: 'German', native: 'Deutsch' },
    ja: { code: 'ja', name: 'Japanese', native: '日本語' },
    hi: { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    zh: { code: 'zh', name: 'Mandarin Chinese', native: '中文' },
    ar: { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true },
    bn: { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    pt: { code: 'pt', name: 'Portuguese', native: 'Português' },
    ru: { code: 'ru', name: 'Russian', native: 'Русский' },
    ur: { code: 'ur', name: 'Urdu', native: 'اردو', rtl: true },
    id: { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
    sw: { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
    mr: { code: 'mr', name: 'Marathi', native: 'मराठी' },
    te: { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    tr: { code: 'tr', name: 'Turkish', native: 'Türkçe' },
    ta: { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    vi: { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
    tl: { code: 'tl', name: 'Tagalog (Filipino)', native: 'Tagalog' },
    it: { code: 'it', name: 'Italian', native: 'Italiano' },
    ko: { code: 'ko', name: 'Korean', native: '한국어' },
    fa: { code: 'fa', name: 'Persian (Farsi)', native: 'فارسی', rtl: true },
    ha: { code: 'ha', name: 'Hausa', native: 'Hausa' },
    th: { code: 'th', name: 'Thai', native: 'ไทย' },
    pl: { code: 'pl', name: 'Polish', native: 'Polski' },
    yo: { code: 'yo', name: 'Yoruba', native: 'Yorùbá' },
    uk: { code: 'uk', name: 'Ukrainian', native: 'Українська' },
    gu: { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    ml: { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    kn: { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' }
  },
  
  // Get language data by code
  getLanguageByCode: function(code: string): LanguageData | undefined {
    return this.languages[code as keyof typeof this.languages];
  },
  
  // Get language data by name
  getLanguageByName: function(name: string): LanguageData | undefined {
    return Object.values(this.languages).find(lang => lang.name === name);
  },
  
  // Get language options for UI (sorted alphabetically)
  getLanguageOptions: function(): string[] {
    return Object.values(this.languages)
      .map(lang => lang.name)
      .sort((a, b) => a.localeCompare(b));
  },
  
  // Convert language name to code
  getCodeFromName: function(name: string): string | undefined {
    const language = this.getLanguageByName(name);
    return language?.code;
  },
  
  // Check if language is RTL
  isRTL: function(name: string): boolean {
    const language = this.getLanguageByName(name);
    return language?.rtl || false;
  },
  
  // Get native name from English name
  getNativeName: function(name: string): string | undefined {
    const language = this.getLanguageByName(name);
    return language?.native;
  }
};

// Add this new interface for chat messages
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const colors = Colors.light;
  const { navigateTo } = useContext(AppContext);
  
  const [username, setUsername] = useState('John Doe');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // New state variables for the added settings
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [newsLanguage, setNewsLanguage] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // Add state for privacy policy modal
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  
  // Add chatbot state variables
  const [showHelpCenterModal, setShowHelpCenterModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollViewRef = useRef<ScrollView>(null);
  
  // Available languages from the service
  const languages = LanguageService.getLanguageOptions();
  
  // Load saved data and request permissions when component mounts
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load saved profile image
        const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_STORAGE_KEY);
        if (savedImage) {
          setProfileImage(savedImage);
        }
        
        // Load saved username
        const savedUsername = await AsyncStorage.getItem(USERNAME_STORAGE_KEY);
        if (savedUsername) {
          setUsername(savedUsername);
        }
        
        // Load dark mode setting
        const darkModeSetting = await AsyncStorage.getItem(DARK_MODE_STORAGE_KEY);
        if (darkModeSetting !== null) {
          setIsDarkModeEnabled(darkModeSetting === 'true');
        }
        
        // Load notifications setting
        const notificationsSetting = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
        if (notificationsSetting !== null) {
          setIsNotificationsEnabled(notificationsSetting === 'true');
        }
        
        // Load news language setting
        const savedLanguage = await AsyncStorage.getItem(NEWS_LANGUAGE_KEY);
        if (savedLanguage) {
          setNewsLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Request camera and photo library permissions
    const requestPermissions = async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
          Alert.alert(
            'Limited Functionality',
            'You need to grant camera and photo library permissions to use all profile picture features.',
            [{ text: 'OK' }]
          );
        }
      }
    };
    
    loadSavedData();
    requestPermissions();
  }, []);
  
  const handleBack = () => {
    try {
      router.back();
    } catch (error) {
      console.error('Error navigating back:', error);
      // Fallback to main tabs if back navigation fails
      router.replace('/(tabs)');
    }
  };
  
  const handlePrivacyPolicy = () => {
    // Show privacy policy modal
    setShowPrivacyPolicyModal(true);
  };
  
  const handleHelpCenter = () => {
    // Show help center chatbot
    setShowHelpCenterModal(true);
    
    // If this is the first time opening, add welcome message
    if (chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "Hello! I'm your ReScroll assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
    }
  };
  
  const handleSettings = () => {
    // TODO: Navigate to detailed settings
    Alert.alert('Settings', 'Additional settings would be displayed here.');
  };
  
  const handleUpdateUsername = async () => {
    if (username.trim().length === 0) {
      Alert.alert('Invalid Username', 'Username cannot be empty.');
      return;
    }
    
    try {
      // Save username to AsyncStorage
      await AsyncStorage.setItem(USERNAME_STORAGE_KEY, username);
      setIsEditingUsername(false);
      Alert.alert('Success', 'Username updated successfully.');
    } catch (error) {
      console.error('Error saving username:', error);
      Alert.alert('Error', 'Failed to update username. Please try again.');
    }
  };
  
  const handleChangeProfilePicture = async () => {
    // Show an action sheet for image selection options
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePicture,
        },
        {
          text: 'Choose from Library',
          onPress: pickImage,
        },
        {
          text: 'Remove Current Photo',
          onPress: removeProfilePicture,
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };
  
  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setProfileImage(selectedImage.uri);
        saveProfileImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };
  
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setProfileImage(selectedImage.uri);
        saveProfileImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  const removeProfilePicture = async () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Set back to default image
              setProfileImage('https://via.placeholder.com/150');
              
              // Remove from AsyncStorage
              await AsyncStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY);
              
              Alert.alert('Success', 'Profile picture removed successfully.');
            } catch (error) {
              console.error('Error removing profile picture:', error);
              Alert.alert('Error', 'Failed to remove profile picture. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  const saveProfileImage = async (imageUri: string) => {
    try {
      // Save image URI to AsyncStorage
      await AsyncStorage.setItem(PROFILE_IMAGE_STORAGE_KEY, imageUri);
      Alert.alert('Success', 'Profile picture updated successfully.');
    } catch (error) {
      console.error('Error saving profile image:', error);
      Alert.alert('Error', 'Failed to save profile picture. Please try again.');
    }
  };

  const viewProfilePicture = () => {
    setShowImageViewer(true);
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
  };

  // New functions to handle the added settings
  const handleDarkModeToggle = async (value: boolean) => {
    setIsDarkModeEnabled(value);
    try {
      await AsyncStorage.setItem(DARK_MODE_STORAGE_KEY, value ? 'true' : 'false');
      // In a real app, this would trigger a theme change
      Alert.alert('Dark Mode', `Dark mode has been ${value ? 'enabled' : 'disabled'}. This will be fully implemented in a future update.`);
    } catch (error) {
      console.error('Error saving dark mode setting:', error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setIsNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, value ? 'true' : 'false');
      Alert.alert('Notifications', `Notifications have been ${value ? 'enabled' : 'disabled'}.`);
    } catch (error) {
      console.error('Error saving notifications setting:', error);
    }
  };

  const openLanguageSelector = () => {
    setShowLanguageModal(true);
  };

  const selectLanguage = async (language: string) => {
    setNewsLanguage(language);
    setShowLanguageModal(false);
    try {
      await AsyncStorage.setItem(NEWS_LANGUAGE_KEY, language);
      
      // Get language code for backend integration
      const languageCode = LanguageService.getCodeFromName(language);
      console.log(`Selected language: ${language}, Code: ${languageCode}`);
      
      // Here you would typically also send this to your backend
      // Example: api.setUserLanguage(userId, languageCode);
    } catch (error) {
      console.error('Error saving language setting:', error);
    }
  };

  // Add new functions for the chatbot
  const handleSendMessage = () => {
    if (messageInput.trim() === '') return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageInput,
      sender: 'user',
      timestamp: new Date()
    };
    
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setMessageInput('');
    
    // Simulate bot typing
    setIsTyping(true);
    
    // Simulate bot response after delay
    // In a real implementation, this would make an API call to the backend
    setTimeout(() => {
      const botResponse = generateBotResponse(messageInput);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setChatMessages([...updatedMessages, botMessage]);
      setIsTyping(false);
    }, 1000);
  };
  
  // Simple bot response generator (placeholder for backend integration)
  const generateBotResponse = (userInput: string): string => {
    // This function would be replaced by actual backend API call
    // BACKEND INTEGRATION POINT: Replace this with an API call to your NLP service
    const userInputLower = userInput.toLowerCase();
    
    if (userInputLower.includes('language') || userInputLower.includes('languages')) {
      return "You can change your preferred language in Profile Settings > News Language. We support over 30 languages including English, Spanish, French, and many more.";
    }
    
    if (userInputLower.includes('dark mode') || userInputLower.includes('theme')) {
      return "You can toggle Dark Mode in Profile Settings. This changes the app's appearance to a darker color scheme that's easier on the eyes in low-light conditions.";
    }
    
    if (userInputLower.includes('profile') || userInputLower.includes('picture') || userInputLower.includes('photo')) {
      return "To change your profile picture, go to your Profile and tap on your current photo. You can then choose to take a new photo or select one from your library.";
    }
    
    if (userInputLower.includes('notification') || userInputLower.includes('alert')) {
      return "Notifications can be enabled or disabled in Profile Settings. When enabled, you'll receive updates about new content and features.";
    }
    
    if (userInputLower.includes('sign out') || userInputLower.includes('logout')) {
      return "To sign out, go to Profile Settings and scroll to the bottom where you'll find the 'Sign Out' button.";
    }
    
    if (userInputLower.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    
    return "I'm not sure I understand. Could you please rephrase your question? You can ask about features like language settings, dark mode, notifications, or profile management.";
  };
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Profile', 
            headerLeft: () => (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <ThemedText style={styles.backButtonText}>✕</ThemedText>
              </TouchableOpacity>
            ),
          }} 
        />
        
        {/* Profile Picture Viewer Modal */}
        <Modal
          visible={showImageViewer}
          transparent={true}
          animationType="fade"
          onRequestClose={closeImageViewer}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={closeImageViewer}
            >
              <ThemedText style={styles.modalCloseButtonText}>✕</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              activeOpacity={1} 
              style={styles.modalImageContainer}
              onPress={closeImageViewer}
            >
              <Image 
                source={{ uri: profileImage }} 
                style={styles.modalImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.editProfilePhotoButton} 
              onPress={() => {
                closeImageViewer();
                setTimeout(() => {
                  handleChangeProfilePicture();
                }, 300);
              }}
            >
              <ThemedText style={styles.editProfilePhotoButtonText}>
                Change Profile Photo
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Modal>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ThemedText>Loading profile data...</ThemedText>
            </View>
          ) : (
            <>
              <View style={styles.profileHeader}>
                <View style={styles.profileImageContainer}>
                  <TouchableOpacity onPress={viewProfilePicture}>
                    <Image 
                      source={{ uri: profileImage }} 
                      style={styles.profileImage} 
                      onError={() => setProfileImage('https://via.placeholder.com/150')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleChangeProfilePicture} 
                    style={styles.editIconContainer}
                  >
                    <ThemedText style={styles.editIconText}>✎</ThemedText>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.usernameContainer}>
                  {isEditingUsername ? (
                    <View style={styles.editUsernameContainer}>
                      <TextInput
                        value={username}
                        onChangeText={setUsername}
                        style={[styles.usernameInput, { color: colors.text }]}
                        autoFocus
                      />
                      <TouchableOpacity onPress={handleUpdateUsername} style={styles.saveButton}>
                        <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.usernameDisplayContainer}>
                      <ThemedText style={styles.username}>{username}</ThemedText>
                      <TouchableOpacity onPress={() => setIsEditingUsername(true)} style={styles.editButton}>
                        <ThemedText style={styles.editButtonText}>✎</ThemedText>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.settingsSection}>
                {/* New settings options */}
                <View style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <ThemedText style={styles.settingLabel}>Dark Theme</ThemedText>
                  </View>
                  <Switch
                    value={isDarkModeEnabled}
                    onValueChange={handleDarkModeToggle}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isDarkModeEnabled ? '#2563EB' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <ThemedText style={styles.settingLabel}>Notifications</ThemedText>
                  </View>
                  <Switch
                    value={isNotificationsEnabled}
                    onValueChange={handleNotificationsToggle}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isNotificationsEnabled ? '#2563EB' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                  />
                </View>

                <TouchableOpacity onPress={openLanguageSelector} style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <ThemedText style={styles.settingLabel}>News Language</ThemedText>
                  </View>
                  <View style={styles.settingValueContainer}>
                    <ThemedText style={styles.settingValue}>{newsLanguage}</ThemedText>
                    <ThemedText style={styles.chevronText}>›</ThemedText>
                  </View>
                </TouchableOpacity>

                {/* Existing settings */}
                <TouchableOpacity onPress={handleSettings} style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <ThemedText style={styles.settingLabel}>Settings</ThemedText>
                  </View>
                  <ThemedText style={styles.chevronText}>›</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handlePrivacyPolicy} style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <ThemedText style={styles.settingLabel}>Privacy Policy</ThemedText>
                  </View>
                  <ThemedText style={styles.chevronText}>›</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleHelpCenter} style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <ThemedText style={styles.settingLabel}>Help Center</ThemedText>
                  </View>
                  <ThemedText style={styles.chevronText}>›</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </ThemedView>

      {/* Language selector modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.languageModalContainer}>
          <View style={styles.simpleLanguageModalContent}>
            <ThemedText style={styles.languageModalTitle}>Select Language</ThemedText>
            
            <ScrollView style={styles.simpleLanguageScrollView}>
              {languages.map((language) => {
                // Get language code for backend integration
                const languageCode = LanguageService.getCodeFromName(language);
                
                return (
                  <TouchableOpacity
                    key={language}
                    style={[
                      styles.simpleLanguageOption,
                      newsLanguage === language && styles.simpleSelectedLanguageOption
                    ]}
                    onPress={() => selectLanguage(language)}
                  >
                    <ThemedText 
                      style={styles.simpleLanguageText}
                    >
                      {language}
                    </ThemedText>
                    
                    {newsLanguage === language && (
                      <IconSymbol 
                        name="star.fill" 
                        size={24} 
                        color="#2563EB"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.simpleCancelButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <ThemedText style={styles.simpleCancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyPolicyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPrivacyPolicyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.privacyPolicyModalContent}>
            <View style={styles.privacyPolicyHeader}>
              <ThemedText style={styles.privacyPolicyTitle}>Privacy Policy</ThemedText>
              <TouchableOpacity 
                style={styles.privacyPolicyCloseButton} 
                onPress={() => setShowPrivacyPolicyModal(false)}
              >
                <ThemedText style={styles.privacyPolicyCloseButtonText}>✕</ThemedText>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.privacyPolicyScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.privacyPolicyContent}>
                <ThemedText style={styles.privacyPolicySectionTitle}>Privacy Policy for ReScroll</ThemedText>
                <ThemedText style={styles.privacyPolicyLastUpdated}>Last Updated: {new Date().toLocaleDateString()}</ThemedText>
                
                <ThemedText style={styles.privacyPolicyParagraph}>
                  Welcome to ReScroll. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our application and tell you about your privacy rights and how the law protects you.
                </ThemedText>
                
                <ThemedText style={styles.privacyPolicyHeading}>1. Information We Collect</ThemedText>
                <ThemedText style={styles.privacyPolicyParagraph}>
                  We collect several types of information from and about users of our application, including:
                </ThemedText>
                <ThemedText style={styles.privacyPolicyBulletPoint}>
                  • Personal identifiers such as name, email address, and username
                </ThemedText>
                <ThemedText style={styles.privacyPolicyBulletPoint}>
                  • Profile information including profile pictures
                </ThemedText>
                <ThemedText style={styles.privacyPolicyBulletPoint}>
                  • Preferences such as language selection and theme options
                </ThemedText>
                <ThemedText style={styles.privacyPolicyBulletPoint}>
                  • Device information and usage data
                </ThemedText>
                
                <ThemedText style={styles.privacyPolicyHeading}>2. How We Use Your Information</ThemedText>
                <ThemedText style={styles.privacyPolicyParagraph}>
                  We use the information we collect about you for various purposes, including:
                </ThemedText>
                <ThemedText style={styles.privacyPolicyBulletPoint}>
                  • Providing, personalizing, and improving our application
                </ThemedText>
                <ThemedText style={styles.privacyPolicyBulletPoint}>
                  • Communicating with you, including sending notifications if enabled
                </ThemedText>
                <ThemedText style={styles.privacyPolicyBulletPoint}>
                  • Developing new features and services
                </ThemedText>
                <ThemedText style={styles.privacyPolicyBulletPoint}>
                  • Analyzing usage patterns to improve user experience
                </ThemedText>
                
                <ThemedText style={styles.privacyPolicyHeading}>3. Your Choices</ThemedText>
                <ThemedText style={styles.privacyPolicyParagraph}>
                  You can control certain aspects of how we collect and use your information:
                </ThemedText>
                <ThemedText style={styles.privacyPolicyBulletPoint}>
                  • Profile Information: You can update or delete your profile information at any time.
                </ThemedText>
                <ThemedText style={styles.privacyPolicyBulletPoint}>
                  • Notifications: You can enable or disable notifications in your profile settings.
                </ThemedText>
                <ThemedText style={styles.privacyPolicyBulletPoint}>
                  • Language Preferences: You can select your preferred language for content.
                </ThemedText>
                
                <ThemedText style={styles.privacyPolicyHeading}>4. Storage and Security</ThemedText>
                <ThemedText style={styles.privacyPolicyParagraph}>
                  We implement appropriate security measures to protect your personal information. However, no electronic transmission or storage technology is completely secure, and we cannot guarantee the absolute security of your data.
                </ThemedText>
                
                <ThemedText style={styles.privacyPolicyHeading}>5. Contact Us</ThemedText>
                <ThemedText style={styles.privacyPolicyParagraph}>
                  If you have any questions about this privacy policy or our data practices, please contact us at:
                </ThemedText>
                <ThemedText style={styles.privacyPolicyContactInfo}>
                  privacy@rescroll.com
                </ThemedText>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Help Center Chatbot Modal */}
      <Modal
        visible={showHelpCenterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHelpCenterModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.chatModalContent}>
            <View style={styles.chatHeader}>
              <ThemedText style={styles.chatHeaderTitle}>Help Center</ThemedText>
              <TouchableOpacity 
                style={styles.chatCloseButton} 
                onPress={() => setShowHelpCenterModal(false)}
              >
                <ThemedText style={styles.chatCloseButtonText}>✕</ThemedText>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              ref={chatScrollViewRef}
              style={styles.chatScrollView} 
              contentContainerStyle={styles.chatContentContainer}
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.map((message) => (
                <View 
                  key={message.id} 
                  style={[
                    styles.chatMessageContainer, 
                    message.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer
                  ]}
                >
                  <View 
                    style={[
                      styles.chatBubble, 
                      message.sender === 'user' ? styles.userChatBubble : styles.botChatBubble
                    ]}
                  >
                    <ThemedText 
                      style={[
                        styles.chatMessageText,
                        message.sender === 'user' ? styles.userMessageText : styles.botMessageText
                      ]}
                    >
                      {message.text}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.chatTimestamp}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </ThemedText>
                </View>
              ))}
              
              {isTyping && (
                <View style={[styles.chatMessageContainer, styles.botMessageContainer]}>
                  <View style={[styles.chatBubble, styles.botChatBubble, styles.typingBubble]}>
                    <ThemedText style={styles.typingText}>...</ThemedText>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                value={messageInput}
                onChangeText={setMessageInput}
                placeholder="Type your question here..."
                placeholderTextColor="#9CA3AF"
                multiline={false}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton, 
                  messageInput.trim() === '' ? styles.sendButtonDisabled : null
                ]} 
                onPress={handleSendMessage}
                disabled={messageInput.trim() === ''}
              >
                <ThemedText style={styles.sendButtonText}>Send</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E1E1E1',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  usernameContainer: {
    width: '100%',
    alignItems: 'center',
  },
  usernameDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  editButtonText: {
    fontSize: 20,
  },
  editUsernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  usernameInput: {
    fontSize: 20,
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  saveButton: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
  },
  chevronText: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  signOutButton: {
    marginVertical: 24,
    padding: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  modalCloseButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '300',
  },
  modalImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT - 200,
    borderRadius: 12,
  },
  editProfilePhotoButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  editProfilePhotoButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  languageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  languageModalContent: {
    width: '85%',
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  languageScrollView: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  languageModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  languageOption: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLanguageOption: {
    backgroundColor: '#EBF5FF',
  },
  languageOptionText: {
    fontSize: 16,
  },
  nativeLanguageName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  selectedLanguageText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  simpleLanguageModalContent: {
    width: '85%',
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
  simpleLanguageScrollView: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  simpleLanguageOption: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  simpleSelectedLanguageOption: {
    backgroundColor: '#EBF5FF',
  },
  simpleLanguageText: {
    fontSize: 16,
  },
  simpleCancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    width: '100%',
    alignItems: 'center',
  },
  simpleCancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  privacyPolicyModalContent: {
    width: '90%',
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  privacyPolicyHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative',
  },
  privacyPolicyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  privacyPolicyCloseButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
  },
  privacyPolicyCloseButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  privacyPolicyScrollView: {
    width: '100%',
    marginTop: 15,
  },
  privacyPolicyContent: {
    paddingBottom: 20,
  },
  privacyPolicySectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  privacyPolicyLastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  privacyPolicyHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  privacyPolicyParagraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 14,
  },
  privacyPolicyBulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 8,
  },
  privacyPolicyContactInfo: {
    fontSize: 16,
    color: '#2563EB',
    marginTop: 8,
  },
  chatModalContent: {
    width: '90%',
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  chatHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative',
    backgroundColor: '#2563EB',
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chatCloseButton: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  chatCloseButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  chatScrollView: {
    flex: 1,
    padding: 10,
  },
  chatContentContainer: {
    paddingBottom: 10,
  },
  chatMessageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  chatBubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 2,
  },
  userChatBubble: {
    backgroundColor: '#2563EB',
    borderTopRightRadius: 2,
  },
  botChatBubble: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 2,
  },
  chatMessageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#1F2937',
  },
  chatTimestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 5,
  },
  typingBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  typingText: {
    fontSize: 18,
    letterSpacing: 2,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  sendButton: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#2563EB',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
}); 