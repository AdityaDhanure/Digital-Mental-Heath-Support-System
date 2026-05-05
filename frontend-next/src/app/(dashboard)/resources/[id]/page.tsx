'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Resource } from '@/types/resource.types';
import { resourcesAPI } from '@/lib/api/resources';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { ResourceHero, ResourceContent, ResourceRating, ResourceMeta } from '@/components/resources/shared';

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    loadResource();
  }, [params.id]);

  const loadResource = async () => {
    try {
      setLoading(true);
      const response = await resourcesAPI.getResourceById(params.id as string);
      const res = response?.data?.resource || response?.data || response?.resource || response;
      if (res && res._id) {
        if (!res.metrics) {
          res.metrics = { views: 0, likes: 0, shares: 0, downloads: 0, averageRating: 0, totalRatings: 0 };
        }
        setResource(res);
      } else {
        toast.error('Resource not found');
        setResource(null);
      }
    } catch {
      toast.error('Failed to load resource');
      setResource(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await resourcesAPI.toggleLike(params.id as string);
      const next = !isLiked;
      setIsLiked(next);
      if (resource) {
        setResource({
          ...resource,
          metrics: {
            ...resource.metrics,
            likes: next ? resource.metrics.likes + 1 : Math.max(0, resource.metrics.likes - 1),
          },
        });
      }
      toast.success(next ? 'Added to favourites' : 'Removed from favourites');
    } catch {
      toast.error('Failed to update like status');
    }
  };

  const handleRate = async (rating: number) => {
    try {
      await resourcesAPI.rateResource(params.id as string, rating);
      setUserRating(rating);
      toast.success('Rating submitted!');
      loadResource();
    } catch {
      toast.error('Failed to submit rating');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: resource?.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-72 bg-gray-200 rounded-2xl" />
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpenIcon className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Resource not found</h2>
        <p className="text-gray-500 mb-6">The resource you're looking for doesn't exist or couldn't be loaded.</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
        >
          ← Back to Resources
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Resources
      </button>

      <ResourceHero
        resource={resource}
        isLiked={isLiked}
        onLike={handleLike}
        onShare={handleShare}
      />

      <ResourceContent resource={resource} />

      <ResourceRating
        averageRating={resource.metrics?.averageRating || 0}
        totalRatings={resource.metrics?.totalRatings || 0}
        userRating={userRating}
        onRate={handleRate}
      />

      <ResourceMeta resource={resource} />
    </div>
  );
}
