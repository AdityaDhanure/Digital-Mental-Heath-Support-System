// Session Card Component for Student Bookings
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface SessionCardProps {
  booking: any;
  onReschedule?: () => void;
  onCancel?: () => void;
  onViewDetails?: () => void;
}

const statusConfig = {
  pending: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '⏳', label: 'Pending' },
  confirmed: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '✅', label: 'Confirmed' },
  completed: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '🎉', label: 'Completed' },
  cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '❌', label: 'Cancelled' },
};

export function SessionCard({ booking, onReschedule, onCancel, onViewDetails }: SessionCardProps) {
  const styles = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className={`bg-white rounded-2xl border-2 ${styles.border} overflow-hidden hover:shadow-lg transition-all`}>
      {/* Header */}
      <div className={`${styles.bg} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">
              {booking.counselor?.name?.charAt(0) || 'C'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{booking.counselor?.name || 'Counselor'}</p>
            <p className="text-xs text-gray-500">{booking.counselor?.specialization?.[0] || 'General Counseling'}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.text}`}>
          <span>{styles.icon}</span>
          {styles.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 text-purple-500" />
            <span>{new Date(booking.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 text-purple-500" />
            <span>{booking.appointmentTime?.start} - {booking.appointmentTime?.end}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
            booking.mode === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {booking.mode === 'online' ? '💻 Online' : '🏢 In-person'}
          </span>
          {booking.concernCategory && (
            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium">
              {booking.concernCategory}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-200 transition-colors"
            >
              View Details
            </button>
          )}
          {(booking.status === 'pending' || booking.status === 'confirmed') && onReschedule && (
            <button
              onClick={onReschedule}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Reschedule
            </button>
          )}
          {booking.status !== 'completed' && booking.status !== 'cancelled' && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
