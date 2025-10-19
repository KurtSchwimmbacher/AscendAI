import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  FirestoreError,
} from 'firebase/firestore';
import { db } from './firebase';

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  fullName?: string;
  dateOfBirth?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  isOnboardingComplete: boolean;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

// Firestore service class for user data management
export class FirestoreService {
  private static readonly USERS_COLLECTION = 'users';

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
} = FirestoreService;
