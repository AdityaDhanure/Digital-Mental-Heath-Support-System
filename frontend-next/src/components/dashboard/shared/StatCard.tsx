// Dashboard shared components - StatCard
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color?: 'purple' | 'blue' | 'green' | 'amber' | 'red';
}

const colorMap = {
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', icon: 'bg-purple-500' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', icon: 'bg-blue-500' },
  green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', icon: 'bg-green-500' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', icon: 'bg-amber-500' },
  red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200', icon: 'bg-red-500' },
};

export function StatCard({ icon: Icon, label, value, trend, trendUp, color = 'purple' }: StatCardProps) {
  const styles = colorMap[color];
  
  return (
    <div className={`bg-white rounded-2xl p-5 border ${styles.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-4">
        <div className={`${styles.icon} p-3 rounded-xl`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-gray-500'}`}>
              {trendUp && '↑ '}{trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
