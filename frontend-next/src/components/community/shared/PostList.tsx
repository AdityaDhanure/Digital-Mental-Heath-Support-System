import { Post } from '@/types/community.types';
import PostCard from './PostCard';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface PostListProps {
  posts: Post[];
  loading: boolean;
  emptyMessage?: string;
  onReply?: (postId: string) => void;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onFlag?: (postId: string, reason: string) => void;
  userId?: string;
}

export default function PostList({ posts, loading, emptyMessage = 'No posts yet', onReply, onVote, onFlag, userId }: PostListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <ChatBubbleLeftIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Posts Yet</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onReply={onReply}
          onVote={onVote}
          onFlag={onFlag}
          userId={userId}
        />
      ))}
    </div>
  );
}
