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

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  fullName?: string;
  dateOfBirth?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  username?: string;
  isOnboardingComplete: boolean;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

// Firestore service class for user data management
export class FirestoreService {
  private static readonly USERS_COLLECTION = 'users';
  private static readonly ROUTES_COLLECTION = 'routes';

  // Create or update user profile
  static async createOrUpdateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    try {
      if (!profile.uid) {
        throw new Error('User ID is required');
      }

      console.log('FirestoreService: Saving profile data:', profile);

      const userRef = doc(db, this.USERS_COLLECTION, profile.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Update existing user
        const updateData = {
          ...profile,
          updatedAt: serverTimestamp(),
        };
        console.log('FirestoreService: Updating user with data:', updateData);
        await updateDoc(userRef, updateData);
      } else {
        // Create new user
        const createData = {
          ...profile,
          isOnboardingComplete: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        console.log('FirestoreService: Creating user with data:', createData);
        await setDoc(userRef, createData);
      }
    } catch (error) {
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  // Get user profile
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  // Update specific user field
  static async updateUserField(uid: string, field: keyof UserProfile, value: any): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        [field]: value,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  // Complete onboarding process
  static async completeOnboarding(uid: string): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        isOnboardingComplete: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  // Check if user has completed onboarding
  static async isOnboardingComplete(uid: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(uid);
      return profile?.isOnboardingComplete || false;
    } catch (error) {
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

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
   * Delete user profile from Firestore
   * @param userId - User ID
   * @returns Promise resolving when deletion is complete
   */
  static async deleteUserProfile(userId: string): Promise<void> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await deleteDoc(userRef);
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

  // Handle Firestore errors
  private static handleFirestoreError(error: FirestoreError): Error {
    let message = 'A database error occurred';
    
    switch (error.code) {
      case 'permission-denied':
        message = 'Permission denied. Please check your authentication.';
        break;
      case 'not-found':
        message = 'User profile not found.';
        break;
      case 'already-exists':
        message = 'User profile already exists.';
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
      case 'unavailable':
        message = 'Network error. Please check your connection.';
        break;
      default:
        message = error.message || 'A database error occurred';
    }
    
    return new Error(message);
  }
}

// Export individual functions for convenience
export const {
  createOrUpdateUserProfile,
  getUserProfile,
  updateUserField,
  completeOnboarding,
  isOnboardingComplete,
  saveRoute,
  getRoute,
  getUserRoutes,
} = FirestoreService;

// Export types
export type { FirestoreRouteDocument } from '../types/routeData';
