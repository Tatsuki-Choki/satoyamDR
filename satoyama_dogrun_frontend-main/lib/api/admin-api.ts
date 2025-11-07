/**
 * 管理側APIクライアント
 */
import { createApiInstance, ApiResponse } from './shared';

const api = createApiInstance();

// 型定義
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApplicationStatusResponse {
  application_id: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_at?: string;
  created_at: string;
}

// 管理側APIクライアント
export const adminApiClient = {
  // 認証関連
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

  logout: (): void => {
    localStorage.removeItem('admin_access_token');
  },

  getCurrentAdmin: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 申請管理
  getAdminApplications: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/applications');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getApplicationStats: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/applications/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getApplication: async (applicationId: string): Promise<any> => {
    try {
      const response = await api.get(`/admin/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approveApplication: async (applicationId: string, notes?: string): Promise<any> => {
    try {
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
      const response = await api.put(`/admin/applications/${applicationId}/reject`, {
        rejection_reason: reason,
        admin_notes: reason
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ダッシュボード
  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ユーザー管理
  getUsers: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserDetail: async (userId: string): Promise<any> => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 投稿管理
  getPosts: async (status?: string): Promise<any> => {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/admin/posts', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPostStats: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/posts/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPostDetail: async (postId: string): Promise<any> => {
    try {
      const response = await api.get(`/admin/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePostStatus: async (postId: string, status: string, adminNotes?: string): Promise<any> => {
    try {
      const response = await api.put(`/admin/posts/${postId}/status`, {
        status,
        admin_notes: adminNotes
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deletePost: async (postId: string): Promise<any> => {
    try {
      const response = await api.delete(`/admin/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

