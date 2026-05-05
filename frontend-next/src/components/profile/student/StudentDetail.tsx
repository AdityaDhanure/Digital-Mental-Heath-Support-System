'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/common/Card';
import { ArrowLeftIcon, ChatBubbleLeftRightIcon, CalendarIcon, EnvelopeIcon, PhoneIcon, UserIcon, BookOpenIcon, HeartIcon } from '@heroicons/react/24/outline';
import { usersAPI } from '@/lib/api/users';
import { bookingAPI } from '@/lib/api/booking';
import { motion } from 'framer-motion';

interface StudentProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  role: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  studentProfile?: {
    studentId?: string;
    department?: string;
    year?: string;
    semester?: string;
  };
  moodHistory?: Array<{
    mood: string;
    score: number;
    timestamp: string;
  }>;
}

interface SessionStatsData {
  total: number;
  completed: number;
  upcoming: number;
  pending: number;
  cancelled: number;
}

interface ChatStats {
  totalSessions: number;
  totalMessages: number;
  lastSession: string;
  averageSentiment?: string;
}

const moodEmojis: Record<string, string> = {
  'happy': '😊',
  'good': '🙂',
  'neutral': '😐',
  'sad': '😢',
  'anxious': '😰',
  'stressed': '😫',
  'depressed': '😔'
};

function StatsCard({ icon: Icon, value, label, color }: { icon: any; value: number; label: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'from-green-400 to-emerald-500',
    blue: 'from-blue-400 to-cyan-500',
    yellow: 'from-yellow-400 to-amber-500',
    red: 'from-red-400 to-rose-500'
  };
  
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className={`w-12 h-12 bg-gradient-to-r ${colors[color]} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function StudentDetail({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStatsData | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'chat'>('overview');

  useEffect(() => {
    loadStudentProfile();
  }, [studentId]);

  const loadStudentProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await usersAPI.getStudentDetails(studentId);
      const studentData = response?.data?.student || response?.data;
      
      if (studentData) {
        setStudent(studentData);
        
        try {
          const statsResponse = await bookingAPI.getStudentSessionHistory(studentId);
          setSessionStats(statsResponse.data?.stats);
          setRecentBookings(statsResponse.data?.bookings || []);
        } catch {
          // Stats not critical
        }
      } else {
        setError('Student not found');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The student profile could not be loaded.'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Go Back
            </button>
            <button
              onClick={loadStudentProfile}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-8 py-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-xl border-4 border-white/30">
              {student.name?.charAt(0)}
            </div>
            <div className="flex-1 text-white">
              <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
              <p className="text-blue-100">
                {student.studentProfile?.department 
                  ? `${student.studentProfile.department} • ${student.studentProfile.year} Year`
                  : 'Student'}
              </p>
              {student.studentProfile?.studentId && (
                <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-lg text-sm">
                  ID: {student.studentProfile.studentId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sessions', label: 'Sessions' },
              { id: 'chat', label: 'Chat History' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Stats */}
              {sessionStats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard icon={CalendarIcon} value={sessionStats.completed} label="Completed" color="green" />
                  <StatsCard icon={CalendarIcon} value={sessionStats.upcoming} label="Upcoming" color="blue" />
                  <StatsCard icon={CalendarIcon} value={sessionStats.pending} label="Pending" color="yellow" />
                  <StatsCard icon={CalendarIcon} value={sessionStats.cancelled} label="Cancelled" color="red" />
                </div>
              )}

              {/* Contact */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{student.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              {student.studentProfile && (
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpenIcon className="h-5 w-5 text-gray-500" />
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {student.studentProfile.department && (
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="font-semibold text-gray-900">{student.studentProfile.department}</p>
                      </div>
                    )}
                    {student.studentProfile.year && (
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-500">Year</p>
                        <p className="font-semibold text-gray-900">{student.studentProfile.year}</p>
                      </div>
                    )}
                    {student.studentProfile.studentId && (
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-500">Student ID</p>
                        <p className="font-semibold text-gray-900">{student.studentProfile.studentId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mood History */}
              {student.moodHistory && student.moodHistory.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <HeartIcon className="h-5 w-5 text-pink-500" />
                    Recent Mood
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {student.moodHistory.slice(0, 7).map((entry, index) => (
                      <div key={index} className="flex-shrink-0 bg-white rounded-xl p-3 text-center min-w-[70px] shadow-sm">
                        <p className="text-2xl mb-1">{moodEmojis[entry.mood?.toLowerCase()] || '😐'}</p>
                        <p className="text-xs text-gray-500">{entry.score}/10</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Session History</h3>
              {recentBookings.length > 0 ? (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking._id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <CalendarIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.reason || 'Session'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.scheduledAt).toLocaleDateString()} at {booking.timeSlot}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No session history found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">AI Companion Conversations</p>
                    <p className="text-sm text-gray-500">View student's AI chat history</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/chat?student=${studentId}`)}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  View Chat History
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
