'use client';

import {
  BookOpenIcon,
  FlagIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface CommunityOverviewProps {
  stats: any;
  communityAnalytics: any;
}

export default function CommunityOverview({ stats, communityAnalytics }: CommunityOverviewProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <BookOpenIcon className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.overview?.totalPosts || 0}</p>
          <p className="text-xs text-gray-600">Total Posts</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <FlagIcon className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.alerts?.flaggedPosts || 0}</p>
          <p className="text-xs text-gray-600">Flagged Posts</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CheckCircleIcon className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {communityAnalytics?.categoryDistribution?.length || 0}
          </p>
          <p className="text-xs text-gray-600">Categories</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <UserGroupIcon className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.overview?.activeUsers || 0}</p>
          <p className="text-xs text-gray-600">Active Users</p>
        </div>
      </div>
    </div>
  );
}
