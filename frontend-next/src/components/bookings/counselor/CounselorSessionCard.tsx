// Session Card for Counselor View
import { CalendarIcon, ClockIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline';

interface SessionCardProps {
  booking: any;
  onConfirm?: () => void;
  onDecline?: () => void;
  onReschedule?: () => void;
  onMarkComplete?: () => void;
  onCancel?: () => void;
  onViewStudent?: () => void;
}

const statusConfig = {
  pending: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', label: 'Pending Approval' },
  confirmed: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', label: 'Confirmed' },
  completed: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', label: 'Completed' },
  cancelled: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', label: 'Cancelled' },
};

export function CounselorSessionCard({ 
  booking, 
  onConfirm, 
  onDecline, 
  onReschedule,
  onMarkComplete,
  onCancel,
  onViewStudent 
}: SessionCardProps) {
  const styles = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className={`bg-white rounded-2xl border-2 ${styles.border} overflow-hidden hover:shadow-lg transition-all`}>
      {/* Header */}
      <div className={`${styles.bg} px-4 py-3 flex items-center justify-between`}>
        <button 
          onClick={onViewStudent}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
            {booking.student?.name?.charAt(0) || 'S'}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">{booking.student?.name || 'Student'}</p>
            <p className="text-xs text-gray-500">ID: {booking.student?.studentId || 'N/A'}</p>
          </div>
        </button>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
          {styles.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-purple-500" />
            <span className="text-gray-600">
              {new Date(booking.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ClockIcon className="h-4 w-4 text-purple-500" />
            <span className="text-gray-600">
              {booking.appointmentTime?.start} - {booking.appointmentTime?.end}
            </span>
          </div>
        </div>

        {/* Mode & Category */}
        <div className="flex flex-wrap gap-2 mb-4">
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

        {/* Student Notes */}
        {booking.studentNotes && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">Student's concern:</p>
            <p className="text-sm text-gray-700 line-clamp-2">{booking.studentNotes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          {/* Pending Actions */}
          {booking.status === 'pending' && (
            <>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
              >
                Confirm Session
              </button>
              <button
                onClick={onDecline}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Decline
              </button>
            </>
          )}

          {/* Confirmed Actions */}
          {booking.status === 'confirmed' && (
            <>
              <button
                onClick={onMarkComplete}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
              >
                Mark Complete
              </button>
              <button
                onClick={onReschedule}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Reschedule
              </button>
            </>
          )}

          {/* Cancel (for pending/confirmed) */}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          )}

          {/* View Student */}
          {onViewStudent && (
            <button
              onClick={onViewStudent}
              className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-xl text-sm font-medium transition-colors"
            >
              View Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
