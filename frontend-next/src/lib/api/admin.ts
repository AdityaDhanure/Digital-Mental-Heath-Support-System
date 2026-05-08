// FILE: src/lib/api/admin.ts
import apiClient from './axios';
import { API_CONFIG } from '@/lib/config/env';

export interface AdminActivity {
  id: string;
  type: string;
  label: string;
  details: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  href: string;
}

export interface CountById {
  _id: string;
  count: number;
}

export interface DateBucket {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  count: number;
  avgMessages?: number;
  postCount?: number;
  totalReplies?: number;
}

export interface DashboardStatsData {
  overview?: {
    totalUsers?: number;
    activeUsers?: number;
    totalChats?: number;
    totalBookings?: number;
    totalResources?: number;
    totalPosts?: number;
    newUsersThisMonth?: number;
  };
  alerts?: {
    pendingBookings?: number;
    flaggedPosts?: number;
  };
  breakdown?: {
    usersByRole?: CountById[];
    bookingsByStatus?: CountById[];
    chatSafetyMetrics?: CountById[];
  };
}

export interface ChatAnalyticsData {
  chatVolumeTrend?: DateBucket[];
  riskDistribution?: CountById[];
  sentimentDistribution?: CountById[];
  highRiskCount?: number;
  note?: string;
}

export interface BookingAnalyticsData {
  bookingTrend?: DateBucket[];
  statusDistribution?: CountById[];
  concernCategories?: CountById[];
  counselorUtilization?: Array<{
    _id: string;
    counselorName?: string;
    totalBookings: number;
    completedSessions: number;
  }>;
}

export interface CommunityAnalyticsData {
  postActivityTrend?: DateBucket[];
  categoryDistribution?: CountById[];
  moderationMetrics?: {
    totalPosts?: number;
    flaggedPosts?: number;
    removedPosts?: number;
  };
}

export interface UserForAnalysis {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'counselor' | 'admin';
}

export const adminAPI = {
  getDashboardStats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/admin/dashboard', { params });
    return response.data;
  },

  getRecentActivity: async (limit = 12): Promise<{ status: string; data: { activities: AdminActivity[] } }> => {
    const response = await apiClient.get('/admin/recent-activity', { params: { limit } });
    return response.data;
  },

  getUserAnalytics: async (period: string = '30') => {
    const response = await apiClient.get('/admin/analytics/users', { params: { period } });
    return response.data;
  },

  getChatAnalytics: async (period: string = '30') => {
    const response = await apiClient.get('/admin/analytics/chats', { params: { period } });
    return response.data;
  },

  getBookingAnalytics: async (period: string = '30') => {
    const response = await apiClient.get('/admin/analytics/bookings', { params: { period } });
    return response.data;
  },

  getCommunityAnalytics: async (period: string = '30') => {
    const response = await apiClient.get('/admin/analytics/community', { params: { period } });
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await apiClient.get('/admin/system/health');
    return response.data;
  },

  // User Management
  getUsers: async (params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (userId: string, isActive: boolean) => {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  getUserChatAnalysis: async (userId: string, period: string = '30') => {
    const response = await apiClient.get(`/admin/analytics/user/${userId}`, { params: { period } });
    return response.data;
  },

  generateReport: async (reportType: string, startDate?: string, endDate?: string, format?: string) => {
    const response = await apiClient.post('/admin/analytics/generate-report', {
      reportType,
      startDate,
      endDate,
      format: format || 'text'
    });
    return response.data;
  },

  downloadReport: async (reportType: string, startDate?: string, endDate?: string) => {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_CONFIG.API_URL}/admin/analytics/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reportType,
        startDate,
        endDate,
        format: 'download'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${reportType}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  getAllUsersForAnalysis: async (params?: { search?: string; role?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/admin/users', { params: { ...params, limit: 50 } });
    return response.data;
  },
};
