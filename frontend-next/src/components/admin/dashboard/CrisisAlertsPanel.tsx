'use client';
import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SafetyMetric { _id: string; count: number; }
interface Props { chatSafetyMetrics: SafetyMetric[]; }

export default function CrisisAlertsPanel({ chatSafetyMetrics }: Props) {
  const get = (level: string) => chatSafetyMetrics.find(m => m._id === level)?.count ?? 0;

  const high     = get('critical');
  const medium   = get('high');
  const monitor  = get('medium');
  const total    = high + medium + monitor;

  const recentAlerts = [
    { label: 'High Risk session detected',   risk: 'High',   riskColor: 'bg-red-100 text-red-700',    time: '10 min ago' },
    { label: 'Medium Risk session flagged',  risk: 'Medium', riskColor: 'bg-orange-100 text-orange-700', time: '1 hr ago' },
    { label: 'High Risk session detected',   risk: 'High',   riskColor: 'bg-red-100 text-red-700',    time: '2 hrs ago' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Crisis Alerts</h3>
        <Link href="/admin/analytics" className="text-xs text-indigo-600 hover:underline font-medium">View All</Link>
      </div>

      {/* Priority counts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
          <p className="text-xs text-red-600 font-medium mb-1">High Priority</p>
          <p className="text-3xl font-bold text-red-600">{high}</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
          <p className="text-xs text-orange-600 font-medium mb-1">Medium Priority</p>
          <p className="text-3xl font-bold text-orange-500">{medium}</p>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">Total Active Alerts</span>
        </div>
        <span className="text-xl font-bold text-gray-900">{total}</span>
      </div>

      {/* Recent */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent Alerts</p>
        <div className="space-y-2">
          {recentAlerts.map((a, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 truncate max-w-[130px]">{a.label}</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${a.riskColor}`}>{a.risk}</span>
              <span className="text-gray-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      <Link href="/admin/analytics"
        className="mt-auto flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
        View All Alerts
      </Link>
    </div>
  );
}
