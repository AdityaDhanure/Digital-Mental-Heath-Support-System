interface ProfileStatsProps {
  sessions?: number;
  completed?: number;
  upcoming?: number;
  pending?: number;
  showSessionStats?: boolean;
}

export default function ProfileStats({ sessions, completed, upcoming, pending, showSessionStats = false }: ProfileStatsProps) {
  if (!showSessionStats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="text-center">
        <p className="text-2xl font-bold text-purple-600">{sessions || 0}</p>
        <p className="text-xs text-gray-500">Total Sessions</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">{completed || 0}</p>
        <p className="text-xs text-gray-500">Completed</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">{upcoming || 0}</p>
        <p className="text-xs text-gray-500">Upcoming</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-yellow-600">{pending || 0}</p>
        <p className="text-xs text-gray-500">Pending</p>
      </div>
    </div>
  );
}
