import { StorageService } from './storageService';
import { FirestoreService } from './firestoreService';
import {
  SaveRouteParams,
  RouteScanData,
  RouteDetectionMetadata,
} from '../types/routeData';
import { RouteByColourResponse } from './routeDetectionService';

/**
 * Route Service - Orchestrates the complete route saving workflow
 * Single Responsibility: Coordinate route saving process (download, upload, save)
 */
export class RouteService {
  /**
   * Saves a route scan by:
   * 1. Downloading the annotated image from Render
   * 2. Uploading it to Firebase Storage
   * 3. Saving route metadata to Firestore
   *
   * @param params - Route data including image URL, grade, and detection data
   * @returns Promise resolving to the Firestore document ID
   */
  static async saveRouteScan(params: SaveRouteParams): Promise<string> {
    try {
      // Validate input
      if (!params.userId) {
        throw new Error('User ID is required');
      }

      if (!params.annotatedImageUrl) {
        throw new Error('Annotated image URL is required');
      }

      if (!params.gradeData) {
        throw new Error('Grade data is required');
      }

      if (!params.detectionData) {
        throw new Error('Detection data is required');
      }

      // Step 1: Upload image to Firebase Storage
      const firebaseImageUrl = await StorageService.uploadRouteImage(
        params.annotatedImageUrl,
        params.userId,
      );

      // Extract storage path from URL (e.g., routes/userId/filename.jpg)
      const urlParts = firebaseImageUrl.split('/');
      const pathIndex = urlParts.findIndex((part) => part === 'routes');
      const imagePath =
        pathIndex !== -1
          ? urlParts.slice(pathIndex).join('/').split('?')[0]
          : `routes/${params.userId}/${Date.now()}.jpg`;

      // Step 2: Transform detection data to metadata format
      const detectionMetadata: RouteDetectionMetadata = {
        tap_x: params.detectionData.tap_x,
        tap_y: params.detectionData.tap_y,
        selected_colour: params.detectionData.selected_colour,
        colour_confidence: params.detectionData.colour_confidence,
        detections_count: Array.isArray(params.detectionData.detections)
          ? params.detectionData.detections.length
          : 0,
      };

      // Step 3: Prepare route data
      const routeData: Omit<RouteScanData, 'createdAt'> = {
        userId: params.userId,
        imageUrl: firebaseImageUrl,
        imagePath: imagePath,
        grade: params.gradeData,
        detection: detectionMetadata,
        timestamp: Date.now(),
      };

      // Step 4: Save to Firestore
      const documentId = await FirestoreService.saveRoute(routeData);

      return documentId;
    } catch (error) {
      // Re-throw with context
      if (error instanceof Error) {
        throw new Error(`Failed to save route: ${error.message}`);
      }
      throw new Error('Failed to save route: Unknown error');
    }
  }
}

export const { saveRouteScan } = RouteService;
