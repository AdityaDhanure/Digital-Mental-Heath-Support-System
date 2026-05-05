'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { communityAPI } from '@/lib/api/community';

interface CreatePostModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  { value: 'general-support', label: '💬 General Support' },
  { value: 'academic-stress', label: '📚 Academic Stress' },
  { value: 'anxiety', label: '🧘 Anxiety' },
  { value: 'depression', label: '💙 Depression' },
  { value: 'relationships', label: '💝 Relationships' },
  { value: 'self-care', label: '🌸 Self Care' },
  { value: 'success-stories', label: '🎉 Success Stories' },
  { value: 'questions', label: '❓ Questions' },
  { value: 'other', label: '✨ Other' },
];

export default function CreatePostModal({ onClose, onSuccess }: CreatePostModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general-support',
    isAnonymous: false,
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error('Please write something');
      return;
    }

    setIsLoading(true);
    try {
      await communityAPI.createPost({
        title: formData.title.trim() || undefined,
        content: formData.content.trim(),
        category: formData.category,
        isAnonymous: formData.isAnonymous,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      });
      toast.success('Post created!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden p-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[65vh] pr-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title (Optional)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Give your post a title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What's on your mind? *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your thoughts..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Optional)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="stress, advice (comma-separated)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-start bg-purple-50 border border-purple-200 rounded-lg p-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="anonymous" className="ml-3 text-sm text-gray-700">
              <span className="font-semibold">Post anonymously</span>
              <p className="text-gray-600 mt-1">Your identity will be hidden</p>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">Post</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
