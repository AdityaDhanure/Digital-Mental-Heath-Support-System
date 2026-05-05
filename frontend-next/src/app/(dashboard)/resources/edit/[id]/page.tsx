'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { resourcesAPI } from '@/lib/api/resources';
import { ResourceForm, type ResourceFormData } from '@/components/resources/shared';
import toast from 'react-hot-toast';

export default function EditResourcePage() {
  const router = useRouter();
  const params = useParams();
  const resourceId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Partial<ResourceFormData>>({});

  useEffect(() => {
    loadResource();
  }, [resourceId]);

  const loadResource = async () => {
    try {
      const response = await resourcesAPI.getResourceById(resourceId);
      const resource = response.data?.resource || response.data;
      
      if (resource) {
        setInitialData({
          title: resource.title || '',
          description: resource.description || '',
          category: resource.category || 'general-wellness',
          language: resource.language || 'english',
          targetAudience: resource.targetAudience || 'all',
          difficulty: resource.difficulty || 'beginner',
          mediaUrl: resource.content?.mediaUrl || '',
          thumbnailUrl: resource.content?.thumbnailUrl || '',
          contentText: resource.content?.text || '',
          tags: resource.tags?.join(', ') || '',
          authorName: resource.author?.name || '',
          authorCredentials: resource.author?.credentials || '',
          authorOrganization: resource.author?.organization || '',
          externalSourceName: resource.externalSource?.name || '',
          externalSourceUrl: resource.externalSource?.url || '',
          externalSourceLicense: resource.externalSource?.licenseType || '',
        });
      }
    } catch {
      toast.error('Failed to load resource');
      router.push('/resources');
    } finally {
      setIsLoading(false);
    }
  };

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
      };

      await resourcesAPI.updateResource(resourceId, payload);
      toast.success('Resource updated successfully!');
      router.push('/resources');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-gray-900">Edit Resource</h1>
              <p className="text-sm text-gray-500">Update resource details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResourceForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Update Resource"
        />
      </div>
    </div>
  );
}
