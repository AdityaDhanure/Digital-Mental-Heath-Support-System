'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StudentDetail } from '@/components/profile/student';

export default function StudentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;

  return (
    <div className="min-h-screen">
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
              <h1 className="text-lg font-semibold text-gray-900">Student Profile</h1>
              <p className="text-sm text-gray-500">View student information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentDetail studentId={studentId} />
      </div>
    </div>
  );
}
