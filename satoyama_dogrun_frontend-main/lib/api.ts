import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { DogProfile, Event, Post, Notice, Tag, OwnerProfile, Comment } from './types';

// API設定
const API_CONFIG = {
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, ''), // 末尾のスラッシュを削除
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// カスタムエラークラス
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Axiosインスタンスの作成
const createApiInstance = (): AxiosInstance => {
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
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // レスポンスインターセプター
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        const { status, data } = error.response;
        const errorMessage = (data as any)?.detail || 'APIエラーが発生しました';
        throw new ApiError(status, errorMessage, data);
      }
      throw new ApiError(0, 'ネットワークエラーが発生しました');
    }
  );

  return instance;
};

const api = createApiInstance();

// 型定義
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  address: string;
  phoneNumber: string;
  imabariResidency: string;
  vaccinationCertificate: File;
  dogName: string;
  dogBreed: string;
  dogWeight: number;
  dogPersonality: string[];
  dogLastVaccinationDate: string;
}

// 新規申請用インターフェース
export interface ApplicationRequest {
  email: string;
  password: string;
  last_name: string;
  first_name: string;
  phone_number: string;
  address: string;
  prefecture: string;
  city: string;
  postal_code?: string;
  dog_name: string;
  dog_breed?: string;
  dog_weight?: string;
  dog_age?: number;
  dog_gender?: string;
  vaccine_certificate?: string;
  request_date?: string;
  request_time?: string;
  notes?: string;
}

export interface ApplicationStatusResponse {
  application_id: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_at?: string;
  created_at: string;
}

export interface CreatePostRequest {
  content: string;
  category: string;
  hashtags?: string;
  image?: File;
}

export interface AddCommentRequest {
  postId: number;
  text: string;
}

