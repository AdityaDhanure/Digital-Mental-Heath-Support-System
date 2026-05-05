import Link from 'next/link';
import { Post } from '@/types/community.types';
import { Card } from '@/components/common/Card';
import { UserCircleIcon, ChatBubbleLeftIcon, FlagIcon, ClockIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onReply?: (postId: string) => void;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onFlag?: (postId: string, reason: string) => void;
  userId?: string;
  compact?: boolean;
}

const categoryStyles: Record<string, string> = {
  'general-support': 'bg-gray-100 text-gray-700',
  'academic-stress': 'bg-blue-100 text-blue-700',
  'anxiety': 'bg-purple-100 text-purple-700',
  'depression': 'bg-indigo-100 text-indigo-700',
  'relationships': 'bg-pink-100 text-pink-700',
  'self-care': 'bg-green-100 text-green-700',
  'success-stories': 'bg-yellow-100 text-yellow-700',
  'resources': 'bg-cyan-100 text-cyan-700',
  'questions': 'bg-orange-100 text-orange-700',
  'other': 'bg-gray-100 text-gray-700',
};

export default function PostCard({ post, onReply, onVote, onFlag, userId, compact = false }: PostCardProps) {
  const replyCount = post.metrics?.replyCount ?? post.replies?.length ?? 0;
  const likesCount = post.metrics?.upvotes || 0;
  const hasLiked = userId && post.upvotedBy?.includes(userId);

  return (
    <Link href={`/community/${post._id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer mb-10">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1" onClick={(e) => { e.preventDefault(); onVote?.(post._id, 'up'); }}>
            <button
              className="p-1.5 hover:bg-red-50 rounded-full transition-all"
              title={hasLiked ? "Unlike" : "Like"}
            >
              {hasLiked ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
              )}
            </button>
            <span className="text-sm font-semibold text-gray-700">{likesCount}</span>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <UserCircleIcon className="h-9 w-9 text-gray-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">
                      {post.isAnonymous ? post.anonymousAlias : post.author?.name}
                    </p>
                    {post.isPinned && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">📌</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ClockIcon className="h-3 w-3" />
                    {formatDistanceToNow(new Date(post.createdAt || post.publishedAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryStyles[post.category] || categoryStyles['other']}`}>
                {post.category?.replace(/-/g, ' ')}
              </span>
            </div>

            {post.title && (
              <h3 className={`font-bold text-gray-900 mb-1 ${compact ? 'text-base' : 'text-lg'}`}>{post.title}</h3>
            )}

            <p className={`text-gray-700 mb-3 whitespace-pre-wrap leading-relaxed ${compact ? 'text-sm line-clamp-2' : ''}`}>
              {post.content}
            </p>

            {post.tags && post.tags.length > 0 && !compact && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReply?.(post._id); }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium"
              >
                <ChatBubbleLeftIcon className="h-4 w-4" />
                Reply ({replyCount})
              </button>
              <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                <EyeIcon className="h-3.5 w-3.5" />
                {post.metrics?.views || 0}
              </div>
              {onFlag && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFlag(post._id, ''); }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600"
                >
                  <FlagIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
