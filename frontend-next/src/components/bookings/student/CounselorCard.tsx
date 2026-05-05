// Counselor Card for Student View
import { StarIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface CounselorCardProps {
  counselor: any;
  onViewDetails: () => void;
  onBookNow: () => void;
}

export function CounselorCard({ counselor, onViewDetails, onBookNow }: CounselorCardProps) {
  const specializations = counselor.specialization?.slice(0, 2) || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-purple-200 transition-all">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
          {counselor.name?.charAt(0) || 'C'}
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">{counselor.name}</h3>
        <p className="text-sm text-purple-600 font-medium">{counselor.title || 'Counselor'}</p>
        
        {/* Rating */}
        <div className="flex items-center justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-sm text-gray-500 ml-1">(4.8)</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Specializations */}
        <div className="flex flex-wrap gap-2 mb-4">
          {specializations.map((spec: string, idx: number) => (
            <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
              {spec}
            </span>
          ))}
          {(counselor.specialization?.length || 0) > 2 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{(counselor.specialization?.length || 0) - 2} more
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{counselor.totalSessions || 0} sessions</span>
          </div>
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${counselor.isAvailable ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}
          `}>
            {counselor.isAvailable ? 'Available' : 'Busy'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={onBookNow}
            disabled={!counselor.isAvailable}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
