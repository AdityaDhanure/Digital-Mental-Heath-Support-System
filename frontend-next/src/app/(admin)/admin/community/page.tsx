'use client';

import { useState, useEffect } from 'react';
import { communityAPI } from '@/lib/api/community';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  FlagIcon,
  UserIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { FlagIcon as FlagIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'general-support', label: 'General Support' },
  { value: 'academic-stress', label: 'Academic Stress' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'depression', label: 'Depression' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'self-care', label: 'Self Care' },
  { value: 'success-stories', label: 'Success Stories' },
  { value: 'resources', label: 'Resources' },
  { value: 'questions', label: 'Questions' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'removed', label: 'Removed' },
];

export default function AdminCommunityPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadPosts();
  }, [isHydrated, user, categoryFilter, statusFilter, flaggedOnly, page]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (flaggedOnly) params.flagged = 'true';
      if (search) params.search = search;

      const data = await communityAPI.getAdminAllPosts(params);
      setPosts(data?.data?.posts || []);
      setTotalPages(data?.data?.totalPages || 1);
      setTotal(data?.data?.total || 0);
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await communityAPI.deletePost(id);
      toast.success('Post deleted successfully');
      loadPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleModerate = async (id: string, approved: boolean) => {
    try {
      await communityAPI.moderatePost(id, approved);
      toast.success(approved ? 'Post approved' : 'Post removed');
      setShowModal(false);
      setSelectedPost(null);
      loadPosts();
    } catch (error) {
      toast.error('Failed to moderate post');
    }
  };

  const openPostModal = async (post: any) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      'general-support': 'bg-blue-100 text-blue-700',
      'academic-stress': 'bg-yellow-100 text-yellow-700',
      'anxiety': 'bg-red-100 text-red-700',
      'depression': 'bg-purple-100 text-purple-700',
      'relationships': 'bg-pink-100 text-pink-700',
      'self-care': 'bg-green-100 text-green-700',
      'success-stories': 'bg-emerald-100 text-emerald-700',
      'resources': 'bg-cyan-100 text-cyan-700',
      'questions': 'bg-orange-100 text-orange-700',
      'other': 'bg-gray-100 text-gray-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  if (!isHydrated || !user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Management</h1>
          <p className="text-gray-600 mt-1">Manage all community posts and content</p>
        </div>
        <button
          onClick={() => setFlaggedOnly(!flaggedOnly)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            flaggedOnly
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          <FlagIconSolid className="h-5 w-5" />
          Flagged Posts ({posts.filter(p => p.moderation?.flagged).length})
        </button>
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
                placeholder="Search posts..."
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
            <span className="font-semibold text-gray-900">{total}</span> posts found
          </p>
          <span className="text-sm text-gray-500">
            {posts.filter(p => p.moderation?.flagged).length} flagged
          </span>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse border border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className={`bg-white rounded-xl p-6 border ${
                post.moderation?.flagged ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
              } shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(post.category)}`}>
                      {post.category?.replace('-', ' ')}
                    </span>
                    
                    {post.moderation?.flagged && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <FlagIcon className="h-3 w-3" />
                        Flagged ({post.moderation?.flagCount || 0})
                      </span>
                    )}
                    
                    {post.status === 'published' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Published
                      </span>
                    )}
                    
                    {post.moderation?.removed && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Removed
                      </span>
                    )}
                    
                    {post.isAnonymous && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        Anonymous
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{post.title}</h3>
                  
                  {/* Content Preview */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {post.content?.substring(0, 200)}
                    {post.content?.length > 200 && '...'}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      {post.isAnonymous ? 'Anonymous' : post.author?.name || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      {post.metrics?.views || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <DocumentTextIcon className="h-4 w-4" />
                      {post.replies?.length || 0} replies
                    </span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Flag reasons */}
                  {post.moderation?.flagged && post.moderation?.flaggedBy?.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-xs font-semibold text-red-700 mb-1">Flag reasons:</p>
                      <ul className="text-xs text-red-600 space-y-1">
                        {post.moderation.flaggedBy.slice(0, 3).map((flag: any, idx: number) => (
                          <li key={idx}>• {flag.reason}</li>
                        ))}
                        {post.moderation.flaggedBy.length > 3 && (
                          <li className="text-red-500">...and {post.moderation.flaggedBy.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openPostModal(post)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  {post.moderation?.flagged && !post.moderation?.moderatorReviewed && (
                    <>
                      <button
                        onClick={() => handleModerate(post._id, true)}
                        className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleModerate(post._id, false)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
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

      {/* Post Detail Modal */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Post Details</h2>
                <button
                  onClick={() => { setShowModal(false); setSelectedPost(null); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(selectedPost.category)}`}>
                  {selectedPost.category?.replace('-', ' ')}
                </span>
                {selectedPost.isAnonymous && (
                  <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    Anonymous
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900">{selectedPost.title}</h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>By {selectedPost.isAnonymous ? 'Anonymous' : selectedPost.author?.name}</span>
                <span>{new Date(selectedPost.createdAt).toLocaleString()}</span>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
              
              {selectedPost.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t">
                <span>{selectedPost.metrics?.views || 0} views</span>
                <span>{selectedPost.upvotes?.length || 0} upvotes</span>
                <span>{selectedPost.downvotes?.length || 0} downvotes</span>
                <span>{selectedPost.replies?.length || 0} replies</span>
              </div>

              {selectedPost.moderation?.flagged && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <FlagIcon className="h-5 w-5" />
                    Flag Report ({selectedPost.moderation?.flagCount || 0} flags)
                  </h4>
                  <ul className="space-y-2">
                    {selectedPost.moderation?.flaggedBy?.map((flag: any, idx: number) => (
                      <li key={idx} className="text-sm">
                        <span className="font-medium text-red-600">{flag.reason}</span>
                        <span className="text-gray-500 ml-2">by {flag.user?.name || 'Unknown'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              {selectedPost.status === 'published' && !selectedPost.moderation?.removed && (
                <button
                  onClick={() => handleModerate(selectedPost._id, false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Remove Post
                </button>
              )}
              {selectedPost.moderation?.flagged && !selectedPost.moderation?.moderatorReviewed && (
                <button
                  onClick={() => handleModerate(selectedPost._id, true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Post
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedPost._id)}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                Delete Post
              </button>
              <button
                onClick={() => { setShowModal(false); setSelectedPost(null); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
