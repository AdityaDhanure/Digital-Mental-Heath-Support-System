'use client';

import { XMarkIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, FaceSmileIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface UserChatAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  analysis: any;
  loading: boolean;
}

export default function UserChatAnalysisModal({ 
  isOpen, 
  onClose, 
  user, 
  analysis, 
  loading 
}: UserChatAnalysisModalProps) {
  if (!isOpen) return null;

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'bg-green-100 text-green-700 border-green-200',
      neutral: 'bg-gray-100 text-gray-700 border-gray-200',
      negative: 'bg-red-100 text-red-700 border-red-200',
      mixed: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[sentiment] || colors.neutral;
  };

  const getStressColor = (level: string) => {
    const colors: Record<string, string> = {
      none: 'bg-green-500',
      low: 'bg-green-400',
      moderate: 'bg-yellow-500',
      high: 'bg-orange-500',
      severe: 'bg-red-500',
    };
    return colors[level] || 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">User Chat Analysis</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">
                      {analysis.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{analysis.user?.name}</h3>
                    <p className="text-gray-600">{analysis.user?.email}</p>
                    <p className="text-sm text-gray-500">
                      Member since {new Date(analysis.user?.memberSince).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{analysis.summary?.totalSessions || 0}</p>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <DocumentTextIcon className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{analysis.summary?.totalMessages || 0}</p>
                  <p className="text-sm text-gray-600">Total Messages</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <FaceSmileIcon className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900 capitalize">{analysis.sentimentAnalysis?.dominant || 'neutral'}</p>
                  <p className="text-sm text-gray-600">Dominant Tone</p>
                </div>
                <div className={`rounded-lg p-4 text-center ${
                  analysis.summary?.highRiskSessions > 0 ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <ShieldExclamationIcon className={`h-6 w-6 mx-auto mb-2 ${
                    analysis.summary?.highRiskSessions > 0 ? 'text-red-500' : 'text-green-500'
                  }`} />
                  <p className="text-2xl font-bold text-gray-900">{analysis.summary?.highRiskSessions || 0}</p>
                  <p className="text-sm text-gray-600">High Risk Sessions</p>
                </div>
              </div>

              {/* Sentiment Distribution */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Sentiment Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(analysis.sentimentAnalysis?.distribution || {}).map(([sentiment, count]) => (
                    <div key={sentiment} className={`p-3 rounded-lg text-center ${getSentimentColor(sentiment)}`}>
                      <p className="text-xl font-bold">{count as number}</p>
                      <p className="text-xs capitalize">{sentiment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stress Analysis */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Stress Level Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(analysis.stressAnalysis?.distribution || {}).map(([level, count]) => (
                    <div key={level} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStressColor(level)}`}></div>
                      <span className="flex-1 text-sm capitalize">{level}</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Emotions */}
              {analysis.emotionAnalysis?.topEmotions?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Detected Emotions</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.emotionAnalysis.topEmotions.map((em: any, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {em.emotion} ({em.score.toFixed(1)})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Sessions */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Sessions</h3>
                <div className="space-y-2">
                  {analysis.sessions?.slice(0, 5).map((session: any) => (
                    <div key={session._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{session.title || 'Untitled Session'}</p>
                        <p className="text-sm text-gray-500">
                          {session.messageCount} messages • {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(session.sentiment)}`}>
                          {session.sentiment}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No analysis data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
