/**
 * 共通のAPI設定とユーティリティ
 */
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API設定
const API_CONFIG = {
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, ''), // 末尾のスラッシュを削除
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// レスポンスキャッシュ（シンプルなインメモリキャッシュ）
interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

const responseCache = new Map<string, CacheEntry>();

// キャッシュキーの生成
const getCacheKey = (method: string, url: string, params?: unknown): string => {
  const paramsStr = params ? JSON.stringify(params) : '';
  return `${method}:${url}:${paramsStr}`;
};

// キャッシュのクリア（TTL超過時）
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > value.ttl) {
      responseCache.delete(key);
    }
  }
};

// キャッシュの取得
const getCachedResponse = (key: string): unknown | null => {
  clearExpiredCache();
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  return null;
};

// キャッシュの保存
const setCachedResponse = (key: string, data: unknown, ttl: number = 60000) => {
  responseCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

// カスタムエラークラス
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Axiosインスタンスの作成
export const createApiInstance = (): AxiosInstance => {
  const instance = axios.create(API_CONFIG);

  // リクエストインターセプター
  instance.interceptors.request.use(
    (config) => {
      // トークンの自動追加（管理者API優先）
      let token = null;
      
      // 管理者APIの場合は admin_access_token を使用
      if (config.url?.includes('/admin/')) {
        token = localStorage.getItem('admin_access_token');
      } else {
        // 一般APIの場合は access_token を使用
        token = localStorage.getItem('access_token');
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // GETリクエストのキャッシュチェック
      if (config.method === 'get' && !config.headers['X-No-Cache']) {
        const cacheKey = getCacheKey(config.method || 'get', config.url || '', config.params);
        const cached = getCachedResponse(cacheKey);
        if (cached) {
          // キャッシュされたデータを返すためのカスタムプロパティ
          (config as { __cached?: unknown }).__cached = cached;
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // レスポンスインターセプター
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // GETリクエストのキャッシュ保存（成功時のみ）
      const config = response.config;
      if (config.method === 'get' && !config.headers['X-No-Cache']) {
        const cacheKey = getCacheKey(config.method || 'get', config.url || '', config.params);
        // キャッシュTTLを設定（デフォルト60秒、環境変数で変更可能）
        const cacheTTL = parseInt(process.env.NEXT_PUBLIC_API_CACHE_TTL || '60000', 10);
        setCachedResponse(cacheKey, response.data, cacheTTL);
      }
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        const { status, data } = error.response;
        const errorMessage = (data as { detail?: string })?.detail || 'APIエラーが発生しました';
        throw new ApiError(status, errorMessage, data);
      }
      throw new ApiError(0, 'ネットワークエラーが発生しました');
    }
  );

  return instance;
};

// キャッシュクリア関数（外部から呼び出し可能）
export const clearApiCache = (pattern?: string) => {
  if (pattern) {
    // パターンに一致するキャッシュのみ削除
    for (const [key] of responseCache.entries()) {
      if (key.includes(pattern)) {
        responseCache.delete(key);
      }
    }
  } else {
    // すべてのキャッシュをクリア
    responseCache.clear();
  }
};

// 共通のAPIレスポンス型
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

