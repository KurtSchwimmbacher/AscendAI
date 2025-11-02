import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles, colors } from '../styles/globalStyles';
import { AuthService } from '../services/authService';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import { StorageService } from '../services/storageService';

const handleSignOut = async () => {
  try {
    await AuthService.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

interface ProfileFieldProps {
  icon: string;
  label: string;
  value: string | undefined;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  placeholder?: string;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ icon, label, value, editable, onChangeText, placeholder }) => {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon as any} size={20} color={colors.black} />
      </View>
      <View style={styles.fieldContent}>
        <Text style={[globalStyles.textCaption, globalStyles.textMuted]}>{label}</Text>
        {editable && onChangeText ? (
          <TextInput
            style={[globalStyles.input, styles.editableInput]}
            value={value || ''}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
          />
        ) : (
          <Text style={[globalStyles.textBody, globalStyles.textPrimary]}>{value || '—'}</Text>
        )}
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!currentUser) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userProfile = await FirestoreService.getUserProfile(currentUser.uid);
      setProfile(userProfile);
      setEditData(userProfile || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (profile) {
      setEditData({ ...profile });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(profile || {});
  };

  const handleUpdateField = (field: keyof UserProfile, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !profile) return;

    try {
      setSaving(true);
      setError(null);

      await FirestoreService.createOrUpdateUserProfile({
        uid: currentUser.uid,
        email: currentUser.email || profile.email,
        ...editData,
      });

      await loadProfile();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeProfilePicture = async () => {
    if (!currentUser) return;

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
          const filename = `profile_${currentUser.uid}_${Date.now()}.jpg`;
          const downloadURL = await StorageService.uploadProfilePicture(
            result.assets[0].uri,
            currentUser.uid,
            filename
          );

          // Update profile picture
          setEditData((prev) => ({ ...prev, profilePictureUrl: downloadURL }));
          if (!isEditing) {
            // If not in edit mode, save immediately
            await FirestoreService.createOrUpdateUserProfile({
              uid: currentUser.uid,
              email: currentUser.email || profile?.email || '',
              ...profile,
              profilePictureUrl: downloadURL,
            });
            await loadProfile();
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
  };

  const requestPermissions = async () => {
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
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete:\n\n• Your profile\n• All your routes\n• All your images\n\nYou will be signed out and returned to the login screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    if (!currentUser) return;

    try {
      setDeleting(true);
      const userId = currentUser.uid;

      // Delete user data (in parallel)
      await Promise.all([
        FirestoreService.deleteUserProfile(userId),
        FirestoreService.deleteUserRoutes(userId),
        StorageService.deleteProfilePicture(userId),
        StorageService.deleteUserRoutes(userId),
      ]);

      // Delete Firebase Auth account (this will trigger navigation via AppNavigator)
      await AuthService.deleteUser();
    } catch (err) {
      setDeleting(false);
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      Alert.alert('Error', message);
      console.error('Error deleting account:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.black} />
          <Text style={[globalStyles.textBody, { marginTop: 16 }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !profile || !currentUser) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[globalStyles.textBody, { marginTop: 16, textAlign: 'center' }]}>
            {error || 'Failed to load profile'}
          </Text>
          <TouchableOpacity
            style={[globalStyles.buttonFullWidth, { marginTop: 24 }]}
            onPress={loadProfile}
          >
            <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) return null;

  const displayProfile = isEditing ? editData : profile;
  const displayPictureUrl = isEditing ? editData.profilePictureUrl : profile.profilePictureUrl;

  return (
    <SafeAreaView style={globalStyles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={globalStyles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header with Edit Button */}
          <View style={styles.headerActions}>
            {isEditing ? (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleCancelEdit} disabled={saving || deleting}>
                  <Text style={[globalStyles.textBody, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleSaveProfile} 
                  disabled={saving || deleting}
                  style={styles.saveButton}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={[globalStyles.textBody, { color: colors.white, fontWeight: 'bold' }]}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleEdit} disabled={deleting}>
                <Ionicons name="create-outline" size={24} color={colors.black} />
              </TouchableOpacity>
            )}
          </View>

          {/* Profile Picture & Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={isEditing ? handleChangeProfilePicture : undefined}
              disabled={!isEditing || uploadingPicture}
            >
              {uploadingPicture ? (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="large" color={colors.black} />
                </View>
              ) : displayPictureUrl ? (
                <Image source={{ uri: displayPictureUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={48} color={colors.textMuted} />
                </View>
              )}
              {isEditing && (
                <View style={styles.avatarEditOverlay}>
                  <Ionicons name="camera" size={24} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity 
                style={styles.changePictureButton}
                onPress={handleChangeProfilePicture}
                disabled={uploadingPicture}
              >
                <Text style={[globalStyles.textBodySmall, { color: colors.black }]}>
                  Change Picture
                </Text>
              </TouchableOpacity>
            )}
            <Text style={[globalStyles.textTitle, globalStyles.textPrimary, styles.name]}>
              {displayProfile.fullName || 'User'}
            </Text>
            {displayProfile.username && (
              <Text style={[globalStyles.textBody, globalStyles.textSecondary, styles.username]}>
                @{displayProfile.username}
              </Text>
            )}
          </View>

          {/* Profile Information */}
          <View style={styles.infoSection}>
            <ProfileField
              icon="mail-outline"
              label="Email"
              value={profile.email || currentUser.email || undefined}
            />
            <ProfileField
              icon="person-outline"
              label="Full Name"
              value={isEditing ? editData.fullName : profile.fullName}
              editable={isEditing}
              onChangeText={(text) => handleUpdateField('fullName', text)}
              placeholder="Enter your full name"
            />
            <ProfileField
              icon="at-outline"
              label="Username"
              value={isEditing ? editData.username : profile.username}
              editable={isEditing}
              onChangeText={(text) => handleUpdateField('username', text.toLowerCase().replace(/\s/g, ''))}
              placeholder="Enter username"
            />
            <ProfileField
              icon="calendar-outline"
              label="Date of Birth"
              value={isEditing ? editData.dateOfBirth : profile.dateOfBirth}
              editable={isEditing}
              onChangeText={(text) => handleUpdateField('dateOfBirth', text)}
              placeholder="YYYY-MM-DD"
            />
            <ProfileField
              icon="call-outline"
              label="Phone Number"
              value={isEditing ? editData.phoneNumber : profile.phoneNumber}
              editable={isEditing}
              onChangeText={(text) => handleUpdateField('phoneNumber', text)}
              placeholder="Enter phone number"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={[globalStyles.buttonFullWidth, styles.actionButton]} 
              onPress={handleSignOut}
              disabled={saving || deleting}
            >
              <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                globalStyles.buttonFullWidthDanger, 
                styles.actionButton,
                deleting && styles.buttonDisabled
              ]} 
              onPress={handleDeleteAccount}
              disabled={saving || deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>Delete Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 0,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  saveButton: {
    backgroundColor: colors.black,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: colors.border,
    marginBottom: 16,
    position: 'relative',
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
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  uploadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  changePictureButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  name: {
    marginTop: 8,
  },
  username: {
    marginTop: 4,
  },
  infoSection: {
    padding: 20,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  fieldContent: {
    flex: 1,
  },
  editableInput: {
    marginTop: 4,
    paddingVertical: 8,
    fontSize: 16,
  },
  actionsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
