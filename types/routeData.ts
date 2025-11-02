/**
 * Type definitions for route scanning and storage
 */

import { RouteGradeResponse } from '../services/gradeService';
import { RouteByColourResponse } from '../services/routeDetectionService';

/**
 * Detection metadata from route detection
 */
export interface RouteDetectionMetadata {
  tap_x: number;
  tap_y: number;
  selected_colour: string;
  colour_confidence: number;
  detections_count: number;
}

/**
 * Complete route scan data to be saved
 */
export interface RouteScanData {
  userId: string;
  imageUrl: string; // Firebase Storage URL
  imagePath: string; // Storage path for reference
  grade: RouteGradeResponse;
  detection: RouteDetectionMetadata;
  timestamp: number;
  createdAt?: any; // Firestore timestamp
}

/**
 * Route document as stored in Firestore
 */
export interface FirestoreRouteDocument extends Omit<RouteScanData, 'createdAt'> {
  id?: string; // Document ID
  createdAt: any; // Firestore timestamp
  updatedAt?: any; // Firestore timestamp
}

/**
 * Parameters for saving a route
 */
export interface SaveRouteParams {
  userId: string;
  annotatedImageUrl: string; // URL from backend (Render)
  gradeData: RouteGradeResponse;
  detectionData: RouteByColourResponse;
}
