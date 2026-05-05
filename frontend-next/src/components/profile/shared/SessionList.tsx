import { CalendarIcon } from '@heroicons/react/24/outline';

interface Booking {
  _id: string;
  reason?: string;
  scheduledAt: string;
  timeSlot?: string;
  status: string;
}

interface SessionListProps {
  bookings: Booking[];
}

const statusColors: Record<string, string> = {
  'completed': 'bg-green-100 text-green-700',
  'confirmed': 'bg-blue-100 text-blue-700',
  'pending': 'bg-yellow-100 text-yellow-700',
  'cancelled': 'bg-red-100 text-red-700',
};

export default function SessionList({ bookings }: SessionListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No session history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <div key={booking._id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{booking.reason || 'Session'}</p>
              <p className="text-sm text-gray-500">
                {new Date(booking.scheduledAt).toLocaleDateString()} at {booking.timeSlot}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[booking.status] || 'bg-gray-100 text-gray-700'}`}>
            {booking.status}
          </span>
        </div>
      ))}
    </div>
  );
}
