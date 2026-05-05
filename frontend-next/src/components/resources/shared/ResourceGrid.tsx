import { Resource } from '@/types/resource.types';
import ResourceCard from './ResourceCard';
import { BookmarkIcon } from '@heroicons/react/24/outline';

interface ResourceGridProps {
  resources: Resource[];
  loading: boolean;
  emptyMessage?: string;
  showEditButtons?: boolean;
  onDelete?: () => void;
}

export default function ResourceGrid({ resources, loading, emptyMessage = 'No resources found', showEditButtons = false, onDelete }: ResourceGridProps) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
            <div className="h-40 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <BookmarkIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Resources Found</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard 
          key={resource._id} 
          resource={resource}
          showEditButton={showEditButtons}
          showDeleteButton={showEditButtons}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
