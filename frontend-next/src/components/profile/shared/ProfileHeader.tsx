import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface ProfileHeaderProps {
  name: string;
  role: string;
  isEmailVerified?: boolean;
  avatarUrl?: string;
  rating?: number;
  totalRatings?: number;
  experience?: number;
  isGradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function ProfileHeader({
  name,
  role,
  isEmailVerified,
  rating,
  totalRatings,
  experience,
  isGradient = false,
  gradientFrom = 'from-purple-600',
  gradientTo = 'to-pink-600'
}: ProfileHeaderProps) {
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = (rating || 0) % 1 >= 0.5;

  const content = (
    <div className="flex items-start gap-6">
      <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-5xl font-bold text-white ring-4 ring-white/30">
        {name?.charAt(0) || 'U'}
      </div>
      {isEmailVerified && (
        <div className="absolute top-2 right-2 bg-green-500 p-2 rounded-full">
          <CheckBadgeIcon className="h-5 w-5 text-white" />
        </div>
      )}

      <div className="flex-1 text-white">
        <h2 className="text-3xl font-bold mb-1">{name}</h2>
        <p className="text-purple-100 mb-3 capitalize">{role}</p>

        {rating !== undefined && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <StarSolidIcon
                  key={i}
                  className={`h-5 w-5 ${
                    i < fullStars
                      ? 'text-yellow-400'
                      : i === fullStars && hasHalfStar
                      ? 'text-yellow-400'
                      : 'text-white/30'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span className="text-purple-100">({totalRatings || 0} reviews)</span>
          </div>
        )}

        {experience !== undefined && (
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{experience}+</p>
              <p className="text-xs text-purple-200">Years Exp.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isGradient) {
    return (
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-8 relative`}>
        {content}
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 rounded-2xl">
      {content}
    </div>
  );
}
