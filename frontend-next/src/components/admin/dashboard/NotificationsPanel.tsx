'use client';
import Link from 'next/link';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import type { Notification } from '@/lib/api/notifications';

interface Props { notifications: Notification[]; unreadCount: number; }

export default function NotificationsPanel({ notifications, unreadCount }: Props) {
  const rows = [
    { label: 'Unread Notifications', value: unreadCount,               emoji: '🔔', color: 'text-yellow-500' },
    { label: 'Total (this session)', value: notifications.length,      emoji: '🕐', color: 'text-blue-500' },
    { label: 'High Priority',        value: notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length, emoji: '🚨', color: 'text-red-500' },
    { label: 'Crisis Alerts',        value: notifications.filter(n => n.type === 'crisis_alert').length, emoji: '⚠️', color: 'text-orange-500' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <Link href="/admin/notifications" className="text-xs text-indigo-600 hover:underline font-medium">View All</Link>
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">{r.emoji}</span>
              <span className="text-sm text-gray-700">{r.label}</span>
            </div>
            <span className={`text-sm font-bold ${r.color}`}>{r.value}</span>
          </div>
        ))}
      </div>

      <Link href="/admin/notifications"
        className="mt-auto flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-blue-200 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors">
        <PaperAirplaneIcon className="h-4 w-4" /> View Notifications
      </Link>
    </div>
  );
}
