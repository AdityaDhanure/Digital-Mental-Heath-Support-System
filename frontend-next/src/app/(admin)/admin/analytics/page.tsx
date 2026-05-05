'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api/admin';
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

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');
  const [stats, setStats] = useState<any>(null);
  const [chatAnalytics, setChatAnalytics] = useState<any>(null);
  const [bookingAnalytics, setBookingAnalytics] = useState<any>(null);
  const [communityAnalytics, setCommunityAnalytics] = useState<any>(null);
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userChatAnalysis, setUserChatAnalysis] = useState<any>(null);
  const [userAnalysisLoading, setUserAnalysisLoading] = useState(false);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('comprehensive');
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadAllAnalytics();
  }, [isHydrated, user, period]);

  const loadAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, chatRes, bookingRes, communityRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getChatAnalytics(period),
        adminAPI.getBookingAnalytics(period),
        adminAPI.getCommunityAnalytics(period),
      ]);
      
      setStats(statsRes?.data);
      setChatAnalytics(chatRes?.data);
      setBookingAnalytics(bookingRes?.data);
      setCommunityAnalytics(communityRes?.data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSelectUser = (selectedUser: any) => {
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
      await adminAPI.downloadReport(reportType);
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform insights, chat analysis & reports</p>
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
          {[
            { id: 'overview', label: 'Overview', icon: ArrowTrendingUpIcon },
            { id: 'chats', label: 'Chat Analysis', icon: ChatBubbleLeftRightIcon },
            { id: 'sentiment', label: 'Sentiment & Tone', icon: HeartIcon },
            { id: 'risk', label: 'Risk Assessment', icon: ShieldExclamationIcon },
          ].map((tab) => (
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat Volume Trend</h2>
                <div className="h-64 flex items-end gap-1">
                  {chatAnalytics?.chatVolumeTrend?.slice(-14).map((day: any, idx: number) => {
                    const maxCount = Math.max(...chatAnalytics.chatVolumeTrend.map((d: any) => d.count), 1);
                    const height = (day.count / maxCount) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition-colors"
                          style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                          title={`${day.count} chats`}
                        />
                        <span className="text-xs text-gray-500 rotate-45 origin-top-left mt-2">
                          {new Date(day._id.year, day._id.month - 1, day._id.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {(!chatAnalytics?.chatVolumeTrend || chatAnalytics.chatVolumeTrend.length === 0) && (
                  <p className="text-gray-500 text-center py-8">No chat data available for this period</p>
                )}
              </div>

              {/* Sentiment Distribution */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {chatAnalytics?.sentimentDistribution?.map((sent: any) => {
                    const total = chatAnalytics.sentimentDistribution.reduce((sum: number, s: any) => sum + s.count, 0);
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
                  {(!chatAnalytics?.sentimentDistribution || chatAnalytics.sentimentDistribution.length === 0) && (
                    <p className="col-span-4 text-gray-500 text-center py-4">No sentiment data available</p>
                  )}
                </div>
              </div>

              {chatAnalytics?.highRiskCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <ExclamationTriangleIconSolid className="h-8 w-8 text-red-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-900">High Risk Sessions Detected</h3>
                      <p className="text-red-700 mt-1">
                        {chatAnalytics.highRiskCount} session(s) flagged with high or critical risk levels.
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Sentiment Analysis</h2>
                <div className="space-y-4">
                  {chatAnalytics?.sentimentDistribution?.map((sent: any) => {
                    const total = chatAnalytics.sentimentDistribution.reduce((sum: number, s: any) => sum + s.count, 0);
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
                      {chatAnalytics?.sentimentDistribution?.find((s: any) => s._id === 'positive')?.count || 0}
                    </p>
                    <p className="text-sm text-gray-600">Positive Tone Sessions</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <span className="text-3xl">😐</span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {chatAnalytics?.sentimentDistribution?.find((s: any) => s._id === 'neutral')?.count || 0}
                    </p>
                    <p className="text-sm text-gray-600">Neutral Tone Sessions</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <span className="text-3xl">😔</span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {chatAnalytics?.sentimentDistribution?.find((s: any) => s._id === 'negative')?.count || 0}
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
                    const riskData = chatAnalytics?.riskDistribution?.find((r: any) => r._id === level);
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

              {chatAnalytics?.highRiskCount > 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <ShieldExclamationIcon className="h-10 w-10 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-red-900">
                        {chatAnalytics.highRiskCount} High Risk Session(s) Require Attention
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
