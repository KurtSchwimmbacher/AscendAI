import { useCallback, useState } from 'react';
import { RouteService } from '../services/routeService';
import { SaveRouteParams } from '../types/routeData';
import { FirestoreRouteDocument } from '../types/routeData';

export interface UseSaveRouteState {
  loading: boolean;
  error: string | null;
  routeId: string | null;
}

/**
 * Transform SaveRouteParams to FirestoreRouteDocument format
 */
function transformSaveParams(params: SaveRouteParams): Omit<FirestoreRouteDocument, 'createdAt' | 'updatedAt'> {
  return {
    userId: params.userId,
    imageUrl: params.annotatedImageUrl,
    imagePath: params.annotatedImageUrl, // Use URL as path for now
    grade: params.gradeData,
    detection: {
      tap_x: params.detectionData.tap_x || 0,
      tap_y: params.detectionData.tap_y || 0,
      selected_colour: params.detectionData.selected_colour || '',
      colour_confidence: params.detectionData.colour_confidence || 0,
      detections_count: Array.isArray(params.detectionData.detections) 
        ? params.detectionData.detections.length 
        : 0,
    },
    timestamp: Date.now(),
  };
}

/**
 * Hook for saving route scans to Firebase
 * Returns state and a function to save a route
 */
export function useSaveRoute() {
  const [state, setState] = useState<UseSaveRouteState>({
    loading: false,
    error: null,
    routeId: null,
  });

  const saveRoute = useCallback(async (params: SaveRouteParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const routeData = transformSaveParams(params);
      const routeId = await RouteService.saveRoute(routeData);
      setState({ loading: false, error: null, routeId });
      return routeId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setState({ loading: false, error: message, routeId: null });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, routeId: null });
  }, []);

  return {
    ...state,
    saveRoute,
    reset,
  };
}
