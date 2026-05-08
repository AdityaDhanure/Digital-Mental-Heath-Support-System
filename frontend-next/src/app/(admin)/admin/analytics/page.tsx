'use client';
import BackButton from '@/components/common/BackButton';

import { useCallback, useState, useEffect } from 'react';
import {
  adminAPI,
  type BookingAnalyticsData,
  type ChatAnalyticsData,
  type CommunityAnalyticsData,
  type DashboardStatsData,
  type DateBucket,
  type UserForAnalysis,
} from '@/lib/api/admin';
import {
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ShieldExclamationIcon,
  DocumentChartBarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon as ExclamationTriangleIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { usePersistentState } from '@/lib/hooks/usePersistentState';
import { useRouter } from 'next/navigation';
import {
  OverviewStats,
  ChatAnalytics,
  BookingAnalytics,
  CommunityOverview,
  UserChatAnalysisModal,
  ReportModal,
  UserSelectorModal,
} from '@/components/admin/analytics';

const periodOptions = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

const tabOptions = [
  { id: 'overview', label: 'Overview', icon: ArrowTrendingUpIcon },
  { id: 'chats', label: 'Chat Analysis', icon: ChatBubbleLeftRightIcon },
  { id: 'sentiment', label: 'Sentiment & Tone', icon: HeartIcon },
  { id: 'risk', label: 'Risk Assessment', icon: ShieldExclamationIcon },
];

type AnalyticsTab = (typeof tabOptions)[number]['id'];

interface UserChatAnalysisData {
  user?: {
    _id: string;
    name: string;
    email: string;
    memberSince?: string;
    lastActive?: string;
  };
  summary?: {
    totalSessions?: number;
    totalMessages?: number;
    averageMessagesPerSession?: number;
    highRiskSessions?: number;
    dominantSentiment?: string;
    period?: string;
  };
  sentimentAnalysis?: {
    distribution?: Record<string, number>;
    dominant?: string;
  };
  stressAnalysis?: {
    distribution?: Record<string, number>;
    trend?: Array<{ level: string; count: number }>;
  };
  riskAnalysis?: {
    distribution?: Record<string, number>;
    highRiskCount?: number;
  };
  emotionAnalysis?: {
    topEmotions?: Array<{ emotion: string; score: number }>;
  };
  sessions?: Array<{
    _id: string;
    title?: string;
    messageCount: number;
    sentiment: string;
    stressLevel: string;
    riskLevel: string;
    createdAt: string;
  }>;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const response = (error as { response?: { data?: { message?: string } } }).response;
  return response?.data?.message || fallback;
};

const isValidPeriod = (value: unknown): value is string => {
  return typeof value === 'string' && periodOptions.some((option) => option.value === value);
};

const isValidTab = (value: unknown): value is AnalyticsTab => {
  return typeof value === 'string' && tabOptions.some((option) => option.id === value);
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = usePersistentState('mindsage:admin-analytics:period', '30', {
    validate: isValidPeriod,
  });
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [chatAnalytics, setChatAnalytics] = useState<ChatAnalyticsData | null>(null);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalyticsData | null>(null);
  const [communityAnalytics, setCommunityAnalytics] = useState<CommunityAnalyticsData | null>(null);
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserForAnalysis | null>(null);
  const [userChatAnalysis, setUserChatAnalysis] = useState<UserChatAnalysisData | null>(null);
  const [userAnalysisLoading, setUserAnalysisLoading] = useState(false);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('comprehensive');
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [users, setUsers] = useState<UserForAnalysis[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  
  const [activeTab, setActiveTab] = usePersistentState<AnalyticsTab>('mindsage:admin-analytics:tab', 'overview', {
    validate: isValidTab,
  });

  const getPeriodDates = (p: string) => {
    const days = parseInt(p) || 30;
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  const periodLabel = periodOptions.find(o => o.value === period)?.label ?? 'Last 30 days';
  const chatVolumeTrend = chatAnalytics?.chatVolumeTrend ?? [];
  const sentimentDistribution = chatAnalytics?.sentimentDistribution ?? [];
  const riskDistribution = chatAnalytics?.riskDistribution ?? [];
  const highRiskCount = chatAnalytics?.highRiskCount ?? 0;

  const loadAllAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getPeriodDates(period);
      const [statsRes, chatRes, bookingRes, communityRes] = await Promise.all([
        adminAPI.getDashboardStats({ startDate, endDate }),
        adminAPI.getChatAnalytics(period),
        adminAPI.getBookingAnalytics(period),
        adminAPI.getCommunityAnalytics(period),
      ]);
      
      setStats(statsRes?.data);
      setChatAnalytics(chatRes?.data);
      setBookingAnalytics(bookingRes?.data);
      setCommunityAnalytics(communityRes?.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(getErrorMessage(err, 'Failed to load analytics'));
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadAllAnalytics();
  }, [isHydrated, loadAllAnalytics, router, user]);

  const loadUsers = async (search: string = '') => {
    setUsersLoading(true);
    try {
      const data = await adminAPI.getAllUsersForAnalysis({ search, limit: 20 });
      setUsers(data?.data?.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSelectUser = (selectedUser: UserForAnalysis) => {
    setSelectedUser(selectedUser);
    setShowUserSelector(false);
    setShowUserModal(true);
    loadUserChatAnalysis(selectedUser._id);
  };

  const loadUserChatAnalysis = async (userId: string) => {
    setUserAnalysisLoading(true);
    try {
      const data = await adminAPI.getUserChatAnalysis(userId, period);
      setUserChatAnalysis(data?.data);
    } catch {
      toast.error('Failed to load user chat analysis');
    } finally {
      setUserAnalysisLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const { startDate, endDate } = getPeriodDates(period);
      await adminAPI.downloadReport(reportType, startDate, endDate);
      toast.success('Report downloaded successfully!');
      setShowReportModal(false);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (!isHydrated || !user) return null;

  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ExclamationTriangleIconSolid className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform insights for <span className="font-semibold text-purple-600">{periodLabel}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => { setShowUserSelector(true); loadUsers(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <EyeIcon className="h-5 w-5" />
            Analyze User Chat
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <DocumentChartBarIcon className="h-5 w-5" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabOptions.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-10 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <ExclamationTriangleIconSolid className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAllAnalytics}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Showing data for <span className="font-semibold text-gray-700">{periodLabel}</span></p>
              </div>
              <OverviewStats stats={stats} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChatAnalytics chatAnalytics={chatAnalytics} />
                <BookingAnalytics bookingAnalytics={bookingAnalytics} />
              </div>
              <CommunityOverview stats={stats} communityAnalytics={communityAnalytics} />
            </>
          )}

          {/* Chat Analysis Tab */}
          {activeTab === 'chats' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Chat Volume Trend</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{periodLabel}</span>
                </div>
                {chatVolumeTrend.length > 0 ? (
                  <div className="h-56 flex items-end gap-1 pt-8 pb-6 relative">
                    {chatVolumeTrend.slice(-14).map((day: DateBucket, idx: number) => {
                      const count = Number(day.count) || 0;
                      const maxCount = Math.max(...chatVolumeTrend.map((d) => Number(d.count) || 0), 1);
                      const height = Math.max((count / maxCount) * 100, count > 0 ? 4 : 0);
                      const date = new Date(day._id.year, day._id.month - 1, day._id.day);
                      return (
                        <div key={idx} className="flex-1 h-full min-w-0 flex items-end justify-center group relative">
                          <div className="absolute bottom-6 mb-1 hidden group-hover:flex flex-col items-center z-10">
                            <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {count} chat{count !== 1 ? 's' : ''}
                            </div>
                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
                          </div>
                          <div
                            className="w-full max-w-8 bg-purple-400 hover:bg-purple-600 rounded-t transition-all cursor-pointer"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-[10px] text-gray-400 absolute -bottom-5 truncate w-full text-center">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No chat data for this period</div>
                )}
              </div>

              {/* Sentiment Distribution */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sentimentDistribution.map((sent) => {
                    const total = sentimentDistribution.reduce((sum, s) => sum + s.count, 0);
                    const percentage = total > 0 ? ((sent.count / total) * 100).toFixed(1) : '0';
                    return (
                      <div key={sent._id} className={`p-4 rounded-lg border ${
                        sent._id === 'positive' ? 'bg-green-50 border-green-200' :
                        sent._id === 'negative' ? 'bg-red-50 border-red-200' :
                        sent._id === 'mixed' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <p className="text-2xl font-bold">{percentage}%</p>
                        <p className="text-sm font-medium capitalize">{sent._id || 'Unknown'}</p>
                        <p className="text-xs opacity-75">{sent.count} sessions</p>
                      </div>
                    );
                  })}
                  {sentimentDistribution.length === 0 && (
                    <p className="col-span-4 text-gray-500 text-center py-4">No sentiment data available</p>
                  )}
                </div>
              </div>

              {highRiskCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <ExclamationTriangleIconSolid className="h-8 w-8 text-red-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-900">High Risk Sessions Detected</h3>
                      <p className="text-red-700 mt-1">
                        {highRiskCount} session(s) flagged with high or critical risk levels.
                        These may require counselor intervention.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sentiment & Tone Tab */}
          {activeTab === 'sentiment' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Overall Sentiment Analysis</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{periodLabel}</span>
                </div>
                <div className="space-y-4">
                  {sentimentDistribution.map((sent) => {
                    const total = sentimentDistribution.reduce((sum, s) => sum + s.count, 0);
                    const percentage = total > 0 ? (sent.count / total) * 100 : 0;
                    return (
                      <div key={sent._id} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium capitalize">{sent._id}</div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                sent._id === 'positive' ? 'bg-green-500' :
                                sent._id === 'negative' ? 'bg-red-500' :
                                sent._id === 'mixed' ? 'bg-yellow-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-24 text-right">
                          <span className="font-bold">{sent.count}</span>
                          <span className="text-gray-500 text-sm ml-1">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tone Analysis Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <span className="text-3xl">😊</span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {sentimentDistribution.find((s) => s._id === 'positive')?.count || 0}
                    </p>
                    <p className="text-sm text-gray-600">Positive Tone Sessions</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <span className="text-3xl">😐</span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {sentimentDistribution.find((s) => s._id === 'neutral')?.count || 0}
                    </p>
                    <p className="text-sm text-gray-600">Neutral Tone Sessions</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <span className="text-3xl">😔</span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {sentimentDistribution.find((s) => s._id === 'negative')?.count || 0}
                    </p>
                    <p className="text-sm text-gray-600">Negative Tone Sessions</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Assessment Tab */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['low', 'medium', 'high', 'critical'].map((level) => {
                    const riskData = riskDistribution.find((r) => r._id === level);
                    return (
                      <div
                        key={level}
                        className={`rounded-xl p-4 border ${
                          level === 'critical' ? 'bg-red-100 border-red-300' :
                          level === 'high' ? 'bg-orange-100 border-orange-300' :
                          level === 'medium' ? 'bg-yellow-100 border-yellow-300' :
                          'bg-green-100 border-green-300'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full mb-2 ${
                          level === 'critical' ? 'bg-red-500' :
                          level === 'high' ? 'bg-orange-500' :
                          level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <p className="text-2xl font-bold text-gray-900">{riskData?.count || 0}</p>
                        <p className="text-sm font-medium capitalize text-gray-700">{level} Risk</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {highRiskCount > 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <ShieldExclamationIcon className="h-10 w-10 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-red-900">
                        {highRiskCount} High Risk Session(s) Require Attention
                      </h3>
                      <p className="text-red-700 mt-2">
                        These sessions have been flagged with elevated emotional risk scores.
                        Consider reviewing for potential counselor referrals.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600">
                  <strong>Privacy Notice:</strong> All chat analysis is performed using anonymized, aggregated data.
                  Individual user conversations remain confidential.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <UserChatAnalysisModal
        isOpen={showUserModal}
        onClose={() => { setShowUserModal(false); setSelectedUser(null); setUserChatAnalysis(null); }}
        user={selectedUser}
        analysis={userChatAnalysis}
        loading={userAnalysisLoading}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType={reportType}
        setReportType={setReportType}
        onGenerate={handleGenerateReport}
        generating={generatingReport}
      />

      <UserSelectorModal
        isOpen={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        users={users}
        loading={usersLoading}
        search={userSearch}
        onSearchChange={(search) => { setUserSearch(search); loadUsers(search); }}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
}
