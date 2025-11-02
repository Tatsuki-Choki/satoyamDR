/**
 * ユーザー側APIクライアント
 */
import { createApiInstance, ApiResponse, ApiError } from './shared';
import type { DogProfile, Post, Notice, Tag, OwnerProfile, Comment, Event } from '../types';

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
  images?: File[]; // 複数画像対応
}

export interface AddCommentRequest {
  postId: string;
  text: string;
}

export interface ApplicationFormData {
  full_name: string;
  email: string;
  password: string;
  phone_number: string;
  postal_code?: string;
  prefecture: string;
  city: string;
  street?: string;
  building?: string;
  dog_name: string;
  dog_breed?: string;
  dog_weight?: string | number;
  dog_age?: string | number;
  dog_gender?: string;
  vaccination_certificate?: File;
}

export interface AddDogRequest {
  name: string;
  breed: string;
  weight: string;
  personality: string[];
  lastVaccinationDate: string;
  vaccinationCertificate: File;
}

// ユーザー側APIクライアント
export const userApiClient = {
  // 認証関連
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

  logout: (): void => {
    localStorage.removeItem('access_token');
  },

  // 新規利用申請
  submitApplication: async (data: ApplicationFormData): Promise<ApplicationStatusResponse> => {
    try {
      const formData = new FormData();
      
      const nameParts = data.full_name ? data.full_name.split(' ') : ['', ''];
      formData.append('first_name', nameParts[0] || '');
      formData.append('last_name', nameParts[1] || '');
      formData.append('email', data.email);
      formData.append('phone_number', data.phone_number);
      formData.append('postal_code', data.postal_code || '');
      formData.append('prefecture', data.prefecture);
      formData.append('city', data.city);
      formData.append('street', data.street || '');
      formData.append('building', data.building || '');
      formData.append('password', data.password);
      formData.append('dog_name', data.dog_name);
      formData.append('dog_breed', data.dog_breed || '');
      formData.append('dog_weight', data.dog_weight ? data.dog_weight.toString() : '');
      formData.append('dog_age', data.dog_age ? data.dog_age.toString() : '1');
      formData.append('dog_gender', data.dog_gender || 'オス');
      
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

  getApplicationStatus: async (applicationId: string): Promise<ApplicationStatusResponse> => {
    try {
      const response = await api.get(`/auth/application-status/${applicationId}`);
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

  // ユーザー関連
  getCurrentUser: async (): Promise<ApiResponse<OwnerProfile>> => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserProfile: async (): Promise<ApiResponse<OwnerProfile>> => {
    try {
      const response = await api.get('/users/profile');
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

  // 犬関連
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

  updateDog: async (dogId: string, data: Partial<DogProfile>): Promise<ApiResponse<DogProfile>> => {
    try {
      const response = await api.put(`/dogs/${dogId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteDog: async (dogId: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete(`/dogs/${dogId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getVaccinationRecords: async (dogId: string): Promise<ApiResponse<Array<{ id: string; date: string; type: string }>>> => {
    try {
      const response = await api.get(`/dogs/${dogId}/vaccinations`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addVaccinationRecord: async (dogId: string, data: { date: string; type: string }): Promise<ApiResponse<{ id: string; date: string; type: string }>> => {
    try {
      const response = await api.post(`/dogs/${dogId}/vaccinations`, data);
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

  getPostsFeed: async (params?: { search?: string; hashtag?: string; limit?: number; offset?: number }): Promise<Post[]> => {
    try {
      const response = await api.get('/posts/feed', { params });
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
      
      // 複数画像対応
      if (data.images && data.images.length > 0) {
        data.images.forEach(image => {
          formData.append('images', image);
        });
      } else if (data.image) {
        // 後方互換性のため、単一画像もサポート
        formData.append('images', data.image);
      }

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

  likePost: async (postId: string): Promise<ApiResponse<{ message: string; likes_count: number }>> => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  unlikePost: async (postId: string): Promise<ApiResponse<{ message: string; likes_count: number }>> => {
    try {
      const response = await api.delete(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getComments: async (postId: string): Promise<Comment[]> => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addComment: async (data: AddCommentRequest): Promise<ApiResponse<Comment>> => {
    try {
      const response = await api.post(`/posts/${data.postId}/comments`, {
        content: data.text,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // イベント関連
  getEvents: async (upcomingOnly: boolean = true): Promise<Event[]> => {
    try {
      const response = await api.get('/events', {
        params: { upcoming_only: upcomingOnly }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getPublicEvents: async (): Promise<Event[]> => {
    try {
      const response = await api.get('/api/events/upcoming');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEventDetail: async (eventId: string): Promise<ApiResponse<Event>> => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registerForEvent: async (eventId: string, dogIds: string[]): Promise<ApiResponse<{ message: string; registration_id: string }>> => {
    try {
      const response = await api.post(`/events/${eventId}/register`, {
        dog_ids: dogIds
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelEventRegistration: async (eventId: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEventParticipants: async (eventId: string): Promise<ApiResponse<Array<{ user_id: string; user_name: string; dog_ids: string[] }>>> => {
    try {
      const response = await api.get(`/events/${eventId}/participants`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCalendar: async (year: number, month: number): Promise<ApiResponse<{ events: Event[]; holidays: Array<{ date: string; name: string }> }>> => {
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
  generateQRCode: async (): Promise<ApiResponse<{ qr_code: string; expires_at: string }>> => {
    try {
      const response = await api.get('/entry/qrcode');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  scanQRCode: async (qrData: { qr_code: string }): Promise<ApiResponse<{ user_id: string; user_name: string; valid: boolean }>> => {
    try {
      const response = await api.post('/entry/scan', qrData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  enterDogRun: async (dogIds: string[]): Promise<ApiResponse<{ entry_id: string; entry_time: string }>> => {
    try {
      const response = await api.post('/entry/enter', { dog_ids: dogIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  exitDogRun: async (): Promise<ApiResponse<{ exit_time: string; duration_minutes: number }>> => {
    try {
      const response = await api.post('/entry/exit');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentVisitors: async (): Promise<ApiResponse<Array<{ user_id: string; user_name: string; entry_time: string; dog_ids: string[] }>>> => {
    try {
      const response = await api.get('/entry/current');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEntryHistory: async (limit: number = 50): Promise<ApiResponse<Array<{ entry_id: string; entry_time: string; exit_time?: string; duration_minutes?: number }>>> => {
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
};

