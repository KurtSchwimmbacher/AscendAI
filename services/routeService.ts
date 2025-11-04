import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  FirestoreError,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { FirestoreRouteDocument } from '../types/routeData';

/**
 * Service for managing route data in Firestore
 * Follows Single Responsibility Principle - only handles route operations
 */
export class RouteService {
  private static readonly ROUTES_COLLECTION = 'routes';

  /**
   * Save a route scan to Firestore
   * @param routeData - Complete route data including image URL and grade
   * @returns Promise resolving to the document ID
   */
  static async saveRoute(routeData: Omit<FirestoreRouteDocument, 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!routeData.userId) {
        throw new Error('User ID is required');
      }

      if (!routeData.imageUrl) {
        throw new Error('Image URL is required');
      }

      // Create a new document with auto-generated ID
      const routesRef = collection(db, this.ROUTES_COLLECTION);
      const routeDocRef = doc(routesRef);

      const documentData: FirestoreRouteDocument = {
        ...routeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(routeDocRef, documentData);

      return routeDocRef.id;
    } catch (error) {
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Get a route by document ID
   * @param routeId - Document ID of the route
   * @returns Promise resolving to route document or null
   */
  static async getRoute(routeId: string): Promise<FirestoreRouteDocument | null> {
    try {
      const routeRef = doc(db, this.ROUTES_COLLECTION, routeId);
      const routeDoc = await getDoc(routeRef);

      if (routeDoc.exists()) {
        return routeDoc.data() as FirestoreRouteDocument;
      }
      return null;
    } catch (error) {
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Update a route document
   * @param routeId - Document ID of the route to update
   * @param updates - Partial route data to update
   * @returns Promise resolving when update is complete
   */
  static async updateRoute(
    routeId: string,
    updates: Partial<Omit<FirestoreRouteDocument, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'imageUrl' | 'imagePath' | 'timestamp' | 'grade' | 'detection'>>,
  ): Promise<void> {
    try {
      if (!routeId) {
        throw new Error('Route ID is required');
      }

      const routeRef = doc(db, this.ROUTES_COLLECTION, routeId);
      await updateDoc(routeRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Delete a single route by document ID
   * @param routeId - Document ID of the route to delete
   * @returns Promise resolving when deletion is complete
   */
  static async deleteRoute(routeId: string): Promise<void> {
    try {
      if (!routeId) {
        throw new Error('Route ID is required');
      }

      const routeRef = doc(db, this.ROUTES_COLLECTION, routeId);
      await deleteDoc(routeRef);
    } catch (error) {
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Delete all routes for a user from Firestore
   * @param userId - User ID
   * @returns Promise resolving when deletion is complete
   */
  static async deleteUserRoutes(userId: string): Promise<void> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const routesRef = collection(db, this.ROUTES_COLLECTION);
      const q = query(routesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map((docSnapshot) =>
        deleteDoc(docSnapshot.ref)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Get all routes for a user
   * @param userId - User ID
   * @returns Promise resolving to array of route documents sorted by createdAt (newest first)
   */
  static async getUserRoutes(userId: string): Promise<FirestoreRouteDocument[]> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const routesRef = collection(db, this.ROUTES_COLLECTION);
      // Query without orderBy to avoid requiring a composite index
      // We'll sort client-side instead
      const q = query(routesRef, where('userId', '==', userId));

      const querySnapshot = await getDocs(q);
      const routes: FirestoreRouteDocument[] = [];

      querySnapshot.forEach((doc) => {
        routes.push({
          id: doc.id,
          ...doc.data(),
        } as FirestoreRouteDocument);
      });

      // Sort client-side by timestamp (newest first)
      // Handle both Firestore Timestamp and number timestamps
      routes.sort((a, b) => {
        const getTimestamp = (route: FirestoreRouteDocument): number => {
          // If createdAt is a Firestore Timestamp, convert to number
          if (route.createdAt && typeof route.createdAt === 'object' && 'toMillis' in route.createdAt) {
            return (route.createdAt as any).toMillis();
          }
          // If createdAt is a number (seconds), convert to milliseconds
          if (typeof route.createdAt === 'number') {
            return route.createdAt * 1000;
          }
          // Fall back to route.timestamp if available
          return route.timestamp || 0;
        };

        return getTimestamp(b) - getTimestamp(a); // Descending order (newest first)
      });

      return routes;
    } catch (error) {
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Handle Firestore errors with user-friendly messages
   */
  private static handleFirestoreError(error: FirestoreError): Error {
    let message = 'A database error occurred';
    
    switch (error.code) {
      case 'permission-denied':
        message = 'Permission denied. Please check your authentication.';
        break;
      case 'not-found':
        message = 'Route not found.';
        break;
      case 'already-exists':
        message = 'Route already exists.';
        break;
      case 'failed-precondition':
        message = 'Operation failed due to a precondition.';
        break;
      case 'aborted':
        message = 'Operation was aborted. Please try again.';
        break;
      case 'unavailable':
        message = 'Service is currently unavailable. Please try again later.';
        break;
      case 'deadline-exceeded':
        message = 'Request timed out. Please try again.';
        break;
      case 'resource-exhausted':
        message = 'Too many requests. Please try again later.';
        break;
      case 'unauthenticated':
        message = 'You must be logged in to perform this action.';
        break;
      default:
        message = error.message || 'A database error occurred';
    }
    
    return new Error(message);
  }
}
