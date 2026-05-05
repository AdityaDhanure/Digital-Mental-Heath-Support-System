// FILE: src/lib/api/users.ts
import apiClient from './axios';

export const usersAPI = {
  getCounselors: async () => {
    const response = await apiClient.get('/users/counselors');
    return response.data;
  },

  getCounselorById: async (counselorId: string) => {
    const response = await apiClient.get(`/users/counselor/${counselorId}`);
    return response.data;
  },

  getStudentDetails: async (studentId: string) => {
    const response = await apiClient.get(`/users/student/${studentId}`);
    return response.data;
  },

  getUserProfile: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
};
