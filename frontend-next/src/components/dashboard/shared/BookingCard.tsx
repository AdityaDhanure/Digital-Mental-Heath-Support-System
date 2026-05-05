// Dashboard shared components - BookingCard
import { CalendarIcon } from '@heroicons/react/24/outline';

interface BookingCardProps {
  booking: any;
  userRole?: string;
  compact?: boolean;
}

const statusConfig = {
  confirmed: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'bg-green-500' },
  pending: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'bg-amber-500' },
  completed: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'bg-blue-500' },
  cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'bg-red-500' },
};

export function BookingCard({ booking, userRole, compact = false }: BookingCardProps) {
  const isCounselor = userRole === 'counselor';
  const styles = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
  const person = isCounselor ? booking.student : booking.counselor;

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border-2 ${styles.border} ${styles.bg} hover:shadow-md transition-all`}>
      <div className={`p-2.5 rounded-lg ${styles.icon}`}>
        <CalendarIcon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-semibold text-gray-900 text-sm">
            {person?.name || (isCounselor ? 'Student' : 'Counselor')}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.bg} ${styles.text}`}>
            {booking.status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <span>📅 {new Date(booking.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span>🕐 {booking.appointmentTime?.start}</span>
          <span className="capitalize">{booking.mode === 'online' ? '💻 Online' : '🏢 In-person'}</span>
        </div>
        {!compact && (
          <p className="text-xs text-gray-500 mt-1">
            {isCounselor 
              ? `Student ID: ${booking.student?.studentId || 'N/A'}`
              : booking.counselor?.specialization?.[0] || 'General Counseling'}
          </p>
        )}
      </div>
    </div>
  );
}
