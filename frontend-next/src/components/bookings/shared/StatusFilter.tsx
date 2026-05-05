// Status Filter Pills Component
interface StatusFilterProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  counts?: Record<string, number>;
}

const statuses = [
  { value: 'all', label: 'All', icon: '✨' },
  { value: 'pending', label: 'Pending', icon: '⏳', color: 'amber' },
  { value: 'confirmed', label: 'Confirmed', icon: '✅', color: 'green' },
  { value: 'completed', label: 'Completed', icon: '🎉', color: 'blue' },
  { value: 'cancelled', label: 'Cancelled', icon: '❌', color: 'red' },
];

export function StatusFilter({ currentStatus, onStatusChange, counts }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => {
        const isActive = currentStatus === status.value;
        const count = counts?.[status.value];

        return (
          <button
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
              ${isActive 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25' 
                : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600'
              }
            `}
          >
            <span>{status.icon}</span>
            <span>{status.label}</span>
            {count !== undefined && (
              <span className={`
                px-2 py-0.5 rounded-full text-xs
                ${isActive ? 'bg-white/20' : 'bg-gray-100'}
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
