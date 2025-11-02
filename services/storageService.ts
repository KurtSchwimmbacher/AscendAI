import {
  ref,
  uploadBytes,
  getDownloadURL,
  StorageError,
  UploadResult,
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Storage Service - Handles all Firebase Storage operations
 * Single Responsibility: File upload/download operations
 */
export class StorageService {
  private static readonly ROUTES_PATH = 'routes';

  /**
   * Uploads a route image to Firebase Storage
   * @param imageUri - URI of the image (local file or remote URL)
   * @param userId - User ID for organizing files
   * @param filename - Optional custom filename, otherwise auto-generated
   * @returns Promise resolving to the download URL
   */
  static async uploadRouteImage(
    imageUri: string,
    userId: string,
    filename?: string,
  ): Promise<string> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!imageUri) {
        throw new Error('Image URI is required');
      }

      // Generate filename if not provided
      const finalFilename =
        filename ||
        `route_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;

      // Create storage reference
      const storageRef = ref(
        storage,
        `${this.ROUTES_PATH}/${userId}/${finalFilename}`,
      );

      // Fetch image from URI (works for both local and remote)
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`,
        );
      }

      // Convert to blob
      const blob = await response.blob();

      // Upload to Firebase Storage
      const uploadResult: UploadResult = await uploadBytes(
        storageRef,
        blob,
        {
          contentType: 'image/jpeg',
        },
      );

      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);

      return downloadURL;
    } catch (error) {
      throw this.handleStorageError(error as StorageError | Error);
    }
  }

  /**
   * Handles Storage errors with user-friendly messages
   */
  private static handleStorageError(error: StorageError | Error): Error {
    if (error instanceof Error && !('code' in error)) {
      // Regular JavaScript error
      return error;
    }

    const storageError = error as StorageError;
    let message = 'Failed to upload image';

    switch (storageError.code) {
      case 'storage/unauthorized':
        message = 'Permission denied. Please check your authentication.';
        break;
      case 'storage/canceled':
        message = 'Upload was canceled.';
        break;
      case 'storage/unknown':
        message = 'An unknown error occurred during upload.';
        break;
      case 'storage/invalid-format':
        message = 'Invalid file format. Please use an image file.';
        break;
      case 'storage/invalid-checksum':
        message = 'File corruption detected. Please try again.';
        break;
      case 'storage/cannot-slice-blob':
        message = 'File is too large or corrupted.';
        break;
      case 'storage/server-file-wrong-size':
        message = 'File size mismatch. Please try again.';
        break;
      case 'storage/quota-exceeded':
        message = 'Storage quota exceeded. Please contact support.';
        break;
      case 'storage/unauthenticated':
        message = 'You must be logged in to upload images.';
        break;
      default:
        message = storageError.message || 'Failed to upload image';
    }

    return new Error(message);
  }
}
