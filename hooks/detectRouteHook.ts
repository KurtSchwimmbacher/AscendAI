import { useCallback, useState } from 'react';
import {
  detectRouteByColour,
  type ColourFilterRequest,
  type RouteByColourResponse,
} from '../services/routeDetectionService';

export interface UseDetectRouteState {
  loading: boolean;
  error: string | null;
  data: RouteByColourResponse | null;
}

export type DetectImageType =
  | Blob
  | File
  | {
      uri: string;
      name?: string;
      type?: string;
    };

export function useDetectRouteByColour() {
  const [state, setState] = useState<UseDetectRouteState>({
    loading: false,
    error: null,
    data: null,
  });

  const runDetection = useCallback(
    async (image: DetectImageType, params: ColourFilterRequest) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await detectRouteByColour(image, params);
        setState({ loading: false, error: null, data: result });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setState({ loading: false, error: message, data: null });
        throw err;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    runDetection,
    reset,
  };
}

export type { ColourFilterRequest, RouteByColourResponse };

