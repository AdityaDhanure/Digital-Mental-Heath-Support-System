// ============================================
// FILE: src/lib/api/auth.ts
// ============================================
import apiClient from './axios';
import { LoginCredentials, RegisterData, AuthResponse } from '@/types/auth.types';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  sendVerificationOTP: async () => {
    const response = await apiClient.post('/auth/send-verification-otp');
    return response.data;
  },

  verifyEmailOTP: async (otp: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/verify-email-otp', { otp });
    return response.data;
  },

  verifyEmail: async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/verify-email-otp', { otp });
    return response.data;
  },

  resendOTP: async (email: string) => {
    const response = await apiClient.post('/auth/send-verification-otp');
    return response.data;
  },

  // NEW: Refresh token
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },


  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.patch('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.patch('/auth/me', data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete('/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.patch(`/auth/reset-password/${token}`, {
      password: newPassword,
    });
    return response.data;
  },

  getCounselors: async () => {
    const response = await apiClient.get('/auth/counselors');
    return response.data;
  },
};
   