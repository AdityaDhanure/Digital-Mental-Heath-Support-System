'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types/community.types';
import { communityAPI } from '@/lib/api/community';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePersistentState } from '@/lib/hooks/usePersistentState';
import toast from 'react-hot-toast';
import { CommunityHeader, PostList, CreatePostModal, ReplyModal } from '@/components/community/shared';
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';

const categories = [
  { value: 'all', label: 'All', icon: '✨' },
  { value: 'general-support', label: 'General Support', icon: '💬' },
  { value: 'academic-stress', label: 'Academic Stress', icon: '📚' },
  { value: 'anxiety', label: 'Anxiety', icon: '🧘' },
  { value: 'depression', label: 'Depression', icon: '💙' },
  { value: 'relationships', label: 'Relationships', icon: '💝' },
  { value: 'self-care', label: 'Self Care', icon: '🌸' },
  { value: 'success-stories', label: 'Success Stories', icon: '🎉' },
  { value: 'questions', label: 'Questions', icon: '❓' },
];

export default function StudentCommunity() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = usePersistentState('mindsage:student-community:category', 'all');
  const [viewMode, setViewMode] = usePersistentState<'all' | 'my-posts'>('mindsage:student-community:view', 'all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [replyToPost, setReplyToPost] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, viewMode]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      let response;
      if (viewMode === 'my-posts') {
        response = await communityAPI.getMyPosts();
      } else if (selectedCategory !== 'all') {
        response = await communityAPI.getPostsByCategory(selectedCategory);
      } else {
        response = await communityAPI.getAllPosts();
      }

      let postData = response?.data?.posts || response?.data || response?.posts || [];

      if (viewMode === 'my-posts' && user) {
        postData = postData.map((post: Post) => ({
          ...post,
          author: { _id: user.id, name: user.name, email: user.email }
        }));
      }

      setPosts(Array.isArray(postData) ? postData : []);
    } catch {
      toast.error('Failed to load posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    try {
      await communityAPI.votePost(postId, voteType);
      loadPosts();
    } catch {
      toast.error('Failed to vote');
    }
  };

  const handleFlag = async (postId: string, reason: string) => {
    try {
      await communityAPI.flagPost(postId, reason || 'Inappropriate content');
      toast.success('Post reported');
    } catch {
      toast.error('Failed to report post');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <CommunityHeader postCount={posts.length} />

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === 'all' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600'
            }`}
          >
            <SparklesIcon className="h-4 w-4" />
            All Posts
          </button>
          <button
            onClick={() => setViewMode('my-posts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'my-posts' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600'
            }`}
          >
            My Posts
          </button>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>

        <div className="ml-auto">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{posts.length}</span> posts
          </p>
        </div>
      </div>

      <PostList
        posts={posts}
        loading={isLoading}
        onReply={setReplyToPost}
        onVote={handleVote}
        onFlag={handleFlag}
        userId={user?.id}
      />

      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all z-40"
      >
        <PlusIcon className="h-8 w-8" />
      </button>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadPosts}
        />
      )}

      {replyToPost && (
        <ReplyModal
          postId={replyToPost}
          onClose={() => setReplyToPost(null)}
          onSuccess={loadPosts}
        />
      )}
    </div>
  );
}
