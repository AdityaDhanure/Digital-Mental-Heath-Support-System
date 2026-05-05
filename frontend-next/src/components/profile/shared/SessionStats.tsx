import { CheckCircleIcon, CalendarIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface SessionStatsProps {
  completed: number;
  upcoming: number;
  pending: number;
  cancelled: number;
}

export default function SessionStats({ completed, upcoming, pending, cancelled }: SessionStatsProps) {
  const stats = [
    { label: 'Completed', value: completed, color: 'green', icon: CheckCircleIcon },
    { label: 'Upcoming', value: upcoming, color: 'blue', icon: CalendarIcon },
    { label: 'Pending', value: pending, color: 'yellow', icon: ClockIcon },
    { label: 'Cancelled', value: cancelled, color: 'red', icon: XCircleIcon },
  ];

  const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'text-yellow-500' },
    red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon }) => {
        const colors = colorClasses[label.toLowerCase() as keyof typeof colorClasses];
        return (
          <div key={label} className={`${colors.bg} rounded-xl p-4 text-center`}>
            <Icon className={`h-8 w-8 ${colors.icon} mx-auto mb-2`} />
            <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
            <p className={`text-xs ${colors.text}`}>{label}</p>
          </div>
        );
      })}
    </div>
  );
}
