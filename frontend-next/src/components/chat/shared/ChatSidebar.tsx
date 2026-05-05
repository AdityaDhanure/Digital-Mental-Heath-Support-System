import { ChatSession } from '@/types/chat.types';
import { 
  EllipsisVerticalIcon, 
  BookmarkIcon, 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onNewChat: () => void;
  onRename: (sessionId: string) => void;
  onPinToggle: (sessionId: string) => void;
  activeMenu: string | null;
  setActiveMenu: (id: string | null) => void;
  renameSessionId: string | null;
  newTitle: string;
  setNewTitle: (title: string) => void;
  onSaveRename: () => void;
}

export default function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  onRename,
  onPinToggle,
  activeMenu,
  setActiveMenu,
  renameSessionId,
  newTitle,
  setNewTitle,
  onSaveRename,
}: ChatSidebarProps) {
  const getSessionPreview = (session: ChatSession) => {
    if (!session.messages || session.messages.length === 0) return 'New conversation';
    const firstUserMessage = session.messages.find((m) => m.role === 'user');
    return firstUserMessage?.content.slice(0, 35) + '...' || 'Empty conversation';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
        >
          <span className="text-xl">+</span>
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className={`group relative rounded-lg transition-all ${
                  session.sessionId === currentSessionId
                    ? 'bg-purple-50 border-l-4 border-purple-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                {renameSessionId === session.sessionId ? (
                  <div className="p-3">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onSaveRename();
                        if (e.key === 'Escape') setActiveMenu(null);
                      }}
                      onBlur={onSaveRename}
                      className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onSelectSession(session.sessionId)}
                      className="w-full text-left p-3 pr-10"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        {session.isPinned && (
                          <BookmarkSolidIcon className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm font-medium text-gray-900 line-clamp-1 flex-1">
                          {session.title || getSessionPreview(session)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">
                        {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                      </p>
                    </button>

                    <div className="absolute right-2 top-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === session.sessionId ? null : session.sessionId);
                        }}
                        className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <EllipsisVerticalIcon className="h-4 w-4 text-gray-600" />
                      </button>

                      {activeMenu === session.sessionId && (
                        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => {
                              onPinToggle(session.sessionId);
                              setActiveMenu(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <BookmarkIcon className="h-4 w-4" />
                            {session.isPinned ? 'Unpin' : 'Pin'}
                          </button>
                          <button
                            onClick={() => {
                              onRename(session.sessionId);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Rename
                          </button>
                          <button
                            onClick={() => onDeleteSession(session.sessionId)}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
