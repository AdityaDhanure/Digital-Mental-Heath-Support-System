'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Post, Reply } from '@/types/community.types';
import { communityAPI } from '@/lib/api/community';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ArrowLeftIcon, HeartIcon, ChatBubbleLeftIcon, FlagIcon, ClockIcon, EyeIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

const categoryStyles: Record<string, string> = {
  'general-support': 'bg-gray-100 text-gray-700',
  'academic-stress': 'bg-blue-100 text-blue-700',
  'anxiety': 'bg-purple-100 text-purple-700',
  'depression': 'bg-indigo-100 text-indigo-700',
  'relationships': 'bg-pink-100 text-pink-700',
  'self-care': 'bg-green-100 text-green-700',
  'success-stories': 'bg-yellow-100 text-yellow-700',
  'questions': 'bg-orange-100 text-orange-700',
  'other': 'bg-gray-100 text-gray-700',
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const postId = params.postId as string;

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await communityAPI.getPost(postId);
      const postData = response?.data?.post || response?.data;
      if (postData) {
        setPost(postData);
        setReplies(postData.replies || []);
        setIsLiked(user?.id ? (postData.upvotedBy || []).includes(user.id) : false);
      }
    } catch {
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    try {
      await communityAPI.votePost(postId, 'up');
      setIsLiked(!isLiked);
      loadPost();
    } catch {
      toast.error('Failed to vote');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  const handleFlag = async () => {
    try {
      await communityAPI.flagPost(postId, 'Inappropriate content');
      toast.success('Post reported');
    } catch {
      toast.error('Failed to report');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await communityAPI.addReply(postId, { content: replyContent, isAnonymous });
      toast.success('Reply posted!');
      setReplyContent('');
      loadPost();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
        <div className="h-32 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Post not found</h2>
        <button onClick={() => router.push('/community')} className="text-purple-600 hover:underline">
          Back to Community
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${categoryStyles[post.category] || categoryStyles['other']}`}>
              {post.category?.replace(/-/g, ' ')}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <EyeIcon className="h-4 w-4" />
              {post.metrics?.views || 0}
            </div>
          </div>

          {post.title && (
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
              {(post.isAnonymous ? post.anonymousAlias : post.author?.name)?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {post.isAnonymous ? post.anonymousAlias : post.author?.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ClockIcon className="h-3 w-3" />
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>

          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">{post.content}</p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleVote}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isLiked ? <HeartSolidIcon className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
              {post.metrics?.upvotes || 0}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
            >
              <ShareIcon className="h-5 w-5" />
              Share
            </button>
            <button
              onClick={handleFlag}
              className="ml-auto flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-red-600 transition-all"
            >
              <FlagIcon className="h-5 w-5" />
              Report
            </button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ChatBubbleLeftIcon className="h-5 w-5" />
          Replies ({replies.length})
        </h2>

        {replies.map((reply) => (
          <Card key={reply._id} className="ml-6 border-l-4 border-purple-200">
            <div className="p-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-sm font-bold">
                  {(reply.isAnonymous ? reply.anonymousAlias : reply.author?.name)?.charAt(0) || 'A'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm">
                      {reply.isAnonymous ? reply.anonymousAlias : reply.author?.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap ml-11">{reply.content}</p>
              <div className="flex items-center gap-2 mt-2 ml-11 text-xs text-gray-500">
                <HeartIcon className="h-3.5 w-3.5" />
                {reply.upvotes || 0}
              </div>
            </div>
          </Card>
        ))}

        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Add a Reply</h3>
            <form onSubmit={handleReply} className="space-y-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your supportive reply..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600"
                  />
                  Reply anonymously
                </label>
                <Button type="submit" isLoading={isSubmitting}>Post Reply</Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
