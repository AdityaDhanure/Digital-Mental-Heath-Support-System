'use client';

import { useState } from 'react';
import { PhotoIcon, DocumentIcon, VideoCameraIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

const resourceTypes = [
  { value: 'article', label: 'Article', icon: DocumentIcon },
  { value: 'video', label: 'Video', icon: VideoCameraIcon },
  { value: 'audio', label: 'Audio', icon: MusicalNoteIcon },
  { value: 'pdf', label: 'PDF', icon: DocumentIcon },
  { value: 'exercise', label: 'Exercise', icon: DocumentIcon },
  { value: 'guide', label: 'Guide', icon: DocumentIcon },
  { value: 'infographic', label: 'Infographic', icon: PhotoIcon },
];

const categories = [
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'therapy', label: 'Therapy' },
  { value: 'depression', label: 'Depression' },
  { value: 'stress', label: 'Stress' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'coping-strategies', label: 'Coping Strategies' },
  { value: 'self-care', label: 'Self Care' },
  { value: 'academic-pressure', label: 'Academic Pressure' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'crisis-management', label: 'Crisis Management' },
  { value: 'general-wellness', label: 'General Wellness' },
];

const languages = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'multilingual', label: 'Multilingual' },
];

const targetAudiences = [
  { value: 'all', label: 'All' },
  { value: 'students', label: 'Students' },
  { value: 'counselors', label: 'Counselors' },
  { value: 'faculty', label: 'Faculty' },
];

const difficulties = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

interface ResourceFormData {
  title: string;
  description: string;
  type: string;
  category: string;
  language: string;
  targetAudience: string;
  difficulty: string;
  mediaUrl: string;
  thumbnailUrl: string;
  contentText: string;
  tags: string;
  authorName: string;
  authorCredentials: string;
  authorOrganization: string;
  externalSourceName: string;
  externalSourceUrl: string;
  externalSourceLicense: string;
}

interface ResourceFormProps {
  initialData?: Partial<ResourceFormData>;
  onSubmit: (data: ResourceFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

export default function ResourceForm({ initialData, onSubmit, isSubmitting, submitLabel }: ResourceFormProps) {
  const [formData, setFormData] = useState<ResourceFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'article',
    category: initialData?.category || 'general-wellness',
    language: initialData?.language || 'english',
    targetAudience: initialData?.targetAudience || 'all',
    difficulty: initialData?.difficulty || 'beginner',
    mediaUrl: initialData?.mediaUrl || '',
    thumbnailUrl: initialData?.thumbnailUrl || '',
    contentText: initialData?.contentText || '',
    tags: initialData?.tags || '',
    authorName: initialData?.authorName || '',
    authorCredentials: initialData?.authorCredentials || '',
    authorOrganization: initialData?.authorOrganization || '',
    externalSourceName: initialData?.externalSourceName || '',
    externalSourceUrl: initialData?.externalSourceUrl || '',
    externalSourceLicense: initialData?.externalSourceLicense || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Resource Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {resourceTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.type === type.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter resource title"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the resource"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">{formData.description.length}/500</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <select
              id="targetAudience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {targetAudiences.map((aud) => (
                <option key={aud.value} value={aud.value}>{aud.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {difficulties.map((diff) => (
                <option key={diff.value} value={diff.value}>{diff.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Content</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-700 mb-2">Media URL</label>
            <input
              type="url"
              id="mediaUrl"
              name="mediaUrl"
              value={formData.mediaUrl}
              onChange={handleChange}
              placeholder={formData.type === 'video' ? 'https://youtube.com/...' : 'https://...'}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
            <input
              type="url"
              id="thumbnailUrl"
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleChange}
              placeholder="https://... (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="contentText" className="block text-sm font-medium text-gray-700 mb-2">Content Text</label>
            <textarea
              id="contentText"
              name="contentText"
              value={formData.contentText}
              onChange={handleChange}
              placeholder="Full content for articles, guides, or exercises"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Author Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              id="authorName"
              name="authorName"
              value={formData.authorName}
              onChange={handleChange}
              placeholder="Dr. Jane Smith"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="authorCredentials" className="block text-sm font-medium text-gray-700 mb-2">Credentials</label>
            <input
              type="text"
              id="authorCredentials"
              name="authorCredentials"
              value={formData.authorCredentials}
              onChange={handleChange}
              placeholder="Ph.D., LCSW, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="authorOrganization" className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
            <input
              type="text"
              id="authorOrganization"
              name="authorOrganization"
              value={formData.authorOrganization}
              onChange={handleChange}
              placeholder="University"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Tags</h2>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="stress, mindfulness, breathing"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">External Source (Optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="externalSourceName" className="block text-sm font-medium text-gray-700 mb-2">Source Name</label>
            <input
              type="text"
              id="externalSourceName"
              name="externalSourceName"
              value={formData.externalSourceName}
              onChange={handleChange}
              placeholder="WHO, NIMH, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="externalSourceUrl" className="block text-sm font-medium text-gray-700 mb-2">Source URL</label>
            <input
              type="url"
              id="externalSourceUrl"
              name="externalSourceUrl"
              value={formData.externalSourceUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="externalSourceLicense" className="block text-sm font-medium text-gray-700 mb-2">License</label>
            <input
              type="text"
              id="externalSourceLicense"
              name="externalSourceLicense"
              value={formData.externalSourceLicense}
              onChange={handleChange}
              placeholder="CC BY, public domain"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pb-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : submitLabel}
        </button>
      </div>
    </form>
  );
}

export type { ResourceFormData };
