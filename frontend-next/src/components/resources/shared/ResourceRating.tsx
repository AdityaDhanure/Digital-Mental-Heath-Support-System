import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface ResourceRatingProps {
  averageRating: number;
  totalRatings: number;
  userRating: number;
  onRate: (rating: number) => void;
}

export default function ResourceRating({ averageRating, totalRatings, userRating, onRate }: ResourceRatingProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Rate this resource</h2>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRate(star)}
              className="transition-transform hover:scale-110"
            >
              {star <= (userRating) ? (
                <StarSolidIcon className="h-8 w-8 text-yellow-400" />
              ) : (
                <StarIcon className="h-8 w-8 text-gray-300" />
              )}
            </button>
          ))}
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">
            {averageRating.toFixed(1)} / 5.0
          </div>
          <div className="text-sm text-gray-500">{totalRatings} ratings</div>
        </div>
      </div>
    </div>
  );
}
