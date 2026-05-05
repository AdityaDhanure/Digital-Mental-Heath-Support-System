'use client';

// Redesigned Counselor Details Modal - matches new booking page style
import { useState, useEffect } from 'react';
import { Counselor } from '@/types/booking.types';
import { XMarkIcon, StarIcon, CalendarIcon, ClockIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { availabilityAPI } from '@/lib/api/availability';
import { format } from 'date-fns';

interface CounselorDetailsModalProps {
  counselor: Counselor;
  onClose: () => void;
  onBook: (counselor: Counselor) => void;
}

export default function CounselorDetailsModal({ counselor, onClose, onBook }: CounselorDetailsModalProps) {
  const [todaySlots, setTodaySlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchTodayAvailability = async () => {
      setIsLoadingSlots(true);
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const data = await availabilityAPI.getCounselorAvailability(counselor._id, today);
        setTodaySlots(data.slots || []);
      } catch (error) {
        console.error('Failed to fetch slots');
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchTodayAvailability();
  }, [counselor._id]);

  const rating = counselor.rating || 4.8;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
              {counselor.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{counselor.name}</h2>
              <p className="text-white/80 text-sm mt-1">Licensed Professional Counselor</p>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <StarSolidIcon
                    key={i}
                    className={`h-4 w-4 ${i < fullStars ? 'text-yellow-400 fill-yellow-400' : i === fullStars && hasHalfStar ? 'text-yellow-400 fill-yellow-400' : 'text-white/40'}`}
                  />
                ))}
                <span className="text-sm ml-1">{rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Specializations */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-lg">🎯</span> Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {counselor.specialization?.map((spec, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium border border-purple-100">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{counselor.experience || 5}+ Years</p>
              <p className="text-sm text-gray-500">Experience</p>
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <LanguageIcon className="h-5 w-5 text-purple-600" />
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {counselor.languagesKnown?.length ? (
                counselor.languagesKnown.map((lang, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                    {lang}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">English</span>
              )}
            </div>
          </div>

          {/* Today's Slots */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-purple-600" />
              Today&apos;s Available Slots
            </h3>
            {isLoadingSlots ? (
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 w-20 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : todaySlots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {todaySlots.slice(0, 6).map((slot, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100">
                    {slot.startTime}
                  </span>
                ))}
                {todaySlots.length > 6 && (
                  <span className="px-3 py-1.5 text-sm text-gray-500">
                    +{todaySlots.length - 6} more
                  </span>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-500">No slots available today</p>
              </div>
            )}
          </div>

          {/* Action */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => { onBook(counselor); onClose(); }}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              Book Session with {counselor.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
