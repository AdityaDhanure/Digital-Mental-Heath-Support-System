// src/lib/api/notifications.ts

import apiClient from './axios';

export interface Notification {
  _id: string;
  recipient: string;
  type: 'booking_confirmed' | 'booking_reminder' | 'booking_cancelled' | 'booking_rescheduled' | 'chat_alert' | 'community_reply' | 'community_upvote' | 'resource_recommendation' | 'crisis_alert' | 'system_announcement' | 'counselor_message' | 'moderation_action' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedEntity?: {
    entityType: string;
    entityId: string;
  };
  actionUrl?: string;
  actionLabel?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  status: string;
  data: {
    notifications: Notification[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      hasMore: boolean;
    };
  };
}

export const notificationsAPI = {
  getNotifications: async (page = 1, limit = 20, unreadOnly = false): Promise<NotificationsResponse> => {
    const response = await apiClient.get('/notifications', {
      params: { page, limit, unreadOnly }
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.data;
  },

  getNotificationById: async (id: string): Promise<{ notification: Notification }> => {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<{ notification: Notification }> => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  seedDemo: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/notifications/seed-demo');
    return response.data;
  }
};
