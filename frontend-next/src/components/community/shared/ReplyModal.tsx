'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { communityAPI } from '@/lib/api/community';

interface ReplyModalProps {
  postId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReplyModal({ postId, onClose, onSuccess }: ReplyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please write a reply');
      return;
    }

    setIsLoading(true);
    try {
      await communityAPI.addReply(postId, { content, isAnonymous });
      toast.success('Reply posted!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post reply');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Reply</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your supportive reply..."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
            required
          />

          <div className="flex items-start">
            <input
              type="checkbox"
              id="reply-anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="reply-anonymous" className="ml-2 text-sm text-gray-700">
              Reply anonymously
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">Post Reply</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
