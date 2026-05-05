// ============================================
// FILE: src/lib/api/resources.ts
// ============================================
import apiClient from './axios';

export const resourcesAPI = {
  getAllResources: async (params?: any) => {
    const response = await apiClient.get('/resources', { params });
    return response.data;
  },

  getAdminAllResources: async (params?: any) => {
    const response = await apiClient.get('/resources/admin/all', { params });
    return response.data;
  },

  getMyResources: async (params?: any) => {
    const response = await apiClient.get('/resources/my-uploads', { params });
    return response.data;
  },

  getFeaturedResources: async () => {
    const response = await apiClient.get('/resources/featured');
    return response.data;
  },

  getTrendingResources: async () => {
    const response = await apiClient.get('/resources/trending');
    return response.data;
  },

  getResourcesByCategory: async (category: string) => {
    const response = await apiClient.get(`/resources/category/${category}`);
    return response.data;
  },

  getResourceById: async (id: string) => {
    const response = await apiClient.get(`/resources/${id}`);
    return response.data;
  },

  createResource: async (data: any) => {
    const response = await apiClient.post('/resources', data);
    return response.data;
  },

  updateResource: async (id: string, data: any) => {
    const response = await apiClient.patch(`/resources/${id}`, data);
    return response.data;
  },

  deleteResource: async (id: string) => {
    const response = await apiClient.delete(`/resources/${id}`);
    return response.data;
  },

  toggleLike: async (id: string) => {
    const response = await apiClient.post(`/resources/${id}/like`);
    return response.data;
  },

  rateResource: async (id: string, rating: number) => {
    const response = await apiClient.post(`/resources/${id}/rate`, { rating });
    return response.data;
  },

  fixUnpublishedResources: async () => {
    const response = await apiClient.patch('/resources/fix-unpublished');
    return response.data;
  },

  publishResource: async (id: string) => {
    const response = await apiClient.patch(`/resources/${id}/publish`);
    return response.data;
  },
};