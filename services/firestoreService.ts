/**
 * Legacy FirestoreService - maintained for backward compatibility
 * 
 * This file provides a unified FirestoreService class that delegates
 * to UserService and RouteService. New code should import directly
 * from userService.ts and routeService.ts
 */

import { UserService, UserProfile } from './userService';
import { RouteService } from './routeService';
import type { FirestoreRouteDocument } from '../types/routeData';

// Export types
export type { UserProfile } from './userService';
export type { FirestoreRouteDocument } from '../types/routeData';
export { RouteService } from './routeService';

/**
 * Unified FirestoreService class for backward compatibility
 * Delegates to UserService and RouteService
 */
export class FirestoreService {
  // User profile methods
  static async createOrUpdateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    return UserService.createOrUpdateUserProfile(profile);
  }

  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    return UserService.getUserProfile(uid);
  }

  static async updateUserField(uid: string, field: keyof UserProfile, value: any): Promise<void> {
    return UserService.updateUserField(uid, field, value);
  }

  static async completeOnboarding(uid: string): Promise<void> {
    return UserService.completeOnboarding(uid);
  }

  static async isOnboardingComplete(uid: string): Promise<boolean> {
    return UserService.isOnboardingComplete(uid);
  }

  static async deleteUserProfile(userId: string): Promise<void> {
    return UserService.deleteUserProfile(userId);
  }

  // Route methods
  static async saveRoute(routeData: Omit<FirestoreRouteDocument, 'createdAt' | 'updatedAt'>): Promise<string> {
    return RouteService.saveRoute(routeData);
  }

  static async getRoute(routeId: string): Promise<FirestoreRouteDocument | null> {
    return RouteService.getRoute(routeId);
  }

  static async updateRoute(
    routeId: string,
    updates: Partial<Omit<FirestoreRouteDocument, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'imageUrl' | 'imagePath' | 'timestamp' | 'grade' | 'detection'>>,
  ): Promise<void> {
    return RouteService.updateRoute(routeId, updates);
  }

  static async deleteRoute(routeId: string): Promise<void> {
    return RouteService.deleteRoute(routeId);
  }

  static async deleteUserRoutes(userId: string): Promise<void> {
    return RouteService.deleteUserRoutes(userId);
  }

  static async getUserRoutes(userId: string): Promise<FirestoreRouteDocument[]> {
    return RouteService.getUserRoutes(userId);
  }
}

// Export convenience functions for backward compatibility
export const createOrUpdateUserProfile = FirestoreService.createOrUpdateUserProfile;
export const getUserProfile = FirestoreService.getUserProfile;
export const updateUserField = FirestoreService.updateUserField;
export const completeOnboarding = FirestoreService.completeOnboarding;
export const isOnboardingComplete = FirestoreService.isOnboardingComplete;
export const saveRoute = FirestoreService.saveRoute;
export const getRoute = FirestoreService.getRoute;
export const getUserRoutes = FirestoreService.getUserRoutes;
