import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { AuthService } from '../services/authService';
import { FirestoreService, FirestoreRouteDocument } from '../services/firestoreService';
import { StorageService } from '../services/storageService';

interface UsePastRoutesReturn {
  routes: FirestoreRouteDocument[];
  loading: boolean;
  error: string | null;
  deletingRouteId: string | null;
  loadRoutes: () => Promise<void>;
  handleDeleteRoute: (routeId: string) => void;
}

/**
 * Hook for managing past routes list: fetching and deletion
 */
export function usePastRoutes(): UsePastRoutesReturn {
  const [routes, setRoutes] = useState<FirestoreRouteDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingRouteId, setDeletingRouteId] = useState<string | null>(null);

  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser) {
        setError('You must be logged in to view your routes');
        setLoading(false);
        return;
      }

      const userRoutes = await FirestoreService.getUserRoutes(currentUser.uid);
      setRoutes(userRoutes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load routes';
      setError(message);
      console.error('Error loading routes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmDeleteRoute = useCallback(async (routeId: string, route: FirestoreRouteDocument) => {
    try {
      setDeletingRouteId(routeId);

      // Delete route image from Storage
      if (route.imagePath || route.imageUrl) {
        try {
          await StorageService.deleteRouteImage(route.imagePath || route.imageUrl);
        } catch (error) {
          // Continue even if image deletion fails
          console.warn('Failed to delete route image:', error);
        }
      }

      // Delete route from Firestore
      await FirestoreService.deleteRoute(routeId);

      // Remove from local state
      setRoutes((prevRoutes) => prevRoutes.filter((r) => r.id !== routeId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete route';
      Alert.alert('Error', message);
      console.error('Error deleting route:', err);
    } finally {
      setDeletingRouteId(null);
    }
  }, []);

  const handleDeleteRoute = useCallback((routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    if (!route) return;

    Alert.alert(
      'Delete Route',
      `Are you sure you want to delete this ${route.grade.v_grade} route? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDeleteRoute(routeId, route),
        },
      ]
    );
  }, [routes, confirmDeleteRoute]);

  return {
    routes,
    loading,
    error,
    deletingRouteId,
    loadRoutes,
    handleDeleteRoute,
  };
}

