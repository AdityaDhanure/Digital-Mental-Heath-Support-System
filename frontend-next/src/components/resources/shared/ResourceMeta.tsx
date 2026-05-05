import { Resource } from '@/types/resource.types';
import { UserIcon } from '@heroicons/react/24/outline';

interface ResourceMetaProps {
  resource: Resource;
}

export default function ResourceMeta({ resource }: ResourceMetaProps) {
  const hasAuthor = resource.author?.name;
  const hasTags = resource.tags && resource.tags.length > 0;
  const hasSource = resource.externalSource?.url;

  if (!hasAuthor && !hasTags && !hasSource) return null;

  return (
    <div className="space-y-4">
      {hasAuthor && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-purple-500" />
            Author
          </h2>
          <p className="font-semibold text-gray-900">{resource.author?.name}</p>
          {resource.author?.credentials && (
            <p className="text-sm text-gray-600 mt-0.5">{resource.author?.credentials}</p>
          )}
          {resource.author?.organization && (
            <p className="text-sm text-gray-500">{resource.author?.organization}</p>
          )}
        </div>
      )}

      {hasTags && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-xl">#</span>
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasSource && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Source</h2>
          <a
            href={resource.externalSource?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium text-sm"
          >
            ↗ {resource.externalSource?.name || 'View original source'}
          </a>
        </div>
      )}
    </div>
  );
}
