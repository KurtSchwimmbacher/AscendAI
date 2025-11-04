import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { AuthService } from '../services/authService';
import { FirestoreService } from '../services/firestoreService';
import { StorageService } from '../services/storageService';

interface UseAccountDeletionReturn {
  deleting: boolean;
  deleteAccount: () => Promise<void>;
}

/**
 * Hook for managing account deletion
 */
export function useAccountDeletion(): UseAccountDeletionReturn {
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = useCallback(async () => {
    const currentUser = AuthService.getCurrentUser();
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
  }, []);

  return {
    deleting,
    deleteAccount,
  };
}

