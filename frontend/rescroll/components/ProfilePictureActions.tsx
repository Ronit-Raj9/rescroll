import React, { useState } from 'react';
import { TouchableOpacity, Alert, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '@/config/env';

const PROFILE_IMAGE_STORAGE_KEY = 'rescroll_profile_image';

interface ProfilePictureActionsProps {
  profileImage: string | null;
  onClose: () => void;
  onTakePicture: () => void;
  onPickImage: () => void;
  onViewImage: () => void;
  onImageDeleted: () => void;
  getAuthToken: () => Promise<string | null>;
}

const ProfilePictureActions = ({
  profileImage,
  onClose,
  onTakePicture,
  onPickImage,
  onViewImage,
  onImageDeleted,
  getAuthToken,
}: ProfilePictureActionsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const apiUrl = getApiUrl();

  const handleDeleteProfilePicture = async () => {
    console.log('[ProfilePictureActions] Starting profile picture deletion');
    console.log('[ProfilePictureActions] Current profile image:', profileImage);
    
    if (!profileImage) {
      console.log('[ProfilePictureActions] No profile image to delete');
      onClose();
      return;
    }

    setIsDeleting(true);

    try {
      const token = await getAuthToken();
      console.log('[ProfilePictureActions] Auth token retrieved:', !!token);
      
      if (!token) {
        console.error('[ProfilePictureActions] No auth token found for profile picture deletion');
        Alert.alert('Authentication Error', 'Please log in again to perform this action.');
        setIsDeleting(false);
        onClose();
        return;
      }

      const deleteUrl = `${apiUrl}/users/me/profile-image`;
      console.log('[ProfilePictureActions] Sending DELETE request to:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[ProfilePictureActions] Delete response status:', response.status);
      const responseText = await response.text();
      console.log('[ProfilePictureActions] Delete response body:', responseText);

      if (!response.ok) {
        let errorMessage = 'Failed to delete profile picture';
        try {
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.detail || errorMessage;
          }
        } catch (e) {
          // If parsing fails, use text as is
          if (responseText) errorMessage = responseText;
        }
        throw new Error(errorMessage);
      }

      // Clear from storage
      await AsyncStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY);
      
      console.log('[ProfilePictureActions] Profile image successfully deleted');
      
      // Notify parent component
      onImageDeleted();
      
      // Show success message
      Alert.alert('Success', 'Profile picture has been removed');
    } catch (error: any) {
      console.error('[ProfilePictureActions] Error deleting profile picture:', error);
      Alert.alert('Error', error?.message || 'Failed to delete profile picture. Please try again.');
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const handleRemoveButtonPress = () => {
    console.log('[ProfilePictureActions] Direct remove button pressed');
    if (!profileImage) {
      console.log('[ProfilePictureActions] No profile image to delete (direct handler)');
      return;
    }
    
    // Execute the delete operation directly without using Alert
    handleDeleteProfilePicture();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Profile Picture</ThemedText>
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={24} color="#999" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.option} onPress={onTakePicture}>
        <Feather name="camera" size={22} color="#333" />
        <ThemedText style={styles.optionText}>Take Photo</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.option} onPress={onPickImage}>
        <Feather name="image" size={22} color="#333" />
        <ThemedText style={styles.optionText}>Choose from Library</ThemedText>
      </TouchableOpacity>
      
      {profileImage && (
        <TouchableOpacity 
          style={styles.option} 
          onPress={handleRemoveButtonPress}
          disabled={isDeleting}
        >
          <Feather name="trash-2" size={22} color="#FF4D4F" />
          {isDeleting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FF4D4F" />
              <ThemedText style={[styles.optionText, { color: '#FF4D4F', marginLeft: 8 }]}>
                Removing...
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={[styles.optionText, { color: '#FF4D4F' }]}>
              Remove Photo
            </ThemedText>
          )}
        </TouchableOpacity>
      )}
      
      {profileImage && (
        <TouchableOpacity style={styles.option} onPress={onViewImage}>
          <Feather name="maximize-2" size={22} color="#333" />
          <ThemedText style={styles.optionText}>View Full Image</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default ProfilePictureActions; 