// FILE: src/store/chatStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, ChatSession } from '@/types/chat.types';

interface ChatState {
  messages: ChatMessage[];
  sessions: ChatSession[];
  currentSessionId: string;
  isLoading: boolean;
  isLoadingSessions: boolean;
  
  // Message actions
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  
  // Session actions
  createNewSession: () => string;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  loadSessionsFromBackend: (backendSessions: any[]) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  pinSession: (sessionId: string) => void;
  setLoadingSessions: (loading: boolean) => void;
  
  // Utility
  clearStore: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      sessions: [],
      currentSessionId: '',
      isLoading: false,
      isLoadingSessions: false,

      addMessage: (message) => {
        const state = get();
        const newMessages = [...state.messages, message];
        
        set({ messages: newMessages });
        
        // Update current session
        const sessionIndex = state.sessions.findIndex(
          s => s.sessionId === state.currentSessionId
        );
        
        if (sessionIndex !== -1) {
          const updatedSessions = [...state.sessions];
          updatedSessions[sessionIndex] = {
            ...updatedSessions[sessionIndex],
            messages: newMessages,
            updatedAt: new Date(),
          };
          
          // Auto-generate title from first user message if no title exists
          if (!updatedSessions[sessionIndex].title && message.role === 'user') {
            updatedSessions[sessionIndex].title = 
              message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '');
          }
          
          set({ sessions: updatedSessions });
        }
      },

      setMessages: (messages) => set({ messages }),

      setLoading: (isLoading) => set({ isLoading }),

      setLoadingSessions: (isLoadingSessions) => set({ isLoadingSessions }),

      createNewSession: () => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSession: ChatSession = {
          sessionId,
          messages: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: sessionId,
          messages: [],
        }));

        return sessionId;
      },

      loadSession: (sessionId) => {
        const state = get();
        const session = state.sessions.find(s => s.sessionId === sessionId);
        
        if (session) {
          set({
            currentSessionId: sessionId,
            messages: session.messages || [],
          });
        }
      },

      deleteSession: (sessionId) => {
        const state = get();
        const updatedSessions = state.sessions.filter(s => s.sessionId !== sessionId);
        
        let newCurrentSessionId = state.currentSessionId;
        let newMessages = state.messages;
        
        // If deleting current session, switch to another or create new
        if (sessionId === state.currentSessionId) {
          if (updatedSessions.length > 0) {
            newCurrentSessionId = updatedSessions[0].sessionId;
            newMessages = updatedSessions[0].messages || [];
          } else {
            // Create new session if none exist - set sessions to empty first
            // The caller (handleDeleteSession) will create and reload properly
            const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newSession: ChatSession = {
              sessionId: newId,
              messages: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            set({
              sessions: [newSession],
              currentSessionId: newId,
              messages: [],
            });
            return;
          }
        }
        
        set({
          sessions: updatedSessions,
          currentSessionId: newCurrentSessionId,
          messages: newMessages,
        });
      },

      loadSessionsFromBackend: (backendSessions) => {
        // Transform backend sessions to frontend format
        const transformedSessions: ChatSession[] = backendSessions.map((session: any) => ({
          sessionId: session.sessionId,
          title: session.title || `Chat ${new Date(session.createdAt).toLocaleDateString()}`,
          messages: session.messages || [],
          isActive: true,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          isPinned: session.isPinned || false,
        }));

        // Sort: pinned first, then by updatedAt
        transformedSessions.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        const state = get();
        
        // If no current session, set first one as current
        let currentSessionId = state.currentSessionId;
        let messages = state.messages;
        
        if (!currentSessionId && transformedSessions.length > 0) {
          currentSessionId = transformedSessions[0].sessionId;
          messages = transformedSessions[0].messages || [];
        } else if (currentSessionId) {
          // Restore messages for persisted currentSessionId
          const currentSession = transformedSessions.find(s => s.sessionId === currentSessionId);
          if (currentSession) {
            messages = currentSession.messages || [];
          } else {
            // Session no longer exists, clear currentSessionId
            currentSessionId = transformedSessions.length > 0 ? transformedSessions[0].sessionId : '';
            messages = currentSessionId ? (transformedSessions[0].messages || []) : [];
          }
        }

        set({
          sessions: transformedSessions,
          currentSessionId,
          messages,
        });
      },

      updateSessionTitle: (sessionId, title) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.sessionId === sessionId ? { ...s, title, updatedAt: new Date() } : s
          ),
        }));
      },

      pinSession: (sessionId) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.sessionId === sessionId ? { ...s, isPinned: !s.isPinned } : s
          ).sort((a, b) => {
            // Sort: pinned first, then by updatedAt
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          }),
        }));
      },

      clearStore: () => {
        set({
          messages: [],
          sessions: [],
          currentSessionId: '',
          isLoading: false,
        });
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        currentSessionId: state.currentSessionId,
        // Don't persist sessions - load from backend
      }),
    }
  )
);