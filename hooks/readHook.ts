import { useCallback, useState } from 'react';
import { analyzeRouteGrade, type RouteGradeResponse } from '../services/gradeService';

export interface UseReadGradeState {
  loading: boolean;
  error: string | null;
  data: RouteGradeResponse | null;
}

export type GradeImageType =
  | Blob
  | File
  | { uri: string; name?: string; type?: string };

export function useReadRouteGrade() {
  const [state, setState] = useState<UseReadGradeState>({ loading: false, error: null, data: null });

  const readGrade = useCallback(async (image: GradeImageType, routeName?: string | null) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await analyzeRouteGrade(image, routeName ?? undefined);
      setState({ loading: false, error: null, data: result });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setState({ loading: false, error: message, data: null });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return { ...state, readGrade, reset };
}

export type { RouteGradeResponse };


