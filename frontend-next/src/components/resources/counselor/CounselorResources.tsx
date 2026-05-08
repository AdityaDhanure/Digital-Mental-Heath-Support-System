'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { resourcesAPI } from '@/lib/api/resources';
import { usePersistentState } from '@/lib/hooks/usePersistentState';
import { ResourcesHeader, ResourceGrid } from '@/components/resources/shared';
import { Resource } from '@/types/resource.types';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/solid';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

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

export default function CounselorResources() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = usePersistentState<'all' | 'my-uploads'>('mindsage:counselor-resources:view', 'all');
  const [selectedCategory, setSelectedCategory] = usePersistentState('mindsage:counselor-resources:category', 'all');

  useEffect(() => {
    resourcesAPI.fixUnpublishedResources()
      .then((result: any) => {
        if (result?.data?.modifiedCount > 0) {
          toast.success(`${result.data.modifiedCount} resources published`);
          loadResources();
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadResources();
  }, [viewMode, selectedCategory]);

  const loadResources = async () => {
    try {
      setLoading(true);
      let response;
      if (viewMode === 'my-uploads') {
        const params: any = {};
        if (selectedCategory !== 'all') params.category = selectedCategory;
        response = await resourcesAPI.getMyResources(params);
      } else if (selectedCategory !== 'all') {
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

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await resourcesAPI.deleteResource(resourceId);
      toast.success('Resource deleted');
      loadResources();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <ResourcesHeader role="counselor" resourceCount={resources.length} />

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'all'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Resources
          </button>
          <button
            onClick={() => setViewMode('my-uploads')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'my-uploads'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Uploads
          </button>
        </div>

        {viewMode === 'all' && (
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
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
        )}

        <div className="ml-auto">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{resources.length}</span> resources
          </p>
        </div>
      </div>

      <ResourceGrid 
        resources={resources} 
        loading={loading}
        showEditButtons={viewMode === 'my-uploads'}
        onDelete={loadResources}
        emptyMessage={
          viewMode === 'my-uploads' 
            ? 'Start by creating your first resource' 
            : 'No resources found'
        }
      />

      <button
        onClick={() => router.push('/resources/add')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-110 transition-all z-50"
        title="Add New Resource"
      >
        <PlusIcon className="h-7 w-7" />
      </button>
    </div>
  );
}
