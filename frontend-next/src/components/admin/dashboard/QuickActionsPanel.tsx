'use client';
import Link from 'next/link';
import { UsersIcon, BookOpenIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const actions = [
  { label: 'Manage Users',      href: '/admin/users',      icon: UsersIcon,       bg: 'bg-blue-50',   color: 'text-blue-600',   border: 'border-blue-100' },
  { label: 'View Analytics',    href: '/admin/analytics',  icon: ChartBarIcon,    bg: 'bg-purple-50', color: 'text-purple-600', border: 'border-purple-100' },
  { label: 'Manage Resources',  href: '/admin/resources',  icon: BookOpenIcon,    bg: 'bg-green-50',  color: 'text-green-600',  border: 'border-green-100' },
  { label: 'Community',         href: '/admin/community',  icon: ShieldCheckIcon, bg: 'bg-orange-50', color: 'text-orange-600', border: 'border-orange-100' },
];

export default function QuickActionsPanel() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <h3 className="font-semibold text-gray-900">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.label} href={a.href}
              className={`flex items-center gap-3 p-3 rounded-xl border ${a.bg} ${a.border} hover:shadow-sm transition-all`}>
              <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                <Icon className={`h-5 w-5 ${a.color}`} />
              </div>
              <span className={`text-sm font-semibold ${a.color}`}>{a.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
