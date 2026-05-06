// ============================================
// FILE: src/lib/api/axios.ts
// ============================================
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_CONFIG } from '@/lib/config/env';

const apiClient = axios.create({
  baseURL: API_CONFIG.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,  // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    console.log('API Request to:', config.url, 'Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token is invalid or expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data.data;
          localStorage.setItem('auth_token', token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        useAuthStore.getState().logout();
        
        // Only redirect to login if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // ✅ NEW: Handle validation errors (400 status)
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      
      // If backend returns multiple validation errors as object
      if (errorData.errors && typeof errorData.errors === 'object') {
        const messages = Object.values(errorData.errors).map((err: any) => err.message || err).join(', ');
        error.response.data.message = messages;
      }
      
      // If backend returns errors as array
      if (Array.isArray(errorData.errors)) {
        error.response.data.message = errorData.errors.map((e: any) => e.msg || e.message || e).join(', ');
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default apiClient;