'use client';
import { UsersIcon, UserGroupIcon, ChatBubbleLeftRightIcon, BookOpenIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface Props {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalResources: number;
  newUsersThisMonth: number;
}

const cards = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    icon: UsersIcon,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    trend: (p: Props) => `+${p.newUsersThisMonth} new this month`,
    trendColor: 'text-green-600',
  },
  {
    key: 'activeUsers',
    label: 'Active (Last 7 Days)',
    icon: UserGroupIcon,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    trend: () => 'Logged in recently',
    trendColor: 'text-gray-500',
  },
  {
    key: 'totalPosts',
    label: 'Community Posts',
    icon: ChatBubbleLeftRightIcon,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    trend: () => 'Published posts',
    trendColor: 'text-gray-500',
  },
  {
    key: 'totalResources',
    label: 'Resources',
    icon: BookOpenIcon,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-700',
    trend: () => 'Total Published',
    trendColor: 'text-gray-500',
  },
];

export default function StatCards(props: Props) {
  const values: Record<string, number> = {
    totalUsers: props.totalUsers,
    activeUsers: props.activeUsers,
    totalPosts: props.totalPosts,
    totalResources: props.totalResources,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.key} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${c.iconBg} flex-shrink-0`}>
              <Icon className={`h-6 w-6 ${c.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{values[c.key]?.toLocaleString() ?? 0}</p>
              <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
              <p className={`text-xs mt-1 ${c.trendColor}`}>{c.trend(props)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
