import React from 'react';
import { CameraView } from 'expo-camera';
import { RouteDetectionService } from './routeDetectionService';
import * as ImageManipulator from 'expo-image-manipulator';

export interface CameraState {
  capturedImage: string | null;
  imageModalVisible: boolean;
  cameraSheetVisible: boolean;
}

export interface CameraActions {
  takePicture: (cameraRef: React.RefObject<CameraView>) => Promise<void>;
  retakePicture: () => void;
  useImage: () => void;
  setImageModalVisible: (visible: boolean) => void;
  setCameraSheetVisible: (visible: boolean) => void;
}

export class CameraService {
  private state: CameraState;
  private setState: React.Dispatch<React.SetStateAction<CameraState>>;
  private onImageUsed?: (imageUri: string) => void;

  constructor(
    state: CameraState,
    setState: React.Dispatch<React.SetStateAction<CameraState>>,
    onImageUsed?: (imageUri: string) => void
  ) {
    this.state = state;
    this.setState = setState;
    this.onImageUsed = onImageUsed;
  }

  async takePicture(cameraRef: React.RefObject<CameraView>): Promise<void> {
    if (cameraRef.current) {
      try {
        // Test health point of API 
        // -> this should give the API some time to start up so when the user scans a route the wait time is minimal
        console.log("Health check of API: " + RouteDetectionService.checkHealth());
        
      const photo = await cameraRef.current.takePictureAsync({ exif: true });
        console.log('Photo taken:', photo);
      
      // Normalize orientation by saving pixels as currently rendered (no-op rotate)
      let normalizedUri = photo.uri;
      try {
        const manipulated = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ rotate: 0 }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        normalizedUri = manipulated.uri;
      } catch (manipError) {
        console.warn('Orientation normalization failed, using original photo uri:', manipError);
      }
        
        this.setState(prevState => ({
          ...prevState,
        capturedImage: normalizedUri,
          imageModalVisible: true,
          cameraSheetVisible: false,
        }));
      } catch (error) {
        console.error('Error taking picture:', error);
        throw error;
      }
    }
  }

  retakePicture(): void {
    this.setState(prevState => ({
      ...prevState,
      capturedImage: null,
      imageModalVisible: false,
      cameraSheetVisible: true,
    }));
  }

  useImage(): void {
    if (this.state.capturedImage) {
      console.log('Using image:', this.state.capturedImage);
      
      // Call the callback if provided
      if (this.onImageUsed) {
        this.onImageUsed(this.state.capturedImage);
      }
      
      this.setState(prevState => ({
        ...prevState,
        imageModalVisible: false,
      }));
    }
  }

  setImageModalVisible(visible: boolean): void {
    this.setState(prevState => ({
      ...prevState,
      imageModalVisible: visible,
    }));
  }

  setCameraSheetVisible(visible: boolean): void {
    this.setState(prevState => ({
      ...prevState,
      cameraSheetVisible: visible,
    }));
  }
}

// Custom hook for camera functionality
export const useCamera = (onImageUsed?: (imageUri: string) => void) => {
  const [cameraState, setCameraState] = React.useState<CameraState>({
    capturedImage: null,
    imageModalVisible: false,
    cameraSheetVisible: true,
  });

  const cameraService = React.useMemo(
    () => new CameraService(cameraState, setCameraState, onImageUsed),
    [cameraState, onImageUsed]
  );

  return {
    // State
    capturedImage: cameraState.capturedImage,
    imageModalVisible: cameraState.imageModalVisible,
    cameraSheetVisible: cameraState.cameraSheetVisible,
    
    // Actions
    takePicture: cameraService.takePicture.bind(cameraService),
    retakePicture: cameraService.retakePicture.bind(cameraService),
    useImage: cameraService.useImage.bind(cameraService),
    setImageModalVisible: cameraService.setImageModalVisible.bind(cameraService),
    setCameraSheetVisible: cameraService.setCameraSheetVisible.bind(cameraService),
  };
};
