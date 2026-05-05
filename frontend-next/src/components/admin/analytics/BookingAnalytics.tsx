'use client';

import {
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface BookingAnalyticsProps {
  bookingAnalytics: any;
}

export default function BookingAnalytics({ bookingAnalytics }: BookingAnalyticsProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      confirmed: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h2>
      <div className="space-y-3">
        {bookingAnalytics?.statusDistribution?.map((status: any) => (
          <div key={status._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {status._id === 'completed' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
              {status._id === 'pending' && <ClockIcon className="h-5 w-5 text-yellow-500" />}
              {status._id === 'confirmed' && <CalendarIcon className="h-5 w-5 text-blue-500" />}
              {status._id === 'cancelled' && <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />}
              <span className="font-medium text-gray-700 capitalize">{status._id}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status._id)}`}>
              {status.count}
            </span>
          </div>
        ))}
        {(!bookingAnalytics?.statusDistribution || bookingAnalytics.statusDistribution.length === 0) && (
          <p className="text-gray-500 text-center py-4">No data available</p>
        )}
      </div>
    </div>
  );
}
