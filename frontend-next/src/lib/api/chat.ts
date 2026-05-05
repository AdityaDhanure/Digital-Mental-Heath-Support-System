// FILE: src/lib/api/chat.ts
import { apiClient } from './axios';
import { ChatMessage } from '@/types/chat.types';

export interface ChatResponse {
  status: 'success';
  data: {
    message: string;
    sessionId: string;
    messageCount: number;
    autoTitle?: string | null;
    safety: {
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      needsCounselor: boolean;
    };
    sentiment: string;
    processingTime: number;
    emergencyResources?: {
      helpline: string;
      emergencyContacts: string[];
      immediateActions: string[];
    };
  };
}

export const chatAPI = {
  /**
   * Send message to AI service
   */
  sendMessage: async (
    message: string,
    sessionId: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatResponse> => {
    const response = await apiClient.post('/chat/message', {
      message,
      sessionId,
      conversationHistory: conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    }, {
      timeout: 35000, // 35 seconds
    });
    return response.data;
  },

  /**
   * Get chat history for current user
   */
  getChatHistory: async (page = 1, limit = 50) => {
    const response = await apiClient.get('/chat/history', {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Get specific chat session with full message history
   */
  getChatSession: async (sessionId: string) => {
    const response = await apiClient.get(`/chat/session/${sessionId}`);
    return response.data;
  },

  /**
   * End chat session
   */
  endChatSession: async (sessionId: string) => {
    const response = await apiClient.post(`/chat/session/${sessionId}/end`);
    return response.data;
  },

  /**
   * Delete chat history (user-initiated)
   */
  deleteChatHistory: async (sessionId?: string) => {
    const response = await apiClient.delete('/chat/history', {
      data: { sessionId }
    });
    return response.data;
  },

  /**
   * Get chat recommendations based on history
   */
  getRecommendations: async () => {
    const response = await apiClient.get('/chat/recommendations');
    return response.data;
  },

  /**
   * Get chat statistics
   */
  getChatStats: async () => {
    const response = await apiClient.get('/chat/stats');
    return response.data;
  },

  /**
   * Report inappropriate AI response
   */
  reportResponse: async (sessionId: string, messageIndex: number, reason: string) => {
    const response = await apiClient.post('/chat/report', {
      sessionId,
      messageIndex,
      reason,
    });
    return response.data;
  },

  /**
   * Rename a chat session in the database
   */
  renameSession: async (sessionId: string, title: string) => {
    const response = await apiClient.patch(`/chat/session/${sessionId}/rename`, { title });
    return response.data;
  },
};