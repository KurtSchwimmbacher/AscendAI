import axios, { AxiosResponse } from 'axios';
import Constants from 'expo-constants';

// Get API URL from environment variables
const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://ascendbackend-b2f7.onrender.com';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check response interface
export interface HealthResponse {
  status: string;
  message?: string;
  timestamp?: string;
}

// Route Detection Service class
export class RouteDetectionService {
  /**
   * Check the health of the API endpoint
   * @returns Promise<HealthResponse> - Health status response
   */
  static async checkHealth(): Promise<HealthResponse> {
    try {
      console.log('RouteDetectionService: Checking API health...');
      
      const response: AxiosResponse<HealthResponse> = await apiClient.get('/health');
      
      console.log('RouteDetectionService: Health check successful:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('RouteDetectionService: Health check failed:', error);
      
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          throw new Error(`API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('Network Error: Unable to reach the API server');
        } else {
          // Something else happened
          throw new Error(`Request Error: ${error.message}`);
        }
      } else {
        // Non-axios error
        throw new Error(`Unexpected Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
}

// Export individual functions for convenience
export const { checkHealth } = RouteDetectionService;
