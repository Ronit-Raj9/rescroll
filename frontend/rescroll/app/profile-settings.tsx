import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, TextInput, Alert, ScrollView, Platform, StatusBar, Switch, KeyboardAvoidingView, FlatList, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from './_layout';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  Easing,
  interpolateColor,
  withSpring,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import SafeGestureHandler from '@/components/SafeGestureHandler';
import SafeModal from '@/components/SafeModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useColorScheme, useIsDarkMode } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/config/env';
import ProfilePictureActions from '@/components/ProfilePictureActions';

// Keys for AsyncStorage
const PROFILE_IMAGE_STORAGE_KEY = 'rescroll_profile_image';
const USERNAME_STORAGE_KEY = 'rescroll_username';
const NOTIFICATIONS_ENABLED_KEY = 'rescroll_notifications_enabled';
const NEWS_LANGUAGE_KEY = 'rescroll_news_language';
const INTEREST_TAGS_KEY = 'rescroll_interest_tags';
const BIO_STORAGE_KEY = 'rescroll_user_bio';

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
    zh: { code: 'zh', name: 'Mandarin Chinese', native: '中文' },
    hi: { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    es: { code: 'es', name: 'Spanish', native: 'Español' },
    fr: { code: 'fr', name: 'French', native: 'Français' },
    ar: { code: 'ar', name: 'Standard Arabic', native: 'العربية', rtl: true },
    bn: { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    ru: { code: 'ru', name: 'Russian', native: 'Русский' },
    pt: { code: 'pt', name: 'Portuguese', native: 'Português' },
    ur: { code: 'ur', name: 'Urdu', native: 'اردو', rtl: true },
    id: { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
    de: { code: 'de', name: 'German', native: 'Deutsch' },
    ja: { code: 'ja', name: 'Japanese', native: '日本語' },
    ng: { code: 'ng', name: 'Nigerian Pidgin', native: 'Nigerian Pidgin' },
    mr: { code: 'mr', name: 'Marathi', native: 'मराठी' },
    te: { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    tr: { code: 'tr', name: 'Turkish', native: 'Türkçe' },
    ta: { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    yue: { code: 'yue', name: 'Yue Chinese (Cantonese)', native: '粵語' },
    vi: { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
    ko: { code: 'ko', name: 'Korean', native: '한국어' },
    ha: { code: 'ha', name: 'Hausa', native: 'Hausa' },
    jv: { code: 'jv', name: 'Javanese', native: 'Basa Jawa' },
    it: { code: 'it', name: 'Italian', native: 'Italiano' },
    arz: { code: 'arz', name: 'Egyptian Arabic', native: 'مصرى', rtl: true },
    gu: { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    fa: { code: 'fa', name: 'Iranian Persian', native: 'فارسی', rtl: true },
    bho: { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी' },
    pa: { code: 'pa', name: 'Western Punjabi', native: 'پنجابی', rtl: true },
    am: { code: 'am', name: 'Amharic', native: 'አማርኛ' },
    // Keeping a few more from the previous list for completeness
    sw: { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
    th: { code: 'th', name: 'Thai', native: 'ไทย' },
    pl: { code: 'pl', name: 'Polish', native: 'Polski' },
    uk: { code: 'uk', name: 'Ukrainian', native: 'Українська' }
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
  
  // ADDING MISSING METHOD: Get language name from code
  getNameFromCode: function(code: string): string {
    console.log('[LanguageService] Getting name for code:', code);
    const language = this.getLanguageByCode(code);
    if (!language) {
      console.warn('[LanguageService] Language not found for code:', code);
      return 'English'; // Default fallback
    }
    return language.name;
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

// Add interest tags data structure
interface InterestTag {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

// Predefined interest tags with pastel colors
const PREDEFINED_TAGS: InterestTag[] = [
  { id: '1', name: 'Quantum Computing', color: '#F3E8FF', textColor: '#6C5CE7' },
  { id: '2', name: 'Neuroscience', color: '#FFF3E0', textColor: '#FF9800' },
  { id: '3', name: 'Genomics', color: '#FFE0E0', textColor: '#FF4D4F' },
  { id: '4', name: 'Renewable Energy', color: '#E6FFFB', textColor: '#13C2C2' },
  { id: '5', name: 'AI Ethics', color: '#FFF0F6', textColor: '#EB2F96' },
  { id: '6', name: 'Climate Science', color: '#F0F9FF', textColor: '#1890FF' },
  { id: '7', name: 'Robotics', color: '#F6FFED', textColor: '#52C41A' },
  { id: '8', name: 'Astrophysics', color: '#FCFFE6', textColor: '#FAAD14' },
  { id: '9', name: 'Biotechnology', color: '#F9F0FF', textColor: '#722ED1' },
  { id: '10', name: 'Materials Science', color: '#E6F7FF', textColor: '#0050B3' },
];

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const appContext = useContext(AppContext);
  const { user, getAuthToken, signOut } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  
  // Theme-related hooks
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === 'dark';
  const { toggleTheme } = useTheme();
  const theme = isDarkMode ? 'dark' : 'light';
  const colors = Colors[theme];
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [userBio, setUserBio] = useState('Exploring the frontiers of science and technology. Interested in machine learning, quantum computing, and renewable energy.');
  const [notifications, setNotifications] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [showInterestSelector, setShowInterestSelector] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<InterestTag[]>([]);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [chatMessages, setChatMessages] = useState<{id: string, text: string, isBot: boolean}[]>([
    {id: '1', text: 'Hello! How can I help you today?', isBot: true}
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);
  
  // Animation values
  const nameUnderlineWidth = useSharedValue(0);
  const bioUnderlineWidth = useSharedValue(0);
  const avatarScale = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const headerHeight = useSharedValue(60);
  const switchProgress = useSharedValue(isDarkMode ? 1 : 0);
  const scrollY = useSharedValue(0);
  
  // Add new state variable for full-screen image view
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  
  // Add state for tooltip visibility
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Add loading state for profile picture operations
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const apiUrl = getApiUrl();
  
  // Set mounted state after component mounts
  useEffect(() => {
    console.log('[ProfileScreen] Component mounted');
    setIsMounted(true);
    
    // Animate content in
    contentOpacity.value = withTiming(1, { 
      duration: 400,
      easing: Easing.out(Easing.quad)
    });
    
    return () => {
      console.log('[ProfileScreen] Component unmounting');
    };
  }, []);
  
  // Load saved data and request permissions when component mounts
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Set username from user data if available
        if (user?.username) {
          setUsername(user.username);
        }
        
        // Set profile image from user data if available
        if (user?.profile_image) {
          console.log('Setting profile image from user data:', user.profile_image);
          setProfileImage(user.profile_image);
          await AsyncStorage.setItem(PROFILE_IMAGE_STORAGE_KEY, user.profile_image);
        } else {
          // Load saved profile image from storage as fallback
        const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_STORAGE_KEY);
        if (savedImage) {
            console.log('Setting profile image from AsyncStorage:', savedImage);
          setProfileImage(savedImage);
        }
        }
        
        // Load bio
        const savedBio = await AsyncStorage.getItem(BIO_STORAGE_KEY);
        if (savedBio) {
          setUserBio(savedBio);
        }
        
        // Load notifications setting
        const notificationsSetting = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
        if (notificationsSetting !== null) {
          setNotifications(notificationsSetting === 'true');
        }
        
        // Load news language setting
        const savedLanguage = await AsyncStorage.getItem(NEWS_LANGUAGE_KEY);
        console.log('[ProfileScreen] Loaded language from storage:', savedLanguage);
        
        if (savedLanguage) {
          // Validate language code before setting
          const isValidLanguage = Object.keys(LanguageService.languages).includes(savedLanguage);
          console.log('[ProfileScreen] Is valid language code?', isValidLanguage);
          
          if (isValidLanguage) {
          setSelectedLanguage(savedLanguage);
          } else {
            console.warn('[ProfileScreen] Invalid language code in storage, using default');
            setSelectedLanguage('en'); // Default to English
            await AsyncStorage.setItem(NEWS_LANGUAGE_KEY, 'en');
          }
        } else {
          console.log('[ProfileScreen] No language in storage, using default');
          setSelectedLanguage('en');
        }
        
        // Load interest tags
        const savedTags = await AsyncStorage.getItem(INTEREST_TAGS_KEY);
        if (savedTags) {
          setSelectedInterests(JSON.parse(savedTags));
        } else {
          // Set default interests if none saved
          const defaultInterests = [PREDEFINED_TAGS[0], PREDEFINED_TAGS[5], PREDEFINED_TAGS[8]];
          setSelectedInterests(defaultInterests);
          await AsyncStorage.setItem(INTEREST_TAGS_KEY, JSON.stringify(defaultInterests));
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
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
  }, [user]);
  
  // Add additional check when the component is about to render
  useEffect(() => {
    // Log current language state when it changes
    console.log('[ProfileScreen] Current language code:', selectedLanguage);
    console.log('[ProfileScreen] Language exists in service:', 
      Object.keys(LanguageService.languages).includes(selectedLanguage));
    
    // Validate that we can get a name from the code
    try {
      const languageName = LanguageService.getNameFromCode(selectedLanguage);
      console.log('[ProfileScreen] Language name resolved to:', languageName);
    } catch (error) {
      console.error('[ProfileScreen] Error getting language name:', error);
    }
  }, [selectedLanguage]);
  
  // Show tooltip when profile image is first loaded
  useEffect(() => {
    if (profileImage && !showTooltip) {
      // Show tooltip briefly
      setShowTooltip(true);
      
      // Hide tooltip after 3 seconds
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [profileImage]);
  
  const handleBack = useCallback(() => {
    // Only navigate if the component is mounted
    if (isMounted) {
      console.log('[ProfileScreen] Back button pressed, attempting navigation');
      
      // Animate content out before navigating
      contentOpacity.value = withTiming(0, { 
        duration: 200,
        easing: Easing.in(Easing.quad)
      }, () => {
        // Wait until the end of the current event loop to navigate
        setTimeout(() => {
          console.log('[ProfileScreen] Delayed back navigation executing now');
          try {
            // Use a state-based approach for navigation to avoid the refresh
            console.log('[ProfileScreen] Using router.replace with params for back');
            router.replace({
              pathname: '/(tabs)',
              params: { 
                t: Date.now(),
                source: 'profileBack'
              }
            });
          } catch (error) {
            console.error('[ProfileScreen] Error navigating back:', error);
    router.back();
          }
        }, 50);
      });
    } else {
      console.log('[ProfileScreen] Back button pressed but component not mounted, ignoring');
    }
  }, [isMounted, router, contentOpacity]);
  
  const handleHelpCenter = () => {
    setShowHelpCenter(true);
  };
  
  const handlePrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
  };
  
  const handleEditName = () => {
    setEditingName(true);
    nameUnderlineWidth.value = withTiming(100, { duration: 300, easing: Easing.out(Easing.cubic) });
  };
  
  const handleSaveName = async () => {
    if (isUpdatingUsername) return;
    
    setEditingName(false);
    nameUnderlineWidth.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) });
    
    try {
      setIsUpdatingUsername(true);
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${apiUrl}/users/update`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update username');
      }

      // Update local storage after successful API update
      await AsyncStorage.setItem(USERNAME_STORAGE_KEY, username);
      Alert.alert('Success', 'Username updated successfully');
    } catch (error) {
      console.error('Error saving username:', error);
      // Revert to previous username if update fails
      if (user?.username) {
        setUsername(user.username);
      }
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update username. Please try again.');
    } finally {
      setIsUpdatingUsername(false);
    }
  };
  
  const handleEditBio = () => {
    setEditingBio(true);
    bioUnderlineWidth.value = withTiming(100, { duration: 300, easing: Easing.out(Easing.cubic) });
  };
  
  const handleSaveBio = async () => {
    setEditingBio(false);
    bioUnderlineWidth.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) });
    
    try {
      await AsyncStorage.setItem(BIO_STORAGE_KEY, userBio);
    } catch (error) {
      console.error('Error saving bio:', error);
    }
  };
  
  const handleAvatarPress = () => {
    // Animate avatar scale with spring for a bouncy effect
    avatarScale.value = withSequence(
      withSpring(0.92, { 
        damping: 4,
        stiffness: 300
      }),
      withSpring(1, { 
        damping: 10,
        stiffness: 200
      })
    );
    
    // If there's a profile image, show it in full screen, otherwise show options
    if (profileImage) {
      setShowFullScreenImage(true);
    } else {
      setShowImageOptions(true);
    }
  };
  
  // Add a long press handler specifically for edit options
  const handleAvatarLongPress = () => {
    setShowImageOptions(true);
  };
  
  // Add/remove interests
  const toggleInterest = async (tag: InterestTag) => {
    let updatedInterests;
    
    if (selectedInterests.some(interest => interest.id === tag.id)) {
      // Remove interest if already selected
      updatedInterests = selectedInterests.filter(interest => interest.id !== tag.id);
    } else {
      // Add interest if not already selected
      updatedInterests = [...selectedInterests, tag];
    }
    
    setSelectedInterests(updatedInterests);
    
    try {
      await AsyncStorage.setItem(INTEREST_TAGS_KEY, JSON.stringify(updatedInterests));
    } catch (error) {
      console.error('Error saving interests:', error);
    }
  };
  
  // Update handleProfilePictureUpload function to handle platform differences
  const handleProfilePictureUpload = async (imageUri: string) => {
    setIsUploadingImage(true);
    try {
      // Get the filename from the URI
      const filename = imageUri.split('/').pop() || 'image.jpg';
      
      // Determine mime type based on extension
      const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = extension === 'jpg' || extension === 'jpeg' 
        ? 'image/jpeg' 
        : extension === 'png' 
          ? 'image/png' 
          : extension === 'gif' 
            ? 'image/gif' 
            : 'image/jpeg';
      
      console.log('Uploading image:', { imageUri, filename, mimeType });
      
      // Get token using the auth context method
      const token = await getAuthToken();
      console.log('Token available:', !!token);
      
      if (!token) {
        console.error('Failed to get auth token. User might not be fully authenticated.');
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Create form data with platform-specific handling
      const formData = new FormData();
      
      // Platform-specific handling
      if (Platform.OS === 'web') {
        try {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append('file', blob, filename);
        } catch (error) {
          console.error('Error processing image for web:', error);
          throw new Error('Failed to process image for upload');
        }
      } else {
        // For React Native on iOS/Android
        formData.append('file', {
          uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
          name: filename,
          type: mimeType,
        } as any);
      }
      
      console.log('Sending request to:', `${apiUrl}/users/me/profile-image`);
      
      // Send the request to the backend
      const uploadResponse = await fetch(`${apiUrl}/users/me/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      console.log('Upload response status:', uploadResponse.status);
      
      // Read the response as text first to help with debugging
      const responseText = await uploadResponse.text();
      console.log('Response text:', responseText);
      
      // If the response is not ok, throw an error
      if (!uploadResponse.ok) {
        let errorMessage = 'Failed to upload profile picture';
        
        // Try to parse the response as JSON for error details
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use the response text as the error message
          if (responseText) {
            errorMessage = responseText;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse the successful response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid response from server');
      }
      
      console.log('Upload successful, image URL:', data.image_url);
      
      // Update the UI with the new profile image URL
      setProfileImage(data.image_url);
      await AsyncStorage.setItem(PROFILE_IMAGE_STORAGE_KEY, data.image_url);
      
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingImage(false);
      setShowImageOptions(false);
    }
  };

  // Update the image picker functions for better platform compatibility
  const takePicture = async () => {
    setShowImageOptions(false);
    
    try {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to make this work!');
        return;
      }
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
        base64: false,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
        console.log('Selected image URI:', imageUri);
        handleProfilePictureUpload(imageUri);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };
  
  const pickImage = async () => {
    setShowImageOptions(false);
    
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need photo library permissions to make this work!');
          return;
        }
      }
      
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
        base64: false,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
        console.log('Selected image URI:', imageUri);
        handleProfilePictureUpload(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };
  
  const onProfileImageDeleted = useCallback(async () => {
    console.log('[ProfileSettings] Profile image deleted callback received');
    
    // Update the state first for immediate UI update
    setProfileImage(null);
    
    try {
      // Remove from AsyncStorage
      await AsyncStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY);
      console.log('[ProfileSettings] Profile image removed from AsyncStorage');
      
      // If we have a user context, update that too
      if (user && user.profile_image) {
        console.log('[ProfileSettings] Profile image removed from user object');
        // Note: This would typically update the user context, but since we don't have
        // direct access to update the user object, the next profile fetch will update it
      }
      
      // Force a refresh of the avatar section
      avatarScale.value = withSequence(
        withSpring(0.9, { damping: 4, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    } catch (error) {
      console.error('[ProfileSettings] Error cleaning up after profile image deletion:', error);
    }
  }, [user, avatarScale]);

  // Update the avatar section in the render to show loading state
  const renderAvatarContent = () => {
    if (isUploadingImage) {
      return (
        <View style={[styles.avatarImage, styles.avatarLoadingContainer]}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      );
    }

    if (profileImage) {
      return <Image source={{ uri: profileImage }} style={styles.avatarImage} />;
    }

    return (
      <LinearGradient
        colors={['#8E2DE2', '#4A00E0']}
        style={styles.avatarPlaceholder}
      >
        <ThemedText style={styles.avatarPlaceholderText}>
          {username.substring(0, 2).toUpperCase()}
        </ThemedText>
      </LinearGradient>
    );
  };
  
  // Available languages from the service
  const languages = LanguageService.getLanguageOptions();
  
  const openLanguageModal = () => {
    setShowLanguageSelector(true);
  };

  const openLanguageSelector = () => {
    openLanguageModal();
  };

  // Animation styles
  const nameUnderlineStyle = useAnimatedStyle(() => {
    return {
      width: `${nameUnderlineWidth.value}%`,
      height: 2,
      backgroundColor: Colors.light.primary,
      marginTop: 4,
    };
  });
  
  const bioUnderlineStyle = useAnimatedStyle(() => {
    return {
      width: `${bioUnderlineWidth.value}%`,
      height: 2,
      backgroundColor: Colors.light.primary,
      marginTop: 4,
    };
  });
  
  const avatarScaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: avatarScale.value }]
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [
        { translateY: (1 - contentOpacity.value) * 20 }
      ]
    };
  });
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value - Math.min(scrollY.value, 10),
      opacity: 1 - (scrollY.value / 100)
    };
  });
  
  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  }, [scrollY]);
  
  const handleDarkModeToggle = useCallback((value: boolean) => {
    // Update the animation
    switchProgress.value = withTiming(value ? 1 : 0, { 
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
    
    // Toggle the theme using our ThemeContext
    toggleTheme();
    
    // Note: We don't need to manually save to AsyncStorage anymore
    // as the ThemeContext handles that for us
  }, [switchProgress, toggleTheme]);
  
  const backgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        switchProgress.value,
        [0, 1],
        [Colors.light.background, Colors.dark.background]
      )
    };
  });
  
  const textColorStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        switchProgress.value,
        [0, 1],
        [Colors.light.text, Colors.dark.text]
      )
    };
  });

  // Update switch progress when isDarkMode changes
  useEffect(() => {
    // Update the animation value to match the current theme
    switchProgress.value = withTiming(isDarkMode ? 1 : 0, { 
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
  }, [isDarkMode, switchProgress]);

  const handleSendMessage = () => {
    if (chatInput.trim() === '') return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: chatInput.trim(),
      isBot: false
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      let botResponse;
      const userText = chatInput.toLowerCase();
      
      if (userText.includes('account') || userText.includes('profile')) {
        botResponse = "Your account settings can be managed from the profile page. You can change your username, bio, and profile picture.";
      } else if (userText.includes('language') || userText.includes('translate')) {
        botResponse = "You can change the app language in the Settings section. We support 30 different languages.";
      } else if (userText.includes('dark mode') || userText.includes('theme')) {
        botResponse = "You can toggle dark mode on or off in the Settings section. This will change the app's appearance.";
      } else if (userText.includes('notification') || userText.includes('alert')) {
        botResponse = "Notification settings can be managed in the Settings section. You can turn them on or off.";
      } else if (userText.includes('privacy') || userText.includes('policy')) {
        botResponse = "You can read our privacy policy from the Support section. It explains how we handle your data.";
      } else {
        botResponse = "I'm not sure I understand. Could you rephrase your question? You can ask about account settings, language options, dark mode, notifications, or privacy policy.";
      }
      
      const botMessageObj = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true
      };
      
      setChatMessages(prev => [...prev, botMessageObj]);
      
      // Scroll to the bottom
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1000);
    
    // Scroll to bottom immediately after user message
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const selectLanguage = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    try {
      await AsyncStorage.setItem(NEWS_LANGUAGE_KEY, languageCode);
      // Additional logic for language change if needed
    } catch (error) {
      console.error('Error saving language preference', error);
    }
  };

  // Add new handler to view profile image in full screen
  const handleViewProfileImage = () => {
    if (profileImage) {
      setShowImageOptions(false);
      setShowFullScreenImage(true);
    }
  };

  // Add a debug function when component mounts
  useEffect(() => {
    const debugAuth = async () => {
      try {
        const token = await getAuthToken();
        console.log('[ProfileSettings] Auth token available:', !!token);
        console.log('[ProfileSettings] Token length:', token ? token.length : 0);
        if (token) {
          // Log partial token for debug purposes (first and last 10 chars)
          const partialToken = token.length > 20 
            ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
            : token;
          console.log('[ProfileSettings] Token sample:', partialToken);
        }
        
        console.log('[ProfileSettings] User data available:', !!user);
        if (user) {
          console.log('[ProfileSettings] Username:', user.username);
          console.log('[ProfileSettings] Profile image from API:', user.profile_image);
        }

        // Check if profile image is stored locally
        const storedImage = await AsyncStorage.getItem(PROFILE_IMAGE_STORAGE_KEY);
        console.log('[ProfileSettings] Profile image in storage:', !!storedImage);
      } catch (error) {
        console.error('[ProfileSettings] Error checking auth state:', error);
      }
    };

    debugAuth();
  }, []);

  // Make sure modal closure is handled properly
  const closeImageOptions = useCallback(() => {
    console.log('[ProfileSettings] Closing image options modal');
    setShowImageOptions(false);
  }, []);

  // Add handleLogout function
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <SafeGestureHandler style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Stack.Screen options={{ headerShown: false }} />
        
        <Animated.View style={[styles.container, backgroundStyle]}>
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Feather name="chevron-left" size={24} color={isDarkMode ? "#FFF" : "#000"} />
            </TouchableOpacity>
              <Animated.Text style={[styles.headerTitle, textColorStyle]}>Profile</Animated.Text>
            <View style={{ width: 32 }} />
          </View>
          
            <Animated.ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
          >
              <Animated.View style={contentAnimatedStyle}>
            {/* Profile Header Section */}
            <View style={styles.profileHeader}>
              {/* Profile Avatar */}
                  <View style={styles.avatarSection}>
                <Animated.View style={[styles.avatarContainer, avatarScaleStyle]}>
                  <TouchableOpacity 
                    style={styles.avatarWrapper}
                    onPress={handleAvatarPress} 
                          onLongPress={handleAvatarLongPress}
                          delayLongPress={500}
                    activeOpacity={0.8}
                    disabled={isUploadingImage}
                  >
                    {renderAvatarContent()}
                    {!isUploadingImage && (
                    <View style={styles.editAvatarButton}>
                      <Feather name="edit-2" size={12} color="#FFF" />
                    </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
                
                {showTooltip && !isUploadingImage && (
                  <Animated.View 
                    style={styles.tooltip}
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                  >
                    <ThemedText style={styles.tooltipText}>
                      Tap to view • Long press to edit
                    </ThemedText>
                  </Animated.View>
                )}
              </View>
            
            {/* Name and Bio */}
            <View style={styles.profileInfo}>
              {editingName ? (
                <View style={styles.editNameContainer}>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    style={styles.nameInput}
                    autoFocus
                    onBlur={handleSaveName}
                    onSubmitEditing={handleSaveName}
                  />
                  <Animated.View style={nameUnderlineStyle} />
                </View>
              ) : (
                <TouchableOpacity onPress={handleEditName} activeOpacity={0.7}>
                  <ThemedText style={styles.userName}>{username}</ThemedText>
                </TouchableOpacity>
              )}
              
              {editingBio ? (
                <View style={styles.editBioContainer}>
                  <TextInput
                    value={userBio}
                    onChangeText={setUserBio}
                    style={styles.bioInput}
                    multiline
                    numberOfLines={3}
                    autoFocus
                    onBlur={handleSaveBio}
                  />
                  <Animated.View style={bioUnderlineStyle} />
                </View>
              ) : (
                <TouchableOpacity onPress={handleEditBio} activeOpacity={0.7}>
                  <ThemedText style={styles.userBio}>{userBio}</ThemedText>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Interest Tags */}
            <View style={styles.interestsContainer}>
              <View style={styles.interestsHeader}>
                <ThemedText style={styles.interestsTitle}>Research Interests</ThemedText>
                    <TouchableOpacity onPress={() => setShowInterestSelector(true)} style={styles.editInterestsButton}>
                  <Feather name="edit" size={16} color={Colors.light.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.tagContainer}>
                {selectedInterests.map(tag => (
                  <View
                    key={tag.id}
                    style={[
                      styles.interestTag,
                      { backgroundColor: tag.color }
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.interestTagText,
                        { color: tag.textColor }
                      ]}
                    >
                      {tag.name}
                    </ThemedText>
                  </View>
                ))}
                
                {selectedInterests.length < 5 && (
                  <TouchableOpacity
                    style={styles.addInterestButton}
                        onPress={() => setShowInterestSelector(true)}
                  >
                    <Feather name="plus" size={16} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          
          {/* Other profile sections can be added here */}
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIcon, { backgroundColor: isDarkMode ? colors.backgroundSecondary : '#F3E8FF' }]}>
                  <Feather name="moon" size={18} color={isDarkMode ? colors.primary : '#6C5CE7'} />
                </View>
                <ThemedText style={[styles.settingText, { color: colors.text }]}>Dark Mode</ThemedText>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: colors.backgroundTertiary, true: colors.primary }}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor={colors.backgroundTertiary}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Feather name="bell" size={18} color="#FF9800" />
                </View>
                <ThemedText style={styles.settingText}>Notifications</ThemedText>
              </View>
              <Switch
                value={notifications}
                onValueChange={(value) => {
                  setNotifications(value);
                  AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, value ? 'true' : 'false');
                }}
                trackColor={{ false: '#E0E0E0', true: Colors.light.primary }}
                thumbColor={'#FFFFFF'}
              />
            </View>
            
            <TouchableOpacity style={styles.settingItem} onPress={openLanguageSelector}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#E6FFFB' }]}>
                  <Feather name="globe" size={18} color="#13C2C2" />
                </View>
                <ThemedText style={styles.settingText}>Language</ThemedText>
              </View>
              <View style={styles.settingItemRight}>
                <ThemedText style={styles.settingValue}>
                      {LanguageService.getNameFromCode(selectedLanguage)}
                </ThemedText>
                <Feather name="chevron-right" size={18} color="#999" />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* AI Features Section */}
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>AI Features</ThemedText>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/ai-icons')}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#F9F0FF' }]}>
                  <Feather name="star" size={18} color="#722ED1" />
                </View>
                <ThemedText style={styles.settingText}>AI Icon Gallery</ThemedText>
              </View>
              <Feather name="chevron-right" size={18} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>Support</ThemedText>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleHelpCenter}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#F9F0FF' }]}>
                  <Feather name="help-circle" size={18} color="#722ED1" />
                </View>
                <ThemedText style={styles.settingText}>Help Center</ThemedText>
              </View>
              <Feather name="chevron-right" size={18} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPolicy}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#FFF0F6' }]}>
                  <Feather name="shield" size={18} color="#EB2F96" />
                </View>
                <ThemedText style={styles.settingText}>Privacy Policy</ThemedText>
              </View>
              <Feather name="chevron-right" size={18} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomWidth: 0 }]} 
              onPress={handleLogout}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#FFF1F0' }]}>
                  <Feather name="log-out" size={18} color="#FF4D4F" />
                </View>
                <ThemedText style={[styles.settingText, { color: '#FF4D4F' }]}>Logout</ThemedText>
              </View>
            </TouchableOpacity>
          </View>
          </Animated.View>
        </Animated.ScrollView>
      
      {/* Profile Picture Options Bottom Sheet */}
      {showImageOptions && (
        <SafeModal
          transparent={true}
          animationType="slide"
          visible={showImageOptions}
          onRequestClose={closeImageOptions}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeImageOptions}
          >
            <View style={styles.bottomSheet}>
              <ProfilePictureActions
                profileImage={profileImage}
                onClose={closeImageOptions}
                onTakePicture={takePicture}
                onPickImage={pickImage}
                onViewImage={handleViewProfileImage}
                onImageDeleted={onProfileImageDeleted}
                getAuthToken={getAuthToken}
              />
              </View>
              </TouchableOpacity>
        </SafeModal>
      )}
      
      {/* Interest Selector Modal */}
      {showInterestSelector && (
        <SafeModal
            visible={showInterestSelector}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowInterestSelector(false)}
        >
            <View style={styles.modalContainer}>
              <View style={styles.interestSelectorContainer}>
                <View style={styles.interestSelectorHeader}>
                  <ThemedText style={styles.interestSelectorTitle}>Select Research Interests</ThemedText>
                <TouchableOpacity onPress={() => setShowInterestSelector(false)}>
                    <Feather name="x" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              
                <ScrollView style={styles.interestSelectorContent}>
              <View style={styles.interestTagsGrid}>
                    {PREDEFINED_TAGS.map((tag) => {
                  const isSelected = selectedInterests.some(interest => interest.id === tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                            styles.interestSelectorTag,
                        { backgroundColor: tag.color },
                        isSelected && styles.interestTagSelected
                      ]}
                      onPress={() => toggleInterest(tag)}
                    >
                      <ThemedText
                        style={[
                              styles.interestSelectorTagText,
                          { color: tag.textColor }
                        ]}
                      >
                        {tag.name}
                      </ThemedText>
                      {isSelected && (
                            <View style={styles.selectedIndicator}>
                              <Feather name="check" size={12} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
                </ScrollView>
              
              <TouchableOpacity 
                  style={styles.doneButton}
                onPress={() => setShowInterestSelector(false)}
              >
                  <ThemedText style={styles.doneButtonText}>Done</ThemedText>
              </TouchableOpacity>
            </View>
            </View>
        </SafeModal>
        )}
        
        {/* Help Center Bot Modal */}
      <SafeModal
          visible={showHelpCenter}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowHelpCenter(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.helpCenterHeader}>
              <TouchableOpacity 
                onPress={() => setShowHelpCenter(false)} 
                style={styles.helpCenterBackButton}
              >
                <Feather name="chevron-left" size={24} color="#000" />
          </TouchableOpacity>
              <ThemedText style={styles.helpCenterTitle}>Help Center</ThemedText>
              <View style={{ width: 40 }} />
            </View>
            
            <View style={styles.helpCenterContainer}>
              <ScrollView 
                ref={chatScrollRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContentContainer}
              >
                {chatMessages.map((message) => (
                  <View 
                    key={message.id} 
                    style={[
                      styles.chatBubble, 
                      message.isBot ? styles.botBubble : styles.userBubble
                    ]}
                  >
                    {message.isBot && (
                      <View style={styles.botAvatarContainer}>
                        <Feather name="help-circle" size={16} color="#fff" />
                      </View>
                    )}
                    <View style={styles.messageContent}>
                      <ThemedText 
                        style={[
                          styles.chatText, 
                          message.isBot ? styles.botText : styles.userText
                        ]}
                      >
                        {message.text}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </ScrollView>
              
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inputContainer}
              >
                <TextInput
                  style={styles.chatInput}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Ask a question..."
                  placeholderTextColor="#999"
                  onSubmitEditing={handleSendMessage}
                  returnKeyType="send"
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                  <Feather name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </View>
          </SafeAreaView>
      </SafeModal>
        
        {/* Privacy Policy Modal */}
      <SafeModal
          visible={showPrivacyPolicy}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowPrivacyPolicy(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.privacyHeader}>
              <TouchableOpacity 
                onPress={() => setShowPrivacyPolicy(false)} 
                style={styles.privacyBackButton}
              >
                <Feather name="chevron-left" size={24} color="#000" />
              </TouchableOpacity>
              <ThemedText style={styles.privacyTitle}>Privacy Policy</ThemedText>
              <View style={{ width: 40 }} />
            </View>
            
            <ScrollView style={styles.privacyContainer}>
              <View style={styles.privacyContent}>
                <ThemedText style={styles.privacySection}>Last Updated: May 1, 2023</ThemedText>
                
                <ThemedText style={styles.privacyHeading}>1. Introduction</ThemedText>
                <ThemedText style={styles.privacyText}>
                  Welcome to Rescroll. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we collect, use, and disclose your information when you use our application.
                </ThemedText>
                
                <ThemedText style={styles.privacyHeading}>2. Data We Collect</ThemedText>
                <ThemedText style={styles.privacyText}>
                  We collect information that you provide directly to us, such as when you create an account, update your profile, or interact with features in the app. This includes your name, email address, profile picture, and any other information you choose to provide.
                </ThemedText>
                
                <ThemedText style={styles.privacyHeading}>3. How We Use Your Data</ThemedText>
                <ThemedText style={styles.privacyText}>
                  We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect Rescroll and our users. We also use the data to communicate with you about updates, security alerts, and support messages.
                </ThemedText>
                
                <ThemedText style={styles.privacyHeading}>4. Data Sharing and Disclosure</ThemedText>
                <ThemedText style={styles.privacyText}>
                  We do not share your personal information with third parties except in limited circumstances, such as when required by law, to protect our rights, or with your explicit consent.
                </ThemedText>
                
                <ThemedText style={styles.privacyHeading}>5. Data Security</ThemedText>
                <ThemedText style={styles.privacyText}>
                  We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
                </ThemedText>
                
                <ThemedText style={styles.privacyHeading}>6. Your Rights</ThemedText>
                <ThemedText style={styles.privacyText}>
                  Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data.
                </ThemedText>
                
                <ThemedText style={styles.privacyHeading}>7. Changes to This Policy</ThemedText>
                <ThemedText style={styles.privacyText}>
                  We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.
                </ThemedText>
                
                <ThemedText style={styles.privacyHeading}>8. Contact Us</ThemedText>
                <ThemedText style={styles.privacyText}>
                  If you have any questions about this privacy policy or our data practices, please contact us at privacy@rescroll.com.
                </ThemedText>
              </View>
            </ScrollView>
          </SafeAreaView>
      </SafeModal>
        
        {/* Language Selector Modal */}
      <SafeModal
          visible={showLanguageSelector}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLanguageSelector(false)}
        >
          <View style={styles.languageModalContainer}>
            <View style={styles.languageModalContent}>
              <View style={styles.languageModalHeader}>
                <ThemedText style={styles.languageModalTitle}>Select Language</ThemedText>
                <TouchableOpacity onPress={() => setShowLanguageSelector(false)}>
                  <Feather name="x" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={Object.values(LanguageService.languages)}
                keyExtractor={(item) => item.code}
                style={styles.languageList}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.languageItem,
                      selectedLanguage === item.code && styles.selectedLanguageItem
                    ]}
                    onPress={() => {
                      selectLanguage(item.code);
                      setShowLanguageSelector(false);
                    }}
                  >
                    <View style={styles.languageInfo}>
                      <ThemedText style={styles.languageName}>{item.name}</ThemedText>
                      <ThemedText style={styles.languageNative}>{item.native}</ThemedText>
                    </View>
                    {selectedLanguage === item.code && (
                      <Feather name="check" size={18} color={Colors.light.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
      </SafeModal>
        
        {/* Full Screen Image Viewer Modal */}
      <SafeModal
          visible={showFullScreenImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFullScreenImage(false)}
        >
          <View style={styles.fullScreenImageContainer}>
            <TouchableOpacity 
              style={styles.fullScreenCloseButton}
              onPress={() => setShowFullScreenImage(false)}
            >
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
            
            {profileImage && (
              <Image 
                source={{ uri: profileImage }} 
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
      </SafeModal>
      </Animated.View>
  </SafeAreaView>
</SafeGestureHandler>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    height: 56,
    zIndex: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  contentContainer: {
    flex: 1,
  },
  profileHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatarContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editNameContainer: {
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 200,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  bioContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  editNameButton: {
    padding: 8,
    marginLeft: 8,
  },
  editBioButton: {
    padding: 8,
    marginLeft: 8,
  },
  editBioContainer: {
    width: '100%',
    alignItems: 'center',
  },
  bioInput: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    minHeight: 60,
  },
  userBio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    maxWidth: '90%',
    lineHeight: 22,
  },
  interestsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  interestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  interestsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editInterestsButton: {
    padding: 8,
  },
  interestTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    paddingHorizontal: 16,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F3E8FF',
  },
  interestTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C5CE7',
  },
  addInterestButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
  },
  addInterestText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  sectionContainer: {
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  settingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 36,
    minHeight: 200,
  },
  bottomSheetHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bottomSheetIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#DDDDDD',
    borderRadius: 3,
    marginBottom: 10,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  bottomSheetContent: {
    paddingBottom: 24,
  },
  bottomSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  bottomSheetOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  interestSelectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  interestSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  interestSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  interestSelectorContent: {
    flex: 1,
    paddingVertical: 8,
  },
  interestTagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  interestSelectorTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  interestSelectorTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  interestTagSelected: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  doneButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpCenterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  helpCenterBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  helpCenterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  helpCenterContainer: {
    flex: 1,
    padding: 16,
  },
  chatContainer: {
    flex: 1,
  },
  chatContentContainer: {
    padding: 16,
  },
  chatBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  botBubble: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#E6FFFB',
    borderRadius: 12,
    padding: 12,
  },
  botAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  chatText: {
    fontSize: 16,
    color: '#000',
  },
  botText: {
    fontSize: 16,
    color: '#333',
  },
  userText: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  chatInput: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  privacyBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  privacyContainer: {
    flex: 1,
    padding: 16,
  },
  privacyContent: {
    padding: 16,
  },
  privacySection: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  privacyHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 16,
    color: '#666',
  },
  languageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  languageNative: {
    fontSize: 14,
    color: '#666',
  },
  selectedLanguageItem: {
    backgroundColor: '#E6FFFB',
  },
  fullScreenImageContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  tooltip: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 5,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  avatarLoadingContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 