import { useCallback, useState } from 'react';
import { saveRouteScan } from '../services/routeService';
import { SaveRouteParams } from '../types/routeData';

export interface UseSaveRouteState {
  loading: boolean;
  error: string | null;
  routeId: string | null;
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
      const routeId = await saveRouteScan(params);
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
