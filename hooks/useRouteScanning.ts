import { useState, useEffect, useCallback } from 'react';
import { useDetectRouteByColour, type ColourFilterRequest } from './detectRouteHook';
import { useReadRouteGrade } from './readHook';
import { useSaveRoute } from './useSaveRoute';
import { AuthService } from '../services/authService';
import Constants from 'expo-constants';
import { formatErrorMessage } from '../utils/errorMessages';

interface RouteScanningState {
  displayedImageUri: string | null;
  isAnnotatedImage: boolean;
  detectionResult: any | null;
  holdPointPx: { x: number; y: number } | null;
  holdPointScreen: { x: number; y: number } | null;
  isHolding: boolean;
}

interface ScreenPoint {
  sx: number;
  sy: number;
}

interface UseRouteScanningProps {
  capturedImage: string | null;
  onImageSizeLoaded?: () => void;
  mapImagePixelsToScreen: (px: number, py: number) => ScreenPoint | null;
}

/**
 * Hook for managing the route scanning flow:
 * - Detection
 * - Grade reading
 * - Auto-saving routes
 */
export function useRouteScanning({ 
  capturedImage, 
  onImageSizeLoaded,
  mapImagePixelsToScreen 
}: UseRouteScanningProps) {
  const { loading: detecting, error: detectError, data: detectData, runDetection, reset: resetDetection } = useDetectRouteByColour();
  const { loading: reading, error: readError, data: gradeData, readGrade, reset: resetRead } = useReadRouteGrade();
  const { loading: saving, error: saveError, routeId, saveRoute, reset: resetSaveRoute } = useSaveRoute();

  const [state, setState] = useState<RouteScanningState>({
    displayedImageUri: null,
    isAnnotatedImage: false,
    detectionResult: null,
    holdPointPx: null,
    holdPointScreen: null,
    isHolding: false,
  });

  // Reset state when new image is captured or cleared
  useEffect(() => {
    if (!capturedImage) {
      // Reset state when image is cleared (retake)
      // This ensures clean state for the next scan
      setState({
        displayedImageUri: null,
        isAnnotatedImage: false,
        detectionResult: null,
        holdPointPx: null,
        holdPointScreen: null,
        isHolding: false,
      });
      resetDetection();
      resetRead();
      resetSaveRoute();
      return;
    }
    
    // Reset state when new image is captured
    // This happens immediately when a new picture is taken
    console.log('useRouteScanning: New image captured, resetting state', { capturedImage });
    setState({
      displayedImageUri: capturedImage,
      isAnnotatedImage: false,
      detectionResult: null,
      holdPointPx: null,
      holdPointScreen: null,
      isHolding: false,
    });
    resetDetection();
    resetRead();
    resetSaveRoute();
    onImageSizeLoaded?.();
  }, [capturedImage, resetDetection, resetRead, resetSaveRoute, onImageSizeLoaded]);

  const handlePressIn = useCallback((tapX: number, tapY: number, mappedPx: { x: number; y: number } | null) => {
    if (!mappedPx) {
      console.log('handlePressIn: No mappedPx provided');
      return;
    }
    
    const screen = mapImagePixelsToScreen(mappedPx.x, mappedPx.y);
    console.log('handlePressIn: Setting hold point', { mappedPx, screen });
    setState(prev => {
      const newState = {
        ...prev,
        isHolding: true,
        holdPointPx: mappedPx,
        holdPointScreen: screen ? { x: screen.sx, y: screen.sy } : prev.holdPointScreen,
      };
      console.log('handlePressIn: State updated', { holdPointScreen: newState.holdPointScreen });
      return newState;
    });
  }, [mapImagePixelsToScreen]);

  const handlePressOut = useCallback(() => {
    setState(prev => ({ ...prev, isHolding: false }));
  }, []);

  const scanRoute = useCallback(async () => {
    if (!capturedImage || !state.holdPointPx) {
      console.log('Early return - missing:', { capturedImage: !!capturedImage, holdPointPx: !!state.holdPointPx });
      return;
    }

    console.log('Processing scan with tap:', { tapX: state.holdPointPx.x, tapY: state.holdPointPx.y });
    const params: ColourFilterRequest = {
      tapX: state.holdPointPx.x,
      tapY: state.holdPointPx.y,
      conf: 0.25,
      colourTolerance: 10,
      returnAnnotatedImage: true,
    };

    try {
      const result = await runDetection({ uri: capturedImage, name: 'photo.jpg', type: 'image/jpeg' }, params);
      console.log('API response:', {
        requestedTap: { x: params.tapX, y: params.tapY },
        selected_colour: result?.selected_colour,
        colour_confidence: result?.colour_confidence,
        detectionsCount: Array.isArray(result?.detections) ? result.detections.length : 0,
        image_with_boxes: result?.image_with_boxes,
      });

      if (result?.image_with_boxes) {
        const baseUrl = Constants.expoConfig?.extra?.API_URL || 'https://ascendbackend-b2f7.onrender.com';
        const absolute = result.image_with_boxes.startsWith('http')
          ? result.image_with_boxes
          : `${baseUrl}${result.image_with_boxes}`;
        
        const screen = mapImagePixelsToScreen(state.holdPointPx.x, state.holdPointPx.y);
        
        setState(prev => ({
          ...prev,
          displayedImageUri: absolute,
          isAnnotatedImage: true,
          holdPointScreen: screen ? { x: screen.sx, y: screen.sy } : prev.holdPointScreen,
          detectionResult: result,
        }));

        // Kick off grade reading after annotated image is set
             try {
                 await readGrade({ uri: absolute, name: 'annotated.jpg', type: 'image/jpeg' });
             } catch (e) {
                 // Convert to friendly error for any consumer displaying readError
                 console.warn(formatErrorMessage(e, 'Reading route grade'));
             }
      }
        } catch (e) {
            console.warn(formatErrorMessage(e, 'Detecting route'));
        }
  }, [capturedImage, state.holdPointPx, runDetection, readGrade, mapImagePixelsToScreen]);

  // Auto-save route when grade reading completes
  useEffect(() => {
    if (gradeData && state.detectionResult && state.displayedImageUri && !saving && !routeId) {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        console.warn('Cannot save route: User not authenticated');
        return;
      }

      // Save route asynchronously (don't await - let it run in background)
      saveRoute({
        userId: currentUser.uid,
        annotatedImageUrl: state.displayedImageUri,
        gradeData: gradeData,
        detectionData: state.detectionResult,
      }).catch((error) => {
        console.error('Failed to save route:', error);
        // Error is handled by hook state
      });
    }
  }, [gradeData, state.detectionResult, state.displayedImageUri, saving, routeId, saveRoute]);

  return {
    // State
    displayedImageUri: state.displayedImageUri,
    isAnnotatedImage: state.isAnnotatedImage,
    holdPointScreen: state.holdPointScreen,
    isHolding: state.isHolding,
    holdPointPx: state.holdPointPx,
    
    // Detection
    detecting,
    detectError,
    
    // Grade reading
    reading,
    readError,
    gradeData,
    
    // Saving
    saving,
    saveError,
    
    // Actions
    scanRoute,
    handlePressIn,
    handlePressOut,
  };
}

