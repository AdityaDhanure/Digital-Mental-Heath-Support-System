'use client';

import {
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface OverviewStatsProps {
  stats: any;
}

export default function OverviewStats({ stats }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
        </div>
        <p className="text-sm text-gray-600 mb-1">Total Users</p>
        <p className="text-3xl font-bold text-gray-900">{stats?.overview?.totalUsers || 0}</p>
        <p className="text-xs text-green-600 mt-1">{stats?.overview?.newUsersThisMonth || 0} new this month</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
          </div>
          <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
        </div>
        <p className="text-sm text-gray-600 mb-1">AI Chat Sessions</p>
        <p className="text-3xl font-bold text-gray-900">{stats?.overview?.totalChats || 0}</p>
        <p className="text-xs text-gray-500 mt-1">Total conversations</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <CalendarIcon className="h-6 w-6 text-green-600" />
          </div>
          <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
        </div>
        <p className="text-sm text-gray-600 mb-1">Counseling Sessions</p>
        <p className="text-3xl font-bold text-gray-900">{stats?.overview?.totalBookings || 0}</p>
        <p className="text-xs text-yellow-600 mt-1">{stats?.alerts?.pendingBookings || 0} pending</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-pink-100 rounded-xl">
            <BookOpenIcon className="h-6 w-6 text-pink-600" />
          </div>
          <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
        </div>
        <p className="text-sm text-gray-600 mb-1">Resources</p>
        <p className="text-3xl font-bold text-gray-900">{stats?.overview?.totalResources || 0}</p>
        <p className="text-xs text-gray-500 mt-1">Published resources</p>
      </div>
    </div>
  );
}
