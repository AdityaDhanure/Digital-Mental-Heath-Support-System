// Bookings Page Header Component
import { CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface BookingsHeaderProps {
  role: string;
  counselorCount?: number;
}

export function BookingsHeader({ role, counselorCount = 0 }: BookingsHeaderProps) {
  const isCounselor = role === 'counselor';

  return (
    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
          <CalendarIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isCounselor ? 'My Sessions' : 'Book Counseling'}
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            {isCounselor 
              ? 'Manage your sessions and connect with students'
              : 'Connect with verified counselors who understand student life'}
          </p>
        </div>
      </div>
      
      {!isCounselor && (
        <div className="flex gap-6 mt-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <p className="text-2xl font-bold">{counselorCount}+</p>
            <p className="text-xs text-white/70">Counselors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-white/70">Categories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-white/70">Languages</p>
          </div>
        </div>
      )}
    </div>
  );
}
