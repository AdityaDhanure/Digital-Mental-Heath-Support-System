'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { resourcesAPI } from '@/lib/api/resources';
import { ResourceForm, type ResourceFormData } from '@/components/resources/shared';
import toast from 'react-hot-toast';

export default function AddResourcePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: ResourceFormData) => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: 'article',
        category: formData.category,
        language: formData.language,
        targetAudience: formData.targetAudience,
        difficulty: formData.difficulty,
        content: {
          text: formData.contentText || undefined,
          mediaUrl: formData.mediaUrl || undefined,
          thumbnailUrl: formData.thumbnailUrl || undefined,
        },
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        author: formData.authorName ? {
          name: formData.authorName,
          credentials: formData.authorCredentials || undefined,
          organization: formData.authorOrganization || undefined,
        } : undefined,
        externalSource: formData.externalSourceName ? {
          name: formData.externalSourceName,
          url: formData.externalSourceUrl || '',
          licenseType: formData.externalSourceLicense || 'unspecified',
        } : undefined,
        searchKeywords: formData.tags ? formData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [],
        isPublished: true,
      };

      await resourcesAPI.createResource(payload);
      toast.success('Resource created successfully!');
      router.push('/resources');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Add New Resource</h1>
              <p className="text-sm text-gray-500">Create a new mental health resource</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResourceForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Resource"
        />
      </div>
    </div>
  );
}
