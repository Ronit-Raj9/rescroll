import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, TextInput, Alert, ScrollView, Platform, Modal, Dimensions, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Keys for AsyncStorage
const PROFILE_IMAGE_STORAGE_KEY = 'rescroll_profile_image';
const USERNAME_STORAGE_KEY = 'rescroll_username';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const colors = Colors.light;
  
  const [username, setUsername] = useState('John Doe');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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
    // Navigation router.back() sometimes doesn't work in modal screens
    // Force navigating back to the previous screen
    try {
      router.back();
    } catch (error) {
      console.error('Error navigating back:', error);
      // Fallback to main tabs if back navigation fails
      router.replace('/(tabs)');
    }
  };
  
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              // Clear user data from AsyncStorage
              await AsyncStorage.multiRemove([PROFILE_IMAGE_STORAGE_KEY, USERNAME_STORAGE_KEY]);
              
              // TODO: Implement actual sign out functionality
              router.replace('/login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  const handlePrivacyPolicy = () => {
    // TODO: Navigate to privacy policy page
    Alert.alert('Privacy Policy', 'Privacy policy content would be displayed here.');
  };
  
  const handleHelpCenter = () => {
    // TODO: Navigate to help center
    Alert.alert('Help Center', 'Help center content would be displayed here.');
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
              
              <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                <ThemedText style={styles.signOutButtonText}>Sign Out</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </ThemedView>
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
}); 