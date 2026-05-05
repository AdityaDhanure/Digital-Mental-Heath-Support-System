import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface ChatHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function ChatHeader({ sidebarOpen, onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          ) : (
            <Bars3Icon className="h-5 w-5 text-gray-600" />
          )}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
            <img src="/giffie.png" alt="Giffie" className="w-10 h-10 rounded-full" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Giffie</h1>
            <p className="text-xs text-gray-500">Your AI Companion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
