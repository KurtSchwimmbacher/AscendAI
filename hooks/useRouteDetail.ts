import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { FirestoreService, FirestoreRouteDocument } from '../services/firestoreService';
import { formatErrorMessage } from '../utils/errorMessages';

interface RouteEditData {
  routeName: string;
  manualGrade: string;
  notes: string;
}

interface UseRouteDetailProps {
  initialRoute: FirestoreRouteDocument;
}

interface UseRouteDetailReturn {
  routeData: FirestoreRouteDocument;
  isEditing: boolean;
  editData: RouteEditData;
  saving: boolean;
  displayGrade: string;
  isManualGrade: boolean;
  handleEdit: () => void;
  handleCancel: () => void;
  handleUpdateField: (field: keyof RouteEditData, value: string) => void;
  handleSave: () => Promise<void>;
  loadRoute: () => Promise<void>;
}

/**
 * Hook for managing route detail data and editing state
 */
export function useRouteDetail({ initialRoute }: UseRouteDetailProps): UseRouteDetailReturn {
  const [routeData, setRouteData] = useState<FirestoreRouteDocument>(initialRoute);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<RouteEditData>({
    routeName: initialRoute.routeName || '',
    manualGrade: initialRoute.manualGrade || '',
    notes: initialRoute.notes || '',
  });

  const displayGrade = isEditing 
    ? (editData.manualGrade || routeData.grade.v_grade)
    : (routeData.manualGrade || routeData.grade.v_grade);
  
  const isManualGrade = isEditing 
    ? !!editData.manualGrade 
    : !!routeData.manualGrade;

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setEditData({
      routeName: routeData.routeName || '',
      manualGrade: routeData.manualGrade || '',
      notes: routeData.notes || '',
    });
    setIsEditing(false);
  }, [routeData]);

  const handleUpdateField = useCallback((field: keyof RouteEditData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const loadRoute = useCallback(async () => {
    if (!routeData.id) return;

    try {
      const updatedRoute = await FirestoreService.getRoute(routeData.id);
      if (updatedRoute) {
        setRouteData(updatedRoute);
        setEditData({
          routeName: updatedRoute.routeName || '',
          manualGrade: updatedRoute.manualGrade || '',
          notes: updatedRoute.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading route:', error);
    }
  }, [routeData.id]);

  const handleSave = useCallback(async () => {
    if (!routeData.id) {
      Alert.alert('Error', 'Route ID is missing');
      return;
    }

    try {
      setSaving(true);

      // Build updates object, only including defined values
      // Firestore doesn't accept undefined, so we filter them out
      const trimmedRouteName = editData.routeName.trim();
      const trimmedManualGrade = editData.manualGrade.trim();
      const trimmedNotes = editData.notes.trim();

      const updates: any = {};
      
      // Only include fields that have values (empty strings are excluded)
      if (trimmedRouteName) {
        updates.routeName = trimmedRouteName;
      }
      if (trimmedManualGrade) {
        updates.manualGrade = trimmedManualGrade;
      }
      if (trimmedNotes) {
        updates.notes = trimmedNotes;
      }

      // Update route in Firestore (only if we have updates)
      if (Object.keys(updates).length > 0) {
        await FirestoreService.updateRoute(routeData.id, updates);
      }

      // Reload route data to show updates
      await loadRoute();
      
      setIsEditing(false);
      Alert.alert('Success', 'Route updated successfully');
    } catch (error) {
      const message = formatErrorMessage(error, 'Updating route');
      Alert.alert('Error', message);
      console.error('Error updating route:', error);
    } finally {
      setSaving(false);
    }
  }, [routeData.id, editData, loadRoute]);

  return {
    routeData,
    isEditing,
    editData,
    saving,
    displayGrade,
    isManualGrade,
    handleEdit,
    handleCancel,
    handleUpdateField,
    handleSave,
    loadRoute,
  };
}

