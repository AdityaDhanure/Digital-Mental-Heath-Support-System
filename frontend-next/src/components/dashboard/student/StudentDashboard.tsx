'use client';

// Student Dashboard Page
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { bookingAPI } from '@/lib/api/booking';
import { communityAPI } from '@/lib/api/community';
import {
  StatCard,
  WelcomeHeader,
  BookingCard,
  WellnessTip,
  SectionHeader,
  EmptyState,
} from '@/components/dashboard/shared';
import MoodTrackerFloat from '@/components/mood/MoodTrackerFloat';
import {
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  BookOpenIcon,
  UsersIcon,
  HeartIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ upcoming: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [upcomingRes, pendingRes, completedRes, postsRes] = await Promise.all([
        bookingAPI.getAllBookings({ status: 'confirmed', limit: 3 }),
        bookingAPI.getAllBookings({ status: 'pending', limit: 5 }),
        bookingAPI.getAllBookings({ status: 'completed', limit: 10 }),
        communityAPI.getAllPosts({ limit: 3 }).catch(() => ({ data: { data: { posts: [] } } })),
      ]);

      setUpcomingBookings(upcomingRes?.data?.bookings || []);
      setRecentPosts(postsRes?.data?.data?.posts?.slice(0, 3) || []);
      setStats({
        upcoming: upcomingRes?.data?.total || 0,
        pending: pendingRes?.data?.total || 0,
        completed: completedRes?.data?.total || 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const wellnessTips = [
    { title: 'Deep Breathing', content: 'Take 5 minutes for deep breathing. Inhale 4 counts, hold 4, exhale 4.', emoji: '🧘' },
    { title: 'Stay Hydrated', content: 'Drink at least 8 glasses of water today. Hydration affects mood!', emoji: '💧' },
    { title: 'Gratitude Practice', content: 'Write down 3 things you are grateful for today.', emoji: '🙏' },
  ];

  const tip = wellnessTips[new Date().getDay() % wellnessTips.length];

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Header */}
      <WelcomeHeader userName={user?.name} userRole={user?.role} />

      {/* Mood Tracker */}
      <MoodTrackerFloat />

      {/* AI Chat FAB */}
      <Link href="/chat">
        <button className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
        </button>
      </Link>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={CalendarIcon}
          label="Upcoming"
          value={stats.upcoming}
          color="purple"
        />
        <StatCard
          icon={ClockIcon}
          label="Pending"
          value={stats.pending}
          color="amber"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Completed"
          value={stats.completed}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <SectionHeader title="Quick Actions" icon={SparklesIcon} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionCard
            icon={ChatBubbleLeftRightIcon}
            title="AI Chat"
            description="Talk to our AI support"
            href="/chat"
            gradient="from-blue-500 to-cyan-500"
            badge="24/7"
          />
          <QuickActionCard
            icon={CalendarIcon}
            title="Book Session"
            description="Meet a counselor"
            href="/bookings"
            gradient="from-purple-500 to-pink-500"
            badge="Professional"
          />
          <QuickActionCard
            icon={BookOpenIcon}
            title="Resources"
            description="Mental health articles"
            href="/resources"
            gradient="from-green-500 to-emerald-500"
            badge="Guides"
          />
          <QuickActionCard
            icon={UsersIcon}
            title="Community"
            description="Share & support"
            href="/community"
            gradient="from-orange-500 to-amber-500"
            badge="Support"
          />
        </div>
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
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} userRole={user?.role} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarIcon}
            title="No Upcoming Sessions"
            description="Book a session with our professional counselors to start your wellness journey."
            actionText="Book Now"
            actionHref="/bookings"
          />
        )}
      </div>

      {/* Daily Wellness Tip */}
      <WellnessTip
        title={`Today's Tip: ${tip.title}`}
        content={tip.content}
        emoji={tip.emoji}
      />

      {/* Recent Community Posts */}
      <div>
        <SectionHeader
          title="Community Feed"
          icon={UsersIcon}
          actionText="View All"
          actionHref="/community"
        />
        {recentPosts.length > 0 ? (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link key={post._id} href={`/community/${post._id}`}>
                <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.category === 'anxiety' ? 'bg-red-50 text-red-600' :
                      post.category === 'depression' ? 'bg-purple-50 text-purple-600' :
                      post.category === 'academic-stress' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {post.category?.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{post.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>{post.replies?.length || 0} replies</span>
                    <span className="flex items-center gap-1">
                      {post.upvotes?.length || 0} support
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UsersIcon}
            title="No Posts Yet"
            description="Be the first to share in the community!"
            actionText="Create Post"
            actionHref="/community"
          />
        )}
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ icon: Icon, title, description, href, gradient, badge }: any) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all group">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-medium text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-500 mb-2">{description}</p>
        {badge && (
          <span className="inline-block text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}
