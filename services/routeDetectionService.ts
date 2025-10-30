import axios, { AxiosResponse } from 'axios';
import Constants from 'expo-constants';

// Get API URL from environment variables
const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://ascendbackend-b2f7.onrender.com';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
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

  /**
   * Detect route holds by colour using backend vision pipeline.
   * Sends an image and tap/threshold parameters to `/routes/detect-by-colour`.
   */
  static async detectRouteByColour(
    image:
      | Blob
      | File
      | { uri: string; name?: string; type?: string },
    params: ColourFilterRequest,
  ): Promise<RouteByColourResponse> {
    try {
      const formData = new FormData();

      // Normalize file payload for React Native / web
      const filePart: any =
        'uri' in (image as any)
          ? {
              uri: (image as any).uri,
              name: (image as any).name || 'image.jpg',
              type: (image as any).type || 'image/jpeg',
            }
          : image;

      formData.append('file', filePart as any);

      // Send scalar params via query string (FastAPI Depends() parses from query)
      const queryParams: Record<string, string | number | boolean | undefined> = {
        tap_x: params.tapX,
        tap_y: params.tapY,
        conf: params.conf,
        colour_tolerance: params.colourTolerance,
        return_annotated_image: params.returnAnnotatedImage,
      };

      const response: AxiosResponse<RouteByColourResponse> = await apiClient.post(
        '/routes/detect-by-colour',
        formData,
        {
          // Include query params; let Axios set multipart boundaries automatically
          params: queryParams,
          timeout: 180000, // 180s to allow long-running detection
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Structured logging for easier debugging
        const status = error.response?.status;
        const data = error.response?.data as any;
        const url = error.config?.baseURL
          ? `${error.config.baseURL}${error.config.url ?? ''}`
          : error.config?.url;
        // Log key diagnostics
        // eslint-disable-next-line no-console
        console.error('detectRouteByColour failed', {
          status,
          url,
          params: (error.config as any)?.params,
          responseData: data,
        });
        // Additional debug detail for validation errors and request headers
        // eslint-disable-next-line no-console
        console.error('detail', JSON.stringify((data as any)?.detail ?? data, null, 2));
        // eslint-disable-next-line no-console
        console.error('reqHeaders', (error.config as any)?.headers);

        if (error.response) {
          // Surface FastAPI validation errors when present
          const message =
            data?.detail ||
            data?.message ||
            (Array.isArray(data) && data.length > 0 ? JSON.stringify(data[0]) : undefined) ||
            'Unknown server error';
          throw new Error(`API Error ${status}: ${message}`);
        }
        if (error.request) {
          throw new Error('Network Error: No response from server');
        }
        throw new Error(`Request Error: ${error.message}`);
      }
      throw new Error(`Unexpected Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export individual functions for convenience
export const { checkHealth, detectRouteByColour } = RouteDetectionService;

// Request/Response Types
export interface ColourFilterRequest {
  tapX: number;
  tapY: number;
  conf?: number;
  colourTolerance?: number;
  returnAnnotatedImage?: boolean;
}

export interface RouteByColourResponse {
  tap_x: number;
  tap_y: number;
  selected_colour: string;
  colour_confidence: number;
  detections: any[];
  image_with_boxes?: string | null;
}
