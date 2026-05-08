'use client';
import Link from 'next/link';
import { FlagIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface Props {
  flaggedPosts: number;
  totalPosts: number;
  pendingBookings: number;
}

export default function CommunityModerationPanel({ flaggedPosts, totalPosts, pendingBookings }: Props) {
  const rows = [
    { label: 'Flagged Posts',     value: flaggedPosts,    icon: '🚩', color: 'text-red-500',    badge: flaggedPosts > 0 ? 'Needs Review' : null, badgeColor: 'bg-red-100 text-red-600' },
    { label: 'Published Posts',   value: totalPosts,      icon: '💬', color: 'text-blue-500',   badge: null, badgeColor: '' },
    { label: 'Pending Bookings',  value: pendingBookings, icon: '📅', color: 'text-orange-500', badge: pendingBookings > 0 ? 'Action Needed' : null, badgeColor: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Community Moderation</h3>
        <Link href="/admin/community" className="text-xs text-indigo-600 hover:underline font-medium">View All</Link>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">{row.icon}</span>
              <span className="text-sm text-gray-700">{row.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {row.badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.badgeColor}`}>{row.badge}</span>
              )}
              <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
            </div>
          </div>
        ))}
      </div>

      {flaggedPosts > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-600 font-medium flex items-center gap-2">
          <FlagIcon className="h-3.5 w-3.5" />
          {flaggedPosts} post{flaggedPosts > 1 ? 's' : ''} need moderator review
        </div>
      )}

      <Link href="/admin/community"
        className="mt-auto flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-green-200 text-green-700 text-sm font-medium hover:bg-green-50 transition-colors">
        <ShieldCheckIcon className="h-4 w-4" /> Moderate Content
      </Link>
    </div>
  );
}
