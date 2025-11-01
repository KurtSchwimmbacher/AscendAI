import axios, { AxiosResponse } from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://ascendbackend-b2f7.onrender.com';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export interface RouteGradeResponse {
  v_grade: string;
  confidence: number;
  reasoning: string;
  key_factors: string[];
  difficulty_notes: string;
  model_used: string;
  analysis_timestamp: number;
  error?: string | null;
}

export type AnalyzeImageType =
  | Blob
  | File
  | { uri: string; name?: string; type?: string };

export class GradeService {
  /**
   * Analyze a route image to determine grade.
   * Sends image as multipart and optional route_name as query param.
   */
  static async analyzeRouteGrade(
    image: AnalyzeImageType,
    routeName?: string | null,
  ): Promise<RouteGradeResponse> {
    try {
      const formData = new FormData();
      const filePart: any = 'uri' in (image as any)
        ? {
            uri: (image as any).uri,
            name: (image as any).name || 'route.jpg',
            type: (image as any).type || 'image/jpeg',
          }
        : image;
      formData.append('file', filePart as any);

      const params: Record<string, string | undefined> = {
        route_name: routeName ?? undefined,
      };

      const response: AxiosResponse<RouteGradeResponse> = await apiClient.post(
        '/routes/analyse-grade',
        formData,
        {
          params,
          timeout: 180000,
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const data = error.response.data as any;
          const message = data?.detail || data?.message || 'Unknown server error';
          throw new Error(`API Error ${error.response.status}: ${message}`);
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

export const { analyzeRouteGrade } = GradeService;


