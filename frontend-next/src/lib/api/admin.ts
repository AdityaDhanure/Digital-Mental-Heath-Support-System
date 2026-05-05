// FILE: src/lib/api/admin.ts
import apiClient from './axios';

export const adminAPI = {
  getDashboardStats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/admin/dashboard', { params });
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_URL}/admin/analytics/generate-report`, {
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