export interface AddDogRequest {
  name: string;
  breed: string;
  weight: string;
  personality: string[];
  lastVaccinationDate: string;
  vaccinationCertificate: File;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// API関数
export const apiClient = {
  // 認証関連（一般ユーザー用）
  login: async (data: LoginRequest): Promise<ApiResponse<{ access_token: string; token_type: string }>> => {
    try {
      const response = await api.post('/auth/login', data);
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 管理者認証
  adminLogin: async (data: LoginRequest): Promise<ApiResponse<{ access_token: string; token_type: string }>> => {
    try {
      const response = await api.post('/admin/auth/login', data);
      const { access_token } = response.data;
      localStorage.setItem('admin_access_token', access_token);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 新規利用申請
  submitApplication: async (data: any): Promise<ApplicationStatusResponse> => {
    try {
      const formData = new FormData();
      
      // 基本情報（バックエンドスキーマに合わせて修正）
      const nameParts = data.full_name ? data.full_name.split(' ') : ['', ''];
      formData.append('first_name', nameParts[0] || '');
      formData.append('last_name', nameParts[1] || '');
      formData.append('email', data.email);
      formData.append('phone_number', data.phone_number);
      formData.append('postal_code', data.postal_code || '');
      formData.append('prefecture', data.prefecture);
      formData.append('city', data.city);
      
      // 住所を統合（address フィールド）
      const address = [data.street, data.building].filter(Boolean).join(' ');
      formData.append('address', address);
      formData.append('password', data.password);
      
      // 犬情報（必須フィールドを追加）
      formData.append('dog_name', data.dog_name);
      formData.append('dog_breed', data.dog_breed || '');
      formData.append('dog_weight', data.dog_weight ? data.dog_weight.toString() : '');
      formData.append('dog_age', data.dog_age ? data.dog_age.toString() : '1');
      formData.append('dog_gender', data.dog_gender || 'オス');
      
      // ファイル（ワクチン証明書）
      if (data.vaccination_certificate) {
        formData.append('vaccine_certificate', data.vaccination_certificate);
      }
      
      const response = await api.post('/auth/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 既存の関数もそのまま残す（互換性のため）
  applyRegistration: async (data: FormData): Promise<ApplicationStatusResponse> => {
    try {
      const response = await api.post('/auth/apply', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 申請状況確認
  getApplicationStatus: async (applicationId: string): Promise<ApplicationStatusResponse> => {
    try {
      const response = await api.get(`/auth/application-status/${applicationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<OwnerProfile>> => {
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('fullName', data.fullName);
      formData.append('address', data.address);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('imabariResidency', data.imabariResidency);
      formData.append('vaccinationCertificate', data.vaccinationCertificate);

      const response = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem('access_token');
  },

  // ユーザー関連
  // プロフィール詳細取得（犬情報を含む）
  getUserProfile: async (): Promise<any> => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 犬情報の取得
  getUserDogs: async (): Promise<any[]> => {
    try {
      const response = await api.get('/dogs');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 犬の追加
  addDog: async (data: any): Promise<any> => {
    try {
      const response = await api.post('/dogs', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 犬の更新
  updateDog: async (dogId: string, data: any): Promise<any> => {
    try {
      const response = await api.put(`/dogs/${dogId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 犬の削除
  deleteDog: async (dogId: string): Promise<any> => {
    try {
      const response = await api.delete(`/dogs/${dogId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ワクチン接種記録の取得
  getVaccinationRecords: async (dogId: string): Promise<any[]> => {
    try {
      const response = await api.get(`/dogs/${dogId}/vaccinations`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ワクチン接種記録の追加
  addVaccinationRecord: async (dogId: string, data: any): Promise<any> => {
    try {
      const response = await api.post(`/dogs/${dogId}/vaccinations`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<OwnerProfile>> => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUserProfile: async (data: Partial<OwnerProfile>): Promise<ApiResponse<OwnerProfile>> => {
    try {
      const response = await api.put('/users/profile', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 犬のプロフィール関連
  getUserDogs: async (): Promise<ApiResponse<DogProfile[]>> => {
    try {
      const response = await api.get('/dogs');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addDog: async (data: AddDogRequest): Promise<ApiResponse<DogProfile>> => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('breed', data.breed);
      formData.append('weight', data.weight);
      formData.append('personality', JSON.stringify(data.personality));
      formData.append('lastVaccinationDate', data.lastVaccinationDate);
      formData.append('vaccinationCertificate', data.vaccinationCertificate);

      const response = await api.post('/dogs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDog: async (dogId: number, data: Partial<DogProfile>): Promise<ApiResponse<DogProfile>> => {
    try {
      const response = await api.put(`/dogs/${dogId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteDog: async (dogId: number): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete(`/dogs/${dogId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 投稿関連
  getPosts: async (params?: { tag?: string; search?: string }): Promise<ApiResponse<Post[]>> => {
    try {
      const response = await api.get('/posts', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPost: async (data: CreatePostRequest): Promise<ApiResponse<Post>> => {
    try {
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('category', data.category);
      if (data.hashtags) formData.append('hashtags', data.hashtags);
      if (data.image) formData.append('image', data.image);

      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  likePost: async (postId: number): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addComment: async (data: AddCommentRequest): Promise<ApiResponse<Comment>> => {
    try {
      const response = await api.post(`/posts/${data.postId}/comments`, {
        text: data.text,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // イベント関連
  getEvents: async (upcomingOnly: boolean = true): Promise<any[]> => {
    try {
      const response = await api.get('/events', {
        params: { upcoming_only: upcomingOnly }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // パブリックイベント取得（認証不要）
  getPublicEvents: async (): Promise<any[]> => {
    try {
      const response = await api.get('/api/events/upcoming');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEventDetail: async (eventId: string): Promise<any> => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registerForEvent: async (eventId: string, dogIds: string[]): Promise<any> => {
    try {
      const response = await api.post(`/events/${eventId}/register`, {
        dog_ids: dogIds
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelEventRegistration: async (eventId: string): Promise<any> => {
    try {
      const response = await api.delete(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEventParticipants: async (eventId: string): Promise<any[]> => {
    try {
      const response = await api.get(`/events/${eventId}/participants`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCalendar: async (year: number, month: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/calendar/${year}/${month}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // お知らせ関連
  getNotices: async (): Promise<ApiResponse<Notice[]>> => {
    try {
      const response = await api.get('/notices');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  markNoticeAsRead: async (noticeId: number): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.put(`/notices/${noticeId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 入場関連
  generateQRCode: async (dogIds: string[]): Promise<any> => {
    try {
      const response = await api.post('/entry/qrcode', { dog_ids: dogIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  scanQRCode: async (qrData: any): Promise<any> => {
    try {
      const response = await api.post('/entry/scan', qrData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  enterDogRun: async (dogIds: string[]): Promise<any> => {
    try {
      const response = await api.post('/entry/enter', { dog_ids: dogIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  exitDogRun: async (): Promise<any> => {
    try {
      const response = await api.post('/entry/exit');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentVisitors: async (): Promise<any> => {
    try {
      const response = await api.get('/entry/current');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEntryHistory: async (limit: number = 50): Promise<any[]> => {
    try {
      const response = await api.get('/entry/history', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // タグ関連
  getTags: async (): Promise<ApiResponse<Tag[]>> => {
    try {
      const response = await api.get('/tags');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 管理者用API
  getAdminApplications: async (): Promise<any> => {
    try {
      // リクエストインターセプターが自動的にトークンを追加するため、手動設定は不要
      const response = await api.get('/admin/applications');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approveApplication: async (applicationId: string, notes?: string): Promise<any> => {
    try {
      // リクエストインターセプターが自動的にトークンを追加するため、手動設定は不要
      const response = await api.put(`/admin/applications/${applicationId}/approve`, {
        admin_notes: notes
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rejectApplication: async (applicationId: string, reason: string): Promise<any> => {
    try {
      // リクエストインターセプターが自動的にトークンを追加するため、手動設定は不要
      const response = await api.put(`/admin/applications/${applicationId}/reject`, {
        rejection_reason: reason,
        admin_notes: reason
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ユーティリティ関数
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export default apiClient; 