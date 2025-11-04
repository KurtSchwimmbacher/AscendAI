import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors } from '../styles/globalStyles';
import { AuthService } from '../services/authService';
import { UserProfile } from '../services/firestoreService';
import ProfileField from '../components/ProfileField';
import { useProfileManagement } from '../hooks/useProfileManagement';
import { useProfileImageUpload } from '../hooks/useProfileImageUpload';
import { useAccountDeletion } from '../hooks/useAccountDeletion';

const handleSignOut = async () => {
  try {
    await AuthService.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

export default function ProfileScreen() {
  const currentUser = AuthService.getCurrentUser();
  
  // Profile management hook
  const {
    profile,
    loading,
    error,
    isEditing,
    editData,
    saving,
    deleting: profileDeleting,
    loadProfile,
    handleEdit,
    handleCancelEdit,
    handleUpdateField,
    handleSaveProfile,
    handleDeleteAccount,
  } = useProfileManagement();

  // Account deletion hook
  const { deleting: accountDeleting, deleteAccount } = useAccountDeletion();

  // Profile image upload hook
  const { uploadingPicture, uploadProfilePicture } = useProfileImageUpload({
    currentUserId: currentUser?.uid || '',
    currentUserEmail: currentUser?.email || '',
    profile,
    isEditing,
    onImageUploaded: (imageUrl) => {
      handleUpdateField('profilePictureUrl', imageUrl);
      if (!isEditing && profile) {
        // Save immediately if not in edit mode
        handleSaveProfile();
      }
    },
    onProfileUpdated: loadProfile,
  });

  const deleting = profileDeleting || accountDeleting;

  // Handle account deletion with confirmation
  const handleDeleteAccountConfirmed = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete:\n\n• Your profile\n• All your routes\n• All your images\n\nYou will be signed out and returned to the login screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteAccount,
        },
      ]
    );
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
              onPress={isEditing ? uploadProfilePicture : undefined}
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
                onPress={uploadProfilePicture}
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
              onPress={handleDeleteAccountConfirmed}
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
