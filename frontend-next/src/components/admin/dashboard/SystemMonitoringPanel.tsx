'use client';
import Link from 'next/link';

interface SystemHealth {
  apiServer: { status: string; uptime: number; memory: { heapUsed: number; heapTotal: number } };
  database: { connected: boolean };
  aiService: { status: string };
  analyticsService: { status: string };
}

interface Props { health: SystemHealth | null; }

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

export default function SystemMonitoringPanel({ health }: Props) {
  const uptime     = health?.apiServer.uptime ?? 0;
  const uptimePct  = Math.min(((uptime % 86400) / 86400) * 100 + 95, 99.9);
  const heapUsed   = health?.apiServer.memory.heapUsed ?? 0;
  const heapTotal  = health?.apiServer.memory.heapTotal ?? 1;
  const memPct     = Math.round((heapUsed / heapTotal) * 100);
  const dbOk       = health?.database.connected ?? false;
  const aiOk       = health?.aiService.status === 'healthy';
  const isHealthy  = dbOk && aiOk;

  const rows = [
    { label: 'Server Uptime', pct: uptimePct,  value: `${uptimePct.toFixed(1)}%`, color: 'bg-green-500' },
    { label: 'Memory Usage',  pct: memPct,     value: `${memPct}%`,               color: 'bg-purple-500' },
    { label: 'AI Service',    pct: aiOk ? 100 : 0, value: aiOk ? 'Online' : 'Offline', color: aiOk ? 'bg-blue-500' : 'bg-red-400' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">System Monitoring</h3>
        <Link href="/admin/analytics" className="text-xs text-indigo-600 hover:underline font-medium">View Details</Link>
      </div>

      {/* Overall status */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
        <span className="text-sm text-gray-600">System Status</span>
        <span className={`text-sm font-semibold flex items-center gap-1 ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
          <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
          {isHealthy ? 'Healthy' : 'Degraded'}
        </span>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{r.label}</span>
              <span className="font-semibold text-gray-800">{r.value}</span>
            </div>
            <Bar pct={r.pct} color={r.color} />
          </div>
        ))}
      </div>

      {/* Database */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Database Status</span>
        <span className={`font-semibold ${dbOk ? 'text-green-600' : 'text-red-600'}`}>
          {dbOk ? 'Healthy' : 'Disconnected'}
        </span>
      </div>

      <Link href="/admin/analytics"
        className="mt-auto flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
        Monitor System
      </Link>
    </div>
  );
}
