'use client';

import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { adminAPI, type AdminActivity } from '@/lib/api/admin';
import { notificationsAPI, type Notification } from '@/lib/api/notifications';
import { resourcesAPI } from '@/lib/api/resources';
import type { Resource } from '@/types/resource.types';
import { BellIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

import StatCards from '@/components/admin/dashboard/StatCards';
import UserManagementPanel from '@/components/admin/dashboard/UserManagementPanel';
import CommunityModerationPanel from '@/components/admin/dashboard/CommunityModerationPanel';
import ResourceManagementPanel from '@/components/admin/dashboard/ResourceManagementPanel';
import NotificationsPanel from '@/components/admin/dashboard/NotificationsPanel';
import CrisisAlertsPanel from '@/components/admin/dashboard/CrisisAlertsPanel';
import SystemMonitoringPanel from '@/components/admin/dashboard/SystemMonitoringPanel';
import RecentActivityPanel from '@/components/admin/dashboard/RecentActivityPanel';
import QuickActionsPanel from '@/components/admin/dashboard/QuickActionsPanel';

interface CountById {
  _id: string;
  count: number;
}

interface DashboardStats {
  overview?: {
    totalUsers?: number;
    activeUsers?: number;
    totalPosts?: number;
    totalResources?: number;
    newUsersThisMonth?: number;
  };
  alerts?: {
    flaggedPosts?: number;
    pendingBookings?: number;
  };
  breakdown?: {
    usersByRole?: CountById[];
    chatSafetyMetrics?: CountById[];
  };
}

interface SystemHealth {
  apiServer: {
    status: string;
    uptime: number;
    memory: {
      heapUsed: number;
      heapTotal: number;
    };
  };
  database: {
    connected: boolean;
  };
  aiService: {
    status: string;
  };
  analyticsService: {
    status: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivities, setRecentActivities] = useState<AdminActivity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [resourcesByCategory, setResourcesByCategory] = useState<CountById[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dashData, healthData, notifData, activityData, inactiveData, allResources] = await Promise.allSettled([
        adminAPI.getDashboardStats(),
        adminAPI.getSystemHealth(),
        notificationsAPI.getNotifications(1, 8),
        adminAPI.getRecentActivity(12),
        adminAPI.getUsers({ status: 'inactive', limit: 1 }),
        resourcesAPI.getAllResources({ limit: 200 }),
      ]);

      if (dashData.status === 'fulfilled') setStats(dashData.value?.data);
      if (healthData.status === 'fulfilled') setHealth(healthData.value?.data);
      if (notifData.status === 'fulfilled') {
        const n = notifData.value?.data?.notifications ?? [];
        setNotifications(n);
        setUnreadCount(n.filter((notification) => !notification.read).length);
      }
      if (activityData.status === 'fulfilled') {
        setRecentActivities(activityData.value?.data?.activities ?? []);
      }
      if (inactiveData.status === 'fulfilled') setInactiveCount(inactiveData.value?.data?.total ?? 0);
      if (allResources.status === 'fulfilled') {
        const resources: Resource[] = allResources.value?.data?.resources ?? [];
        const typeMap: Record<string, number> = {};
        resources.forEach((resource) => { typeMap[resource.type] = (typeMap[resource.type] ?? 0) + 1; });
        setResourcesByCategory(Object.entries(typeMap).map(([_id, count]) => ({ _id, count })));
      }
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadAll();
  }, [isHydrated, loadAll, router, user]);

  if (!isHydrated || !user) return null;

  const overview = stats?.overview ?? {};
  const alerts   = stats?.alerts   ?? {};
  const breakdown = stats?.breakdown ?? {};

  const currentDate = new Date();
  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(currentDate);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}</div>
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-xl" />)}</div>
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-xl" />)}</div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-64 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-purple-600"
            title="Notifications"
          >
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-bold leading-none text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <time
            dateTime={currentDate.toISOString()}
            className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm"
          >
            <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-gray-700">{today}</span>
          </time>
        </div>
      </div>

      {/* Row 1 — Stat Cards */}
      <StatCards
        totalUsers={overview.totalUsers ?? 0}
        activeUsers={overview.activeUsers ?? 0}
        totalPosts={overview.totalPosts ?? 0}
        totalResources={overview.totalResources ?? 0}
        newUsersThisMonth={overview.newUsersThisMonth ?? 0}
      />

      {/* Row 2 — Management panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <UserManagementPanel
          usersByRole={breakdown.usersByRole ?? []}
          totalUsers={overview.totalUsers ?? 0}
          inactiveCount={inactiveCount}
        />
        <CommunityModerationPanel
          flaggedPosts={alerts.flaggedPosts ?? 0}
          totalPosts={overview.totalPosts ?? 0}
          pendingBookings={alerts.pendingBookings ?? 0}
        />
        <ResourceManagementPanel
          totalResources={overview.totalResources ?? 0}
          resourcesByCategory={resourcesByCategory}
        />
      </div>

      {/* Row 3 — Monitoring panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <NotificationsPanel notifications={notifications} unreadCount={unreadCount} />
        <CrisisAlertsPanel chatSafetyMetrics={breakdown.chatSafetyMetrics ?? []} />
        <SystemMonitoringPanel health={health} />
      </div>

      {/* Row 4 — Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentActivityPanel activities={recentActivities} />
        </div>
        <QuickActionsPanel />
      </div>
    </div>
  );
}
