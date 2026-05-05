// ============================================
// FILE: src/components/layout/Header.tsx
// ============================================
'use client';

import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { useMoodStore } from '@/store/moodStore';
import { notificationsAPI } from '@/lib/api/notifications';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const { user } = useAuthStore();
  const [notifications] = useState(3);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left spacer */}
        <div className="flex-1"></div>

        {/* Search - Centered */}
        <div className="flex-1 max-w-xl pr-28">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search resources, counselors..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex-1 flex items-center justify-end gap-4">
          {/* Notifications */}
          <NotificationBell />

          {/* Mood Indicator - Counselor Only */}
          <MoodIndicator />
        </div>
      </div>
    </header>
  );
}

// Notification Bell Component
function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationsAPI.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link 
      href="/notifications"
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      title="Notifications"
    >
      <BellIcon className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}

// Mood Indicator Component
function MoodIndicator() {
  const { getMoodData, getMoodText } = useMoodStore();
  const moodData = getMoodData();
  const moodText = getMoodText();

  if (!moodData) return null;

  // Extract background color from the color string
  const bgColor = moodData.color.split(' ')[0]; // Gets 'bg-green-100', 'bg-blue-100', etc.

  return (
    <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 ${bgColor} border ${bgColor.replace('bg-', 'border-').replace('-100', '-200')} rounded-lg transition-all`}>
      <span className="w-2 h-2 bg-current rounded-full animate-pulse"></span>
      <span className="text-sm font-medium text-gray-800">
        {moodText}
      </span>
    </div>
  );
}
