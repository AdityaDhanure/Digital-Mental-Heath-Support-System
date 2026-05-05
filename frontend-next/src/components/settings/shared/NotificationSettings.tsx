'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { authAPI } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { EnvelopeIcon, BellIcon, BookOpenIcon, ChatBubbleLeftRightIcon, MegaphoneIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface NotificationSettingsProps {
  user: any;
  onUpdate: () => void;
}

export default function NotificationSettings({ user, onUpdate }: NotificationSettingsProps) {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    bookingReminders: true,
    bookingUpdates: true,
    communityUpdates: false,
    communityReplies: true,
    resourceRecommendations: true,
    systemAnnouncements: true,
    marketingEmails: false,
  });

  const categories = [
    {
      title: 'Channels',
      icon: <EnvelopeIcon className="h-5 w-5" />,
      items: [
        { key: 'email', label: 'Email', description: 'Receive notifications via email' },
        { key: 'push', label: 'Push', description: 'Browser push notifications' },
      ]
    },
    {
      title: user?.role === 'counselor' ? 'Sessions' : 'Bookings',
      icon: <BellIcon className="h-5 w-5" />,
      items: [
        { key: 'bookingReminders', label: 'Reminders', description: 'Get reminded before sessions' },
        { key: 'bookingUpdates', label: 'Updates', description: 'Status changes and confirmations' },
      ]
    },
    {
      title: 'Community',
      icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
      items: [
        { key: 'communityUpdates', label: 'Updates', description: 'New posts in your interests' },
        { key: 'communityReplies', label: 'Replies', description: 'When someone replies to you' },
      ]
    },
    {
      title: 'Resources',
      icon: <BookOpenIcon className="h-5 w-5" />,
      items: [
        { key: 'resourceRecommendations', label: 'Recommendations', description: 'Personalized resources' },
        { key: 'systemAnnouncements', label: 'Announcements', description: 'Platform updates' },
      ]
    },
  ];

  const handleSave = async () => {
    try {
      await authAPI.updateProfile({ notificationPreferences: notifications });
      toast.success('Notification preferences updated');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    }
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-purple-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.title}>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
              {category.icon}
            </span>
            {category.title}
          </h3>
          <div className="space-y-3">
            {category.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <div className="font-medium text-gray-900">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
                <ToggleSwitch
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={(val) => setNotifications({ ...notifications, [item.key]: val })}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button onClick={handleSave} className="w-full">
        Save Preferences
      </Button>
    </div>
  );
}
