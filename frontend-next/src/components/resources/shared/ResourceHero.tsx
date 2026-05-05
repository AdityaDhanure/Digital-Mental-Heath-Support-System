import { Resource } from '@/types/resource.types';
import { HeartIcon, ShareIcon, EyeIcon, ClockIcon, CheckBadgeIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const categoryGradients: Record<string, string> = {
  anxiety:            'from-purple-600 via-purple-500 to-violet-500',
  depression:         'from-indigo-700 via-indigo-600 to-blue-600',
  stress:             'from-blue-600 via-blue-500 to-cyan-500',
  sleep:              'from-cyan-600 via-teal-500 to-emerald-500',
  mindfulness:        'from-pink-600 via-rose-500 to-orange-400',
  'academic-pressure': 'from-green-600 via-emerald-500 to-teal-500',
  relationships:      'from-rose-600 via-rose-500 to-pink-500',
  therapy:            'from-amber-600 via-orange-500 to-yellow-400',
  'coping-strategies': 'from-teal-600 via-cyan-500 to-sky-500',
  'self-care':        'from-violet-600 via-purple-500 to-fuchsia-500',
  'crisis-management': 'from-red-700 via-red-600 to-rose-500',
  'general-wellness': 'from-gray-600 via-slate-500 to-gray-500',
};

const typeIcons: Record<string, any> = {
  video:       EyeIcon,
  audio:       EyeIcon,
  article:     EyeIcon,
  pdf:         EyeIcon,
  exercise:    EyeIcon,
  guide:       EyeIcon,
  infographic: EyeIcon,
};

interface ResourceHeroProps {
  resource: Resource;
  isLiked: boolean;
  onLike: () => void;
  onShare: () => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ResourceHero({ resource, isLiked, onLike, onShare }: ResourceHeroProps) {
  const gradient = categoryGradients[resource.category] || 'from-gray-700 via-gray-600 to-gray-500';
  const TypeIcon = typeIcons[resource.type] || EyeIcon;

  return (
    <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl overflow-hidden shadow-xl`}>
      {resource.content?.thumbnailUrl && (
        <img
          src={resource.content.thumbnailUrl}
          alt={resource.title}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      )}

      <div className="relative z-10 p-8 md:p-12">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold capitalize">
            <TypeIcon className="h-4 w-4" />
            {resource.type}
          </span>
          <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium capitalize">
            {resource.category?.replace(/-/g, ' ')}
          </span>
          {resource.difficulty && (
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm capitalize">
              {resource.difficulty}
            </span>
          )}
          {resource.verified && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500/80 text-white rounded-full text-sm font-medium">
              <CheckBadgeIcon className="h-4 w-4" />
              Verified
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
          {resource.title}
        </h1>
        <p className="text-white/80 text-lg leading-relaxed max-w-2xl">
          {resource.description}
        </p>

        <div className="flex flex-wrap items-center gap-5 mt-6 text-white/70 text-sm">
          <span className="flex items-center gap-1.5">
            <EyeIcon className="h-4 w-4" />
            {resource.metrics.views?.toLocaleString() || 0} views
          </span>
          {resource.content?.duration && (
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4" />
              {formatDuration(resource.content.duration)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <StarSolidIcon className="h-4 w-4 text-yellow-300" />
            {(resource.metrics.averageRating || 0).toFixed(1)} ({resource.metrics.totalRatings || 0})
          </span>
          <span className="capitalize">📖 {resource.language}</span>
        </div>

        <div className="flex items-center gap-3 mt-7">
          <button
            onClick={onLike}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
            }`}
          >
            {isLiked ? <HeartSolidIcon className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
            {resource.metrics.likes || 0}
          </button>
          <button
            onClick={onShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all font-semibold text-sm"
          >
            <ShareIcon className="h-5 w-5" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
