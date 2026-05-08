'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { chatAPI } from '@/lib/api/chat';
import { usePersistentState } from '@/lib/hooks/usePersistentState';
import { ChatMessage } from '@/types/chat.types';
import toast from 'react-hot-toast';
import {
  ChatHeader,
  ChatSidebar,
  MessageBubble,
  ChatInput,
  QuickActions,
  EmptyState,
  LoadingIndicator,
} from '@/components/chat/shared';

export default function StudentChat() {
  const {
    messages,
    isLoading,
    sessions,
    currentSessionId,
    isLoadingSessions,
    addMessage,
    setLoading,
    createNewSession,
    loadSession,
    deleteSession,
    loadSessionsFromBackend,
    updateSessionTitle,
    pinSession,
    setLoadingSessions,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = usePersistentState('mindsage:chat:sidebar-open', true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const chatInitializedRef = useRef(false);

  useEffect(() => {
    if (chatInitializedRef.current) return;
    chatInitializedRef.current = true;
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setShowQuickActions(messages.length === 0);
  }, [messages]);

  const loadChatHistory = async () => {
    const { sessions: existingSessions } = useChatStore.getState();
    if (existingSessions.length > 0) {
      setLoadingSessions(false);
      return;
    }

    try {
      setLoadingSessions(true);
      const response = await chatAPI.getChatHistory();

      if (response.data.chats && response.data.chats.length > 0) {
        const fullSessions = await Promise.all(
          response.data.chats.map(async (chat: any) => {
            try {
              const sessionDetails = await chatAPI.getChatSession(chat.sessionId);
              return sessionDetails.data.chat;
            } catch {
              return null;
            }
          })
        );
        const validSessions = fullSessions.filter(s => s !== null);
        loadSessionsFromBackend(validSessions);
      } else {
        createNewSession();
      }
    } catch {
      createNewSession();
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = createNewSession();
    }

    setShowQuickActions(false);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(content, activeSessionId, messages);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(),
        sentiment: {
          overall: response.data.sentiment,
          stressLevel: 'none'
        },
      };
      addMessage(aiMessage);

      if (response.data.autoTitle && activeSessionId) {
        updateSessionTitle(activeSessionId, response.data.autoTitle);
      }

      if (response.data.safety.needsCounselor) {
        toast.error('⚠️ We detected signs of distress. Please consider reaching out to a counselor.', { duration: 6000 });
      }

      if (response.data.emergencyResources) {
        toast.error(`🆘 Crisis detected. Helpline: ${response.data.emergencyResources.helpline}`, { duration: 10000 });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to get response. Please try again.';
      toast.error(errorMsg);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or reach out to a counselor if you need immediate support.",
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    createNewSession();
    setShowQuickActions(true);
    toast.success('New conversation started');
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      await chatAPI.getChatSession(sessionId);
      loadSession(sessionId);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        loadSession(sessionId);
      } else {
        toast.error('Failed to load conversation');
      }
    } finally {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Delete this conversation? This action cannot be undone.')) return;

    try {
      await chatAPI.deleteChatHistory(sessionId);
      deleteSession(sessionId);
      toast.success('Conversation deleted');
      setActiveMenu(null);

      const response = await chatAPI.getChatHistory();
      if (response.data.chats && response.data.chats.length > 0) {
        const fullSessions = await Promise.all(
          response.data.chats.map(async (chat: any) => {
            try {
              const sessionDetails = await chatAPI.getChatSession(chat.sessionId);
              return sessionDetails.data.chat;
            } catch {
              return null;
            }
          })
        );
        const validSessions = fullSessions.filter(s => s !== null);
        loadSessionsFromBackend(validSessions);
      }
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  const handleRename = (sessionId: string) => {
    const session = sessions.find(s => s.sessionId === sessionId);
    if (session) {
      setRenameSessionId(sessionId);
      setNewTitle(session.title || '');
      setActiveMenu(null);
    }
  };

  const handleSaveRename = async () => {
    if (renameSessionId && newTitle.trim()) {
      try {
        await chatAPI.renameSession(renameSessionId, newTitle.trim());
        updateSessionTitle(renameSessionId, newTitle.trim());
        toast.success('Chat renamed');
      } catch {
        toast.error('Failed to rename chat');
      } finally {
        setRenameSessionId(null);
        setNewTitle('');
      }
    }
  };

  const handlePinToggle = (sessionId: string) => {
    pinSession(sessionId);
    setActiveMenu(null);
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] gap-0 bg-gray-50">
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0 bg-white border-r border-gray-200`}>
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onNewChat={handleNewChat}
          onRename={handleRename}
          onPinToggle={handlePinToggle}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          renameSessionId={renameSessionId}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          onSaveRename={handleSaveRename}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <ChatHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble key={message.id || (message as any)._id || index} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}

          {isLoading && <LoadingIndicator />}
        </div>

        {showQuickActions && messages.length === 0 && (
          <div className="border-t border-gray-200 px-3 py-2 bg-gray-50">
            <QuickActions onSelect={handleSendMessage} />
          </div>
        )}

        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
