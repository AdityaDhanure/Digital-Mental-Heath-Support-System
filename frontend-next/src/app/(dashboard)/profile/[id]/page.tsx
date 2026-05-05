'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/common/Card';
import { ProfileHeader, ProfileInfo } from '@/components/profile/shared';
import { usersAPI } from '@/lib/api/users';
import { bookingAPI } from '@/lib/api/booking';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface CounselorProfileData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  languagesKnown?: string[];
  specialization?: string[];
  experience?: number;
  bio?: string;
  rating?: number;
  totalRatings?: number;
  licenseNumber?: string;
  education?: string[];
  therapyApproaches?: string[];
  isEmailVerified?: boolean;
}

export default function CounselorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const counselorId = params.id as string;

  const [counselor, setCounselor] = useState<CounselorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCounselorProfile();
  }, [counselorId]);

  const loadCounselorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await usersAPI.getCounselorById(counselorId);
      const counselorData = response.data?.counselor || response.data;
      
      if (counselorData) {
        setCounselor(counselorData);
      } else {
        setError('Counselor not found');
      }
    } catch {
      setError('Failed to load counselor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !counselor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The counselor profile could not be loaded.'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Counselor Profile</h1>
              <p className="text-sm text-gray-500">View counselor information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <ProfileHeader
            name={counselor.name}
            role="Counselor"
            isEmailVerified={counselor.isEmailVerified}
            rating={counselor.rating}
            totalRatings={counselor.totalRatings}
            experience={counselor.experience}
            isGradient={true}
          />

          <div className="p-6 space-y-6">
            <ProfileInfo
              email={counselor.email}
              phone={counselor.phone}
              languages={counselor.languagesKnown}
              bio={counselor.bio}
              specialization={counselor.specialization}
              therapyApproaches={counselor.therapyApproaches}
              education={counselor.education}
              licenseNumber={counselor.licenseNumber}
              showContact={true}
              showProfessional={true}
            />

            <button
              onClick={() => router.push('/bookings')}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CalendarIcon className="h-5 w-5" />
              Book a Session
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
