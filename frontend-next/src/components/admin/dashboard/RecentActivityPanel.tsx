'use client';
import Link from 'next/link';
import type { AdminActivity } from '@/lib/api/admin';

interface Props { activities: AdminActivity[]; }

const typeConfig: Record<string, { label: string; emoji: string; color: string }> = {
  user_created:           { label: 'New user',          emoji: '👤', color: 'text-indigo-600' },
  booking_created:        { label: 'Booking',           emoji: '📅', color: 'text-green-600' },
  resource_created:       { label: 'Resource',          emoji: '📚', color: 'text-blue-600' },
  post_created:           { label: 'Community post',    emoji: '💬', color: 'text-orange-500' },
  post_flagged:           { label: 'Review needed',     emoji: '🚩', color: 'text-red-600' },
  chat_risk:              { label: 'Safety signal',     emoji: '⚠️', color: 'text-red-600' },
  booking_confirmed:      { label: 'Session confirmed',   emoji: '📅', color: 'text-green-600' },
  booking_cancelled:      { label: 'Session cancelled',   emoji: '❌', color: 'text-red-500' },
  crisis_alert:           { label: 'Crisis alert',        emoji: '🚨', color: 'text-red-600' },
  resource_recommendation:{ label: 'Resource added',      emoji: '📚', color: 'text-blue-600' },
  system_announcement:    { label: 'Announcement',        emoji: '📢', color: 'text-purple-600' },
  community_reply:        { label: 'Community reply',     emoji: '💬', color: 'text-orange-500' },
  general:                { label: 'Activity',            emoji: '🔔', color: 'text-gray-600' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default function RecentActivityPanel({ activities }: Props) {
  const items = activities.slice(0, 8);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        <Link href="/admin/notifications" className="text-xs text-indigo-600 hover:underline font-medium">View All</Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 pb-2 pr-4">Activity</th>
              <th className="text-left text-xs font-medium text-gray-500 pb-2 pr-4">Details</th>
              <th className="text-left text-xs font-medium text-gray-500 pb-2">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.length > 0 ? items.map((activity) => {
              const cfg = typeConfig[activity.type] ?? {
                ...typeConfig.general,
                label: activity.label || typeConfig.general.label,
              };
              return (
                <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span>{cfg.emoji}</span>
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-gray-600 max-w-[260px] truncate">
                    <Link href={activity.href} className="hover:text-indigo-600 hover:underline">
                      {activity.details}
                    </Link>
                  </td>
                  <td className="py-2.5 text-xs text-gray-400 whitespace-nowrap">{timeAgo(activity.createdAt)}</td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={3} className="py-6 text-center text-gray-400 text-xs">No recent activity</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
