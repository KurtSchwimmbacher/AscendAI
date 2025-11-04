import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StorageService } from '../services/storageService';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import { AuthService } from '../services/authService';

interface UseProfileImageUploadProps {
  currentUserId: string;
  currentUserEmail: string;
  profile: UserProfile | null;
  isEditing: boolean;
  onImageUploaded?: (imageUrl: string) => void;
  onProfileUpdated?: () => void;
}

interface UseProfileImageUploadReturn {
  uploadingPicture: boolean;
  uploadProfilePicture: () => Promise<void>;
  updateEditDataWithImage: (imageUrl: string) => void;
}

/**
 * Hook for managing profile picture uploads
 */
export function useProfileImageUpload({
  currentUserId,
  currentUserEmail,
  profile,
  isEditing,
  onImageUploaded,
  onProfileUpdated,
}: UseProfileImageUploadProps): UseProfileImageUploadReturn {
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'We need access to your photo library to change your profile picture.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }, []);

  const uploadProfilePicture = useCallback(async () => {
    if (!currentUserId) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingPicture(true);
        try {
          const filename = `profile_${currentUserId}_${Date.now()}.jpg`;
          const downloadURL = await StorageService.uploadProfilePicture(
            result.assets[0].uri,
            currentUserId,
            filename
          );

          onImageUploaded?.(downloadURL);

          // If not in edit mode, save immediately
          if (!isEditing && profile) {
            await FirestoreService.createOrUpdateUserProfile({
              uid: currentUserId,
              email: currentUserEmail || profile.email || '',
              ...profile,
              profilePictureUrl: downloadURL,
            });
            onProfileUpdated?.();
            Alert.alert('Success', 'Profile picture updated successfully');
          }
        } catch (error) {
          Alert.alert(
            'Upload Failed',
            error instanceof Error ? error.message : 'Failed to upload image. Please try again.'
          );
        } finally {
          setUploadingPicture(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
    }
  }, [currentUserId, currentUserEmail, profile, isEditing, requestPermissions, onImageUploaded, onProfileUpdated]);

  const updateEditDataWithImage = useCallback((imageUrl: string) => {
    // This is a callback that can be used to update edit data externally
    // The actual state update should be handled by the parent component
  }, []);

  return {
    uploadingPicture,
    uploadProfilePicture,
    updateEditDataWithImage,
  };
}

