/**
 * APIエラーハンドリングユーティリティ
 */
import { ApiError } from './shared';

export interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      detail?: string;
    };
  };
}

/**
 * APIエラーを型安全に処理するヘルパー関数
 */
export function handleApiError(error: unknown): {
  message: string;
  status?: number;
  detail?: string;
} {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      detail: error.data?.detail,
    };
  }

  const apiError = error as ApiErrorResponse;
  if (apiError.response) {
    return {
      message: apiError.response.data?.detail || 'APIエラーが発生しました',
      status: apiError.response.status,
      detail: apiError.response.data?.detail,
    };
  }

  return {
    message: 'ネットワークエラーが発生しました',
  };
}

/**
 * 開発環境でのみログを出力するヘルパー関数
 */
export function devLog(...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
}

export function devError(...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args);
  }
}

