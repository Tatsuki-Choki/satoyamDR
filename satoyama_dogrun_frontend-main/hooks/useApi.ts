import { useState, useCallback } from 'react';
import { apiClient, ApiError } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<{ data: T }>,
  immediate = false
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const result = await apiFunction(...args);
        setState({
          data: result.data,
          loading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = error instanceof ApiError ? error.message : 'エラーが発生しました';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// 特定のAPI呼び出し用のフック
export function useLogin() {
  return useApi(apiClient.login);
}

export function useRegister() {
  return useApi(apiClient.register);
}

export function useGetCurrentUser() {
  return useApi(apiClient.getCurrentUser);
}

export function useGetUserDogs() {
  return useApi(apiClient.getUserDogs);
}

export function useGetPosts() {
  return useApi(apiClient.getPosts);
}

export function useGetEvents() {
  return useApi(apiClient.getEvents);
}

export function useGetNotices() {
  return useApi(apiClient.getNotices);
}

export function useGetTags() {
  return useApi(apiClient.getTags);
} 