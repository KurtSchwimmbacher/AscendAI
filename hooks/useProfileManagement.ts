import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { AuthService } from '../services/authService';
import { FirestoreService, UserProfile } from '../services/firestoreService';

interface UseProfileManagementReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  editData: Partial<UserProfile>;
  saving: boolean;
  deleting: boolean;
  loadProfile: () => Promise<void>;
  handleEdit: () => void;
  handleCancelEdit: () => void;
  handleUpdateField: (field: keyof UserProfile, value: string) => void;
  handleSaveProfile: () => Promise<void>;
  handleDeleteAccount: () => void;
}

/**
 * Hook for managing profile data and operations
 */
export function useProfileManagement(): UseProfileManagementReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const currentUser = AuthService.getCurrentUser();

  const loadProfile = useCallback(async () => {
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
  }, [currentUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleEdit = useCallback(() => {
    if (profile) {
      setEditData({ ...profile });
      setIsEditing(true);
    }
  }, [profile]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditData(profile || {});
  }, [profile]);

  const handleUpdateField = useCallback((field: keyof UserProfile, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveProfile = useCallback(async () => {
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
  }, [currentUser, profile, editData, loadProfile]);

  // Note: handleDeleteAccount is kept for backward compatibility but should be handled by useAccountDeletion hook
  const handleDeleteAccount = useCallback(() => {
    // This is just to maintain the interface
  }, []);

  return {
    profile,
    loading,
    error,
    isEditing,
    editData,
    saving,
    deleting,
    loadProfile,
    handleEdit,
    handleCancelEdit,
    handleUpdateField,
    handleSaveProfile,
    handleDeleteAccount,
  };
}

