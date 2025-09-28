import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { globalStyles, colors } from '../../styles/globalStyles';
import KeyboardAwareButton from '../../components/KeyboardAwareButton';

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
  const [isValid, setIsValid] = useState(false);

  const handleTakePhoto = () => {
    // TODO: Implement camera functionality
    Alert.alert(
      'Camera',
      'Camera functionality will be implemented here. For now, you can skip this step.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: handleSkip },
      ]
    );
  };

  const handleChooseFromLibrary = () => {
    // TODO: Implement image picker functionality
    Alert.alert(
      'Photo Library',
      'Photo library functionality will be implemented here. For now, you can skip this step.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: handleSkip },
      ]
    );
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
            {profilePictureUrl ? (
              <Image source={{ uri: profilePictureUrl }} style={styles.avatar} />
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
            style={[globalStyles.buttonFullWidth, styles.actionButton]}
            onPress={handleTakePhoto}
          >
            <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>
              📷 Take Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.buttonFullWidthSecondary, styles.actionButton]}
            onPress={handleChooseFromLibrary}
          >
            <Text style={[globalStyles.textButtonLarge, globalStyles.textPrimary]}>
              🖼️ Choose from Library
            </Text>
          </TouchableOpacity>
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

      {/* Floating action button - only show if we have a picture */}
      {isValid && (
        <KeyboardAwareButton
          onPress={handleNext}
          disabled={!isValid}
          icon="→"
        />
      )}
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
  skipContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});
