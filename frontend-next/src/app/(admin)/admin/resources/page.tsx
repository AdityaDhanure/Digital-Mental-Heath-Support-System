'use client';

import { useState, useEffect } from 'react';
import { resourcesAPI } from '@/lib/api/resources';
import Link from 'next/link';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  MusicalNoteIcon,
  QueueListIcon,
  PencilSquareIcon,
  ChartBarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'depression', label: 'Depression' },
  { value: 'stress', label: 'Stress' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'academic-pressure', label: 'Academic Pressure' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'therapy', label: 'Therapy' },
  { value: 'coping-strategies', label: 'Coping Strategies' },
  { value: 'self-care', label: 'Self Care' },
  { value: 'crisis-management', label: 'Crisis Management' },
  { value: 'general-wellness', label: 'General Wellness' },
];

const types = [
  { value: 'all', label: 'All Types' },
  { value: 'article', label: 'Articles' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'exercise', label: 'Exercises' },
  { value: 'guide', label: 'Guides' },
  { value: 'infographic', label: 'Infographics' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'published', label: 'Published' },
  { value: 'unpublished', label: 'Unpublished' },
];

export default function AdminResourcesPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadResources();
  }, [isHydrated, user, categoryFilter, typeFilter, statusFilter, page]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const data = await resourcesAPI.getAdminAllResources(params);
      setResources(data?.data?.resources || []);
      setTotalPages(data?.data?.totalPages || 1);
      setTotal(data?.data?.total || 0);
    } catch (error) {
      console.error('Failed to load resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadResources();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await resourcesAPI.deleteResource(id);
      toast.success('Resource deleted successfully');
      loadResources();
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  const handlePublish = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await resourcesAPI.updateResource(id, { isPublished: false });
        toast.success('Resource unpublished');
      } else {
        await resourcesAPI.publishResource(id);
        toast.success('Resource published');
      }
      loadResources();
    } catch (error) {
      toast.error('Failed to update resource status');
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      video: PlayCircleIcon,
      audio: MusicalNoteIcon,
      pdf: DocumentTextIcon,
      guide: BookOpenIcon,
      infographic: ChartBarIcon,
      exercise: PencilSquareIcon,
      article: DocumentTextIcon,
    };
    const Icon = icons[type] || DocumentTextIcon;
    return <Icon className="h-5 w-5" />;
  };

  if (!isHydrated || !user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-600 mt-1">Manage all platform resources</p>
        </div>
        <Link
          href="/resources/add"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Resource
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-[250px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </form>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {types.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{total}</span> resources found
          </p>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or add a new resource</p>
          <Link
            href="/resources/add"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Resource
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div className="relative h-40 bg-gradient-to-br from-purple-100 to-pink-100">
                {resource.content?.thumbnailUrl ? (
                  <img
                    src={resource.content.thumbnailUrl}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-purple-300">
                      {getTypeIcon(resource.type)}
                      <span className="text-4xl ml-2">{resource.type}</span>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    resource.isPublished
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {resource.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Type Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-white/90 rounded-full text-xs font-medium flex items-center gap-1">
                    {getTypeIcon(resource.type)}
                    {resource.type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{resource.description}</p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="capitalize">{resource.category?.replace('-', ' ')}</span>
                  <span className="capitalize">{resource.language}</span>
                  {resource.verified && (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckBadgeIcon className="h-4 w-4" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Author */}
                {resource.uploadedBy && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <UserIcon className="h-4 w-4" />
                    <span>{resource.uploadedBy.name || 'Unknown'}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4" />
                    {resource.metrics?.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4" />
                    {resource.metrics?.likes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <QueueListIcon className="h-4 w-4" />
                    {resource.metrics?.downloads || 0}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <Link
                    href={`/resources/edit/${resource._id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handlePublish(resource._id, resource.isPublished)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      resource.isPublished
                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {resource.isPublished ? (
                      <>
                        <EyeSlashIcon className="h-4 w-4" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-4 w-4" />
                        Publish
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(resource._id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
