'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import BackButton from '@/components/common/BackButton';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { usePersistentState } from '@/lib/hooks/usePersistentState';
import { notificationsAPI, Notification } from '@/lib/api/notifications';
import {
  BellIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function NotificationsPageContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = usePersistentState<'all' | 'unread'>('mindsage:notifications:filter', 'all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notificationsAPI.getNotifications(1, 100, filter === 'unread');
      setNotifications(response.data.notifications);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (selectedNotification?._id === id) setSelectedNotification(null);
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'crisis_alert':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
      case 'booking_confirmed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'system_announcement':
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-purple-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <BackButton className="mb-5" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated on your activity and health</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Unread
        </button>
      </div>

      {isLoading ? (
        <Loading />
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
          <p className="text-gray-500">You&apos;re all caught up!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${notification.read ? 'bg-white border-gray-100' : 'bg-purple-50/50 border-purple-100 ring-1 ring-purple-100 shadow-sm hover:shadow-md'}`}
              onClick={() => {
                setSelectedNotification(notification);
                if (!notification.read) handleMarkAsRead(notification._id);
              }}
            >
              <div className="flex-shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-semibold truncate ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2 flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className={`text-sm line-clamp-2 ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
                  {notification.message}
                </p>
              </div>
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(notification._id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                {getIcon(selectedNotification.type)}
                <h2 className="text-xl font-bold text-gray-900">{selectedNotification.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="prose prose-sm text-gray-600 max-h-96 overflow-y-auto mb-8">
              {selectedNotification.message}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Received on {new Date(selectedNotification.createdAt).toLocaleString()}
              </span>
              <div className="flex gap-3">
                {selectedNotification.actionUrl && (
                  <Link href={selectedNotification.actionUrl}>
                    <Button size="sm">
                      {selectedNotification.actionLabel || 'View Details'}
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedNotification(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
