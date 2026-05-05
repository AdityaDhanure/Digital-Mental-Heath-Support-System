import { ResourcesHeader, ResourceGrid } from '@/components/resources/shared';
import { Resource } from '@/types/resource.types';
import { useState, useEffect } from 'react';
import { resourcesAPI } from '@/lib/api/resources';
import toast from 'react-hot-toast';

interface StudentResourcesProps {
  onResourceClick?: (resource: Resource) => void;
}

const categories = [
  { value: 'all', label: 'All', icon: '✨' },
  { value: 'stress', label: 'Stress', icon: '💪' },
  { value: 'anxiety', label: 'Anxiety', icon: '🧘' },
  { value: 'depression', label: 'Depression', icon: '💙' },
  { value: 'sleep', label: 'Sleep', icon: '😴' },
  { value: 'mindfulness', label: 'Mindfulness', icon: '🌸' },
  { value: 'academic-pressure', label: 'Academic', icon: '📚' },
  { value: 'relationships', label: 'Relationships', icon: '💝' },
];

const types = [
  { value: 'all', label: 'All Types' },
  { value: 'video', label: '🎥 Video' },
  { value: 'article', label: '📄 Article' },
  { value: 'audio', label: '🎵 Audio' },
  { value: 'exercise', label: '🧘 Exercise' },
  { value: 'pdf', label: '📕 PDF' },
  { value: 'guide', label: '📖 Guide' },
  { value: 'infographic', label: '📊 Infographic' },
];

export default function StudentResources({ onResourceClick }: StudentResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadResources();
  }, [selectedCategory]);

  const loadResources = async () => {
    try {
      setLoading(true);
      let response;
      if (selectedCategory !== 'all') {
        response = await resourcesAPI.getResourcesByCategory(selectedCategory);
      } else {
        response = await resourcesAPI.getAllResources();
      }
      const resourceData = response?.data?.resources || response?.data || [];
      setResources(Array.isArray(resourceData) ? resourceData : []);
    } catch (error) {
      toast.error('Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = selectedType === 'all'
    ? resources
    : resources.filter(r => r.type === selectedType);

  return (
    <div className="space-y-6">
      <ResourcesHeader role="student" resourceCount={resources.length} />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer hover:border-purple-400 transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer hover:border-purple-400 transition-colors"
          >
            {types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="ml-auto">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{filteredResources.length}</span> resources found
          </p>
        </div>
      </div>

      <ResourceGrid 
        resources={filteredResources} 
        loading={loading}
        emptyMessage="Try adjusting your filters or check back later"
      />
    </div>
  );
}
