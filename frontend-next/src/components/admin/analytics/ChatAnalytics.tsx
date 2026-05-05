'use client';

interface ChatAnalyticsProps {
  chatAnalytics: any;
}

export default function ChatAnalytics({ chatAnalytics }: ChatAnalyticsProps) {
  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return colors[risk] || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat Safety Overview</h2>
      <div className="space-y-3">
        {chatAnalytics?.riskDistribution?.map((risk: any) => (
          <div key={risk._id || 'unknown'} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getRiskColor(risk._id)}`}></div>
              <span className="font-medium text-gray-700 capitalize">{risk._id || 'Unknown'}</span>
            </div>
            <span className="font-bold text-gray-900">{risk.count}</span>
          </div>
        ))}
        {(!chatAnalytics?.riskDistribution || chatAnalytics.riskDistribution.length === 0) && (
          <p className="text-gray-500 text-center py-4">No data available</p>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">High Risk Sessions</span>
          <span className="font-bold text-red-600">{chatAnalytics?.highRiskCount || 0}</span>
        </div>
      </div>
    </div>
  );
}
