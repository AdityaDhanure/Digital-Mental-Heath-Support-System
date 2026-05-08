// Unified Sidebar Component for Student, Counselor, and Admin
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils/cn';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  BookOpenIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ChartBarIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const studentNav: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'AI Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Sessions', href: '/bookings', icon: CalendarIcon },
  { name: 'Resources', href: '/resources', icon: BookOpenIcon },
  { name: 'Community', href: '/community', icon: UsersIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
];

const counselorNav: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Sessions', href: '/bookings', icon: CalendarIcon },
  { name: 'Students', href: '/dashboard/students', icon: UsersIcon },
  { name: 'Resources', href: '/resources', icon: BookOpenIcon },
  { name: 'Community', href: '/community', icon: UsersIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
];

const adminNav: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Resources', href: '/admin/resources', icon: BookOpenIcon },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
  { name: 'Community', href: '/admin/community', icon: MegaphoneIcon },
  { name: 'Users', href: '/admin/users', icon: ShieldCheckIcon },
  // { name: 'Profile', href: '/profile', icon: UserCircleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isHydrated } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'admin':
        return adminNav;
      case 'counselor':
        return counselorNav;
      default:
        return studentNav;
    }
  };

  const getPortalName = (): string => {
    switch (user?.role) {
      case 'admin':
        return 'Admin Portal';
      case 'counselor':
        return 'Counselor Portal';
      default:
        return 'Student Portal';
    }
  };

  const navItems = getNavItems();

  if (!isHydrated) {
    return null;
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-lg border border-gray-100"
      >
        {isMobileOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-700" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-40 transition-all duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <HeartIconSolid className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">MindSage AI</h1>
              <p className="text-xs text-gray-500">{getPortalName()}</p>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        {user && (
          <Link href="/profile" className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </Link>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive ? 'text-purple-600' : '')} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Cog6ToothIcon className="h-5 w-5" />
            <span>Settings</span>
          </Link>

          {user?.role !== 'admin' && (
            <Link
              href="/notifications"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <BellIcon className="h-5 w-5" />
              <span>Notifications</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Crisis Support */}
        <div className="p-4 mx-3 mb-3 bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-xl">
          <p className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
            <span>🆘</span> Need Help Now?
          </p>
          <a 
            href="tel:18005990019" 
            className="text-sm font-bold text-red-600 hover:text-red-700 hover:underline"
          >
            Call 1800 599 0019
          </a>
          <p className="text-xs text-red-600 mt-1">24/7 Helpline</p>
        </div>
      </aside>
    </>
  );
}
