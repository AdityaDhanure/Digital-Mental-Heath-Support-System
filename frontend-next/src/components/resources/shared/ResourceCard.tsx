import { Resource } from '@/types/resource.types';
import { PlayCircleIcon, DocumentTextIcon, MusicalNoteIcon, CheckBadgeIcon, HeartIcon, EyeIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface ResourceCardProps {
  resource: Resource;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

export default function ResourceCard({ resource, showEditButton = false, showDeleteButton = false, onDelete }: ResourceCardProps) {
  const typeIcons: Record<string, any> = {
    video: PlayCircleIcon,
    article: DocumentTextIcon,
    audio: MusicalNoteIcon,
    pdf: DocumentTextIcon,
    exercise: PlayCircleIcon,
    guide: DocumentTextIcon,
    infographic: DocumentTextIcon,
  };

  const TypeIcon = typeIcons[resource.type] || DocumentTextIcon;

  const categoryColors: Record<string, string> = {
    stress: 'from-blue-400 to-blue-500',
    anxiety: 'from-purple-400 to-purple-500',
    depression: 'from-indigo-400 to-indigo-500',
    sleep: 'from-cyan-400 to-cyan-500',
    mindfulness: 'from-pink-400 to-pink-500',
    'academic-pressure': 'from-green-400 to-green-500',
    relationships: 'from-rose-400 to-rose-500',
    therapy: 'from-amber-400 to-amber-500',
    'coping-strategies': 'from-teal-400 to-teal-500',
    'self-care': 'from-violet-400 to-violet-500',
    'crisis-management': 'from-red-400 to-red-500',
    'general-wellness': 'from-gray-400 to-gray-500',
  };

  const categoryBg: Record<string, string> = {
    stress: 'bg-blue-50 text-blue-600',
    anxiety: 'bg-purple-50 text-purple-600',
    depression: 'bg-indigo-50 text-indigo-600',
    sleep: 'bg-cyan-50 text-cyan-600',
    mindfulness: 'bg-pink-50 text-pink-600',
    'academic-pressure': 'bg-green-50 text-green-600',
    relationships: 'bg-rose-50 text-rose-600',
    therapy: 'bg-amber-50 text-amber-600',
    'coping-strategies': 'bg-teal-50 text-teal-600',
    'self-care': 'bg-violet-50 text-violet-600',
    'crisis-management': 'bg-red-50 text-red-600',
    'general-wellness': 'bg-gray-50 text-gray-600',
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const gradientClass = categoryColors[resource.category] || 'from-gray-400 to-gray-500';

  return (
    <Link href={`/resources/${resource._id}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all group">
        <div className={`relative h-40 bg-gradient-to-br ${gradientClass} overflow-hidden`}>
          {resource.content?.thumbnailUrl ? (
            <img 
              src={resource.content.thumbnailUrl} 
              alt={resource.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <TypeIcon className="h-16 w-16 text-white/80" />
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 capitalize flex items-center gap-1.5 shadow-sm">
              <TypeIcon className="h-3.5 w-3.5" />
              {resource.type}
            </span>
          </div>

          {resource.verified && (
            <div className="absolute top-3 right-3">
              <div className="bg-green-500 text-white p-1.5 rounded-full shadow-sm">
                <CheckBadgeIcon className="h-4 w-4" />
              </div>
            </div>
          )}

          {resource.content?.duration && (
            <div className="absolute bottom-3 right-3">
              <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white rounded text-xs font-medium flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                {Math.floor(resource.content.duration / 60)}:{String(resource.content.duration % 60).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-bold text-gray-900 text-base line-clamp-2 group-hover:text-purple-600 transition-colors">
            {resource.title}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-2">
            {resource.description}
          </p>

          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${categoryBg[resource.category] || 'bg-gray-50 text-gray-600'}`}>
              {resource.category?.replace(/-/g, ' ')}
            </span>
            {resource.difficulty && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded capitalize">
                {resource.difficulty}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <EyeIcon className="h-4 w-4" />
                {formatNumber(resource.metrics?.views || 0)}
              </span>
              <span className="flex items-center gap-1">
                <HeartIcon className="h-4 w-4" />
                {formatNumber(resource.metrics?.likes || 0)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <StarSolidIcon className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-900">
                {resource.metrics?.averageRating?.toFixed(1) || '0.0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
