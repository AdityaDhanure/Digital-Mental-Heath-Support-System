'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api/admin';
import Link from 'next/link';
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  BookOpenIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
  ArrowRightIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadDashboard();
  }, [isHydrated, user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getDashboardStats();
      setStats(data?.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || !user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name}! Here's what's happening.</p>
        </div>
        <Link
          href="/admin/analytics"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <SparklesIcon className="h-5 w-5" />
          View Analytics
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded w-12 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Alert Banner */}
          {(stats?.alerts?.pendingBookings > 0 || stats?.alerts?.flaggedPosts > 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Action Required</p>
                  <p className="text-sm text-yellow-700">
                    {stats?.alerts?.pendingBookings > 0 && `${stats.alerts.pendingBookings} pending bookings`}
                    {stats?.alerts?.pendingBookings > 0 && stats?.alerts?.flaggedPosts > 0 && ' • '}
                    {stats?.alerts?.flaggedPosts > 0 && `${stats.alerts.flaggedPosts} flagged posts need review`}
                  </p>
                </div>
              </div>
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
              >
                Take Action
              </Link>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <UsersIcon className="h-6 w-6 text-purple-600" />
                </div>
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.overview?.totalUsers || 0}</p>
              <p className="text-xs text-green-600 mt-2">+{stats?.overview?.newUsersThisMonth || 0} this month</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.overview?.activeUsers || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                </div>
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mb-1">AI Chat Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.overview?.totalChats || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-100 rounded-xl">
                  <CalendarIcon className="h-6 w-6 text-pink-600" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stats?.alerts?.pendingBookings > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>
                  {stats?.alerts?.pendingBookings > 0 ? `${stats.alerts.pendingBookings} pending` : 'All clear'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Counseling Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.overview?.totalBookings || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Total bookings</p>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <BookOpenIcon className="h-8 w-8 text-white/80" />
                <ShieldCheckIcon className="h-6 w-6 text-white/80" />
              </div>
              <p className="text-white/80 text-sm mb-1">Published Resources</p>
              <p className="text-4xl font-bold mb-2">{stats?.overview?.totalResources || 0}</p>
              <Link href="/resources" className="text-sm text-white/90 hover:text-white flex items-center gap-1">
                View Resources <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <MegaphoneIcon className="h-8 w-8 text-white/80" />
                {stats?.alerts?.flaggedPosts > 0 && (
                  <span className="px-2 py-1 bg-red-500 rounded-full text-xs font-medium">
                    {stats.alerts.flaggedPosts} flagged
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm mb-1">Community Posts</p>
              <p className="text-4xl font-bold mb-2">{stats?.overview?.totalPosts || 0}</p>
              <Link href="/community" className="text-sm text-white/90 hover:text-white flex items-center gap-1">
                View Community <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/admin/users" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Manage Users</span>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </Link>
                <Link href="/resources/add" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <BookOpenIcon className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Add Resource</span>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </Link>
                <Link href="/admin/analytics" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <SparklesIcon className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">View Reports</span>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* User Distribution & Safety */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
              <div className="space-y-4">
                {stats?.breakdown?.usersByRole?.map((role: any) => (
                  <div key={role._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        role._id === 'student' ? 'bg-blue-100' :
                        role._id === 'counselor' ? 'bg-green-100' :
                        role._id === 'admin' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        {role._id === 'student' && <UsersIcon className="h-5 w-5 text-blue-600" />}
                        {role._id === 'counselor' && <ShieldCheckIcon className="h-5 w-5 text-green-600" />}
                        {role._id === 'admin' && <SparklesIcon className="h-5 w-5 text-purple-600" />}
                        {!['student', 'counselor', 'admin'].includes(role._id) && <UserGroupIcon className="h-5 w-5 text-gray-600" />}
                      </div>
                      <span className="font-medium text-gray-700 capitalize">{role._id || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            role._id === 'student' ? 'bg-blue-500' :
                            role._id === 'counselor' ? 'bg-green-500' :
                            role._id === 'admin' ? 'bg-purple-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${(role.count / stats.overview.totalUsers) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-900 w-8">{role.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Safety Overview</h3>
              <div className="space-y-3">
                {stats?.breakdown?.chatSafetyMetrics?.map((metric: any) => {
                  const colors: Record<string, { bg: string; text: string; label: string }> = {
                    low: { bg: 'bg-green-500', text: 'text-green-600', label: 'Low Risk' },
                    medium: { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Medium Risk' },
                    high: { bg: 'bg-orange-500', text: 'text-orange-600', label: 'High Risk' },
                    critical: { bg: 'bg-red-500', text: 'text-red-600', label: 'Critical' },
                  };
                  const style = colors[metric._id] || { bg: 'bg-gray-500', text: 'text-gray-600', label: 'Unknown' };
                  return (
                    <div key={metric._id || 'unknown'} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${style.bg}`}></div>
                        <span className="font-medium text-gray-700">{style.label}</span>
                      </div>
                      <span className={`font-bold ${style.text}`}>{metric.count}</span>
                    </div>
                  );
                })}
                {(!stats?.breakdown?.chatSafetyMetrics || stats.breakdown.chatSafetyMetrics.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No chat safety data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Status */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats?.breakdown?.bookingsByStatus?.map((status: any) => {
                const icons: Record<string, any> = {
                  completed: CheckCircleIcon,
                  confirmed: CalendarIcon,
                  pending: ClockIcon,
                  cancelled: ExclamationTriangleIcon,
                };
                const colors: Record<string, string> = {
                  completed: 'bg-green-50 border-green-200',
                  confirmed: 'bg-blue-50 border-blue-200',
                  pending: 'bg-yellow-50 border-yellow-200',
                  cancelled: 'bg-red-50 border-red-200',
                };
                const Icon = icons[status._id] || BellIcon;
                return (
                  <div key={status._id} className={`p-4 rounded-xl border ${colors[status._id] || 'bg-gray-50 border-gray-200'}`}>
                    <Icon className={`h-6 w-6 mb-2 ${
                      status._id === 'completed' ? 'text-green-600' :
                      status._id === 'confirmed' ? 'text-blue-600' :
                      status._id === 'pending' ? 'text-yellow-600' :
                      status._id === 'cancelled' ? 'text-red-600' : 'text-gray-600'
                    }`} />
                    <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                    <p className="text-sm text-gray-600 capitalize">{status._id || 'Unknown'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
