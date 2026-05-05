// ============================================
// FILE: src/lib/api/community.ts
// ============================================
import apiClient from './axios';

export const communityAPI = {
  getAllPosts: async (params?: any) => {
    const response = await apiClient.get('/community/posts', { params });
    return response.data;
  },

  getTrendingPosts: async () => {
    const response = await apiClient.get('/community/posts/trending');
    return response.data;
  },

  getPostsByCategory: async (category: string) => {
    const response = await apiClient.get(`/community/posts/category/${category}`);
    return response.data;
  },

  getMyPosts: async () => {
    const response = await apiClient.get('/community/my-posts');
    return response.data;
  },

  getPost: async (id: string) => {
    const response = await apiClient.get(`/community/posts/${id}`);
    return response.data;
  },

  createPost: async (data: any) => {
    const response = await apiClient.post('/community/posts', data);
    return response.data;
  },

  updatePost: async (id: string, data: any) => {
    const response = await apiClient.patch(`/community/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id: string) => {
    const response = await apiClient.delete(`/community/posts/${id}`);
    return response.data;
  },

  votePost: async (id: string, voteType: 'up' | 'down') => {
    const response = await apiClient.post(`/community/posts/${id}/vote`, {
      voteType: voteType === 'up' ? 'upvote' : 'downvote'
    });
    return response.data;
  },

  addReply: async (postId: string, data: any) => {
    const response = await apiClient.post(`/community/posts/${postId}/replies`, data);
    return response.data;
  },

  flagPost: async (postId: string, reason: string) => {
    const response = await apiClient.post(`/community/posts/${postId}/flag`, { reason });
    return response.data;
  },

  getAdminAllPosts: async (params?: any) => {
    const response = await apiClient.get('/community/posts/admin/all', { params });
    return response.data;
  },

  getFlaggedPosts: async (params?: any) => {
    const response = await apiClient.get('/community/flagged', { params });
    return response.data;
  },

  moderatePost: async (id: string, approved: boolean, notes?: string) => {
    const response = await apiClient.patch(`/community/posts/${id}/moderate`, { approved, notes });
    return response.data;
  },
};
