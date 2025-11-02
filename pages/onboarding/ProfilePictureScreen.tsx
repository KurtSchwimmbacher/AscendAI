import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles, colors } from '../../styles/globalStyles';
import { StorageService } from '../../services/storageService';
import { AuthService } from '../../services/authService';

interface ProfilePictureScreenProps {
  value: string;
  onNext: (field: 'profilePictureUrl', value: string) => void;
  onBack?: () => void;
  onSkip: () => void;
  step: number;
  totalSteps: number;
  fieldName: 'profilePictureUrl';
}

export default function ProfilePictureScreen({ 
  value, 
  onNext, 
  onBack, 
  onSkip, 
  step, 
  totalSteps 
}: ProfilePictureScreenProps) {
  const [profilePictureUrl, setProfilePictureUrl] = useState(value);
  const [isValid, setIsValid] = useState(!!value);
  const [uploading, setUploading] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(value || null);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'We need access to your camera and photo library to add a profile picture.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const uploadImageToStorage = async (imageUri: string): Promise<string> => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Generate unique filename
    const filename = `profile_${currentUser.uid}_${Date.now()}.jpg`;
    
    // Upload to Firebase Storage
    const downloadURL = await StorageService.uploadProfilePicture(
      imageUri,
      currentUser.uid,
      filename
    );

    return downloadURL;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setLocalImageUri(uri);
        setIsValid(true);
        
        // Upload to Firebase Storage
        setUploading(true);
        try {
          const downloadURL = await uploadImageToStorage(uri);
          setProfilePictureUrl(downloadURL);
        } catch (error) {
          Alert.alert(
            'Upload Failed',
            error instanceof Error ? error.message : 'Failed to upload image. Please try again.',
            [{ text: 'OK' }]
          );
          setLocalImageUri(null);
          setIsValid(false);
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to open camera. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleChooseFromLibrary = async () => {
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
        const uri = result.assets[0].uri;
        setLocalImageUri(uri);
        setIsValid(true);
        
        // Upload to Firebase Storage
        setUploading(true);
        try {
          const downloadURL = await uploadImageToStorage(uri);
          setProfilePictureUrl(downloadURL);
        } catch (error) {
          Alert.alert(
            'Upload Failed',
            error instanceof Error ? error.message : 'Failed to upload image. Please try again.',
            [{ text: 'OK' }]
          );
          setLocalImageUri(null);
          setIsValid(false);
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to open photo library. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleNext = () => {
    if (isValid) {
      onNext('profilePictureUrl', profilePictureUrl);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.content}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={[globalStyles.textCaption, globalStyles.textMuted]}>
            Step {step} of {totalSteps}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[globalStyles.textTitle, globalStyles.textPrimary]}>
            Add a profile picture
          </Text>
          <Text style={[globalStyles.textSubheadingSmall, globalStyles.textSecondary]}>
            Help others recognize you (optional)
          </Text>
        </View>

        {/* Profile picture preview */}
        <View style={styles.pictureContainer}>
          <View style={styles.avatarContainer}>
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color={colors.black} />
                <Text style={[globalStyles.textBodySmall, { marginTop: 12 }]}>
                  Uploading...
                </Text>
              </View>
            ) : localImageUri ? (
              <Image source={{ uri: localImageUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>?</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[
              globalStyles.buttonFullWidth, 
              styles.actionButton,
              uploading && styles.buttonDisabled
            ]}
            onPress={handleTakePhoto}
            disabled={uploading}
          >
            <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>
              📷 Take Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              globalStyles.buttonFullWidthSecondary, 
              styles.actionButton,
              uploading && styles.buttonDisabled
            ]}
            onPress={handleChooseFromLibrary}
            disabled={uploading}
          >
            <Text style={[globalStyles.textButtonLarge, globalStyles.textPrimary]}>
              🖼️ Choose from Library
            </Text>
          </TouchableOpacity>

          {isValid && !uploading && (
            <TouchableOpacity 
              style={[globalStyles.buttonFullWidth, styles.actionButton, styles.continueButton]}
              onPress={handleNext}
            >
              <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>
                Continue
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Skip option */}
        <View style={styles.skipContainer}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[globalStyles.textBodySmall, globalStyles.textMuted]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.black,
    borderRadius: 2,
  },
  header: {
    marginBottom: 40,
  },
  pictureContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  actions: {
    gap: 16,
    marginBottom: 40,
  },
  actionButton: {
    marginBottom: 0,
  },
  continueButton: {
    marginTop: 8,
    backgroundColor: colors.success,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  uploadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  skipContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});
