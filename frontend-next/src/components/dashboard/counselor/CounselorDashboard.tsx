'use client';

// Counselor Dashboard Page
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { bookingAPI } from '@/lib/api/booking';
import type { Booking } from '@/types/booking.types';
import {
  StatCard,
  WelcomeHeader,
  BookingCard,
  SectionHeader,
  EmptyState,
} from '@/components/dashboard/shared';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  BookOpenIcon,
  DocumentTextIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

export default function CounselorDashboard() {
  const { user } = useAuthStore();
  const hasLoadedRef = useRef(false);
  const [bookings, setBookings] = useState<{ upcoming: Booking[]; pending: Booking[]; recent: Booking[] }>({
    upcoming: [],
    pending: [],
    recent: [],
  });
  const [stats, setStats] = useState({ upcoming: 0, pending: 0, completed: 0, students: 0 });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getAllBookings({ limit: 100 });
      const allBookings: Booking[] = response?.data?.bookings || [];
      const upcomingBookings = allBookings
        .filter((booking) => booking.status === 'confirmed')
        .slice(0, 5);
      const pendingBookings = allBookings
        .filter((booking) => booking.status === 'pending')
        .slice(0, 5);
      const completedBookings = allBookings
        .filter((booking) => booking.status === 'completed');
      const uniqueStudentIds = new Set(
        allBookings
          .map((booking) => booking.student?._id)
          .filter(Boolean)
      );

      setBookings({
        upcoming: upcomingBookings,
        pending: pendingBookings,
        recent: completedBookings.slice(0, 5),
      });
      
      setStats({
        upcoming: allBookings.filter((booking) => booking.status === 'confirmed').length,
        pending: allBookings.filter((booking) => booking.status === 'pending').length,
        completed: completedBookings.length,
        students: uniqueStudentIds.size,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Header */}
      <WelcomeHeader userName={user?.name} userRole={user?.role} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={CalendarIcon}
          label="Today's Sessions"
          value={stats.upcoming}
          color="purple"
          trend="Confirmed"
        />
        <StatCard
          icon={ClockIcon}
          label="Pending"
          value={stats.pending}
          color="amber"
          trend="Awaiting review"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Completed"
          value={stats.completed}
          color="green"
          trend="All time"
        />
        <StatCard
          icon={UserGroupIcon}
          label="Students"
          value={stats.students}
          color="blue"
          trend="This week"
        />
      </div>

      {/* Pending Requests */}
      <div>
        <SectionHeader
          title="Pending Requests"
          icon={ClockIcon}
          actionText={stats.pending > 0 ? `${stats.pending} pending` : undefined}
          actionHref="/bookings"
        />
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : bookings.pending.length > 0 ? (
          <div className="space-y-3">
            {bookings.pending.map((booking) => (
              <BookingCard key={booking._id} booking={booking} userRole={user?.role} />
            ))}
          </div>
        ) : (
          <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-green-700 font-medium">All caught up!</p>
            <p className="text-sm text-green-600">No pending requests</p>
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      <div>
        <SectionHeader
          title="Upcoming Sessions"
          icon={CalendarIcon}
          actionText="View All"
          actionHref="/bookings"
        />
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : bookings.upcoming.length > 0 ? (
          <div className="space-y-3">
            {bookings.upcoming.map((booking) => (
              <BookingCard key={booking._id} booking={booking} userRole={user?.role} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarIcon}
            title="No Upcoming Sessions"
            description="Your schedule is clear. Students will appear here when they book sessions."
          />
        )}
      </div>

      {/* Quick Links */}
      <div>
        <SectionHeader title="Quick Access" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickLinkCard
            icon={UserGroupIcon}
            title="My Students"
            description="View student profiles"
            href="/dashboard/students"
          />
          <QuickLinkCard
            icon={BookOpenIcon}
            title="Resources"
            description="Manage & upload"
            href="/resources"
          />
          <QuickLinkCard
            icon={DocumentTextIcon}
            title="Community"
            description="View discussions"
            href="/community"
          />
          <QuickLinkCard
            icon={BellIcon}
            title="Notifications"
            description="View all alerts"
            href="/notifications"
          />
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <SectionHeader
          title="Recent Sessions"
          icon={CheckCircleIcon}
          subtitle="Last completed sessions"
        />
        {bookings.recent.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Mode</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.recent.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {booking.student?.name?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{booking.student?.name || 'Student'}</p>
                          <p className="text-xs text-gray-500">{booking.student?.studentProfile?.studentId || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(booking.appointmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.mode === 'online' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {booking.mode === 'online' ? '💻 Online' : '🏢 In-person'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600">
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
            <p className="text-gray-500">No recent sessions</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Quick Link Card Component
interface QuickLinkCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}

function QuickLinkCard({ icon: Icon, title, description, href }: QuickLinkCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all group">
        <Icon className="h-6 w-6 text-purple-500 mb-2" />
        <h3 className="font-medium text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
