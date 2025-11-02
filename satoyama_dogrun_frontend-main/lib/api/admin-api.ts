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
};

