'use client';

import { useAuthStore } from '@/store/authStore';
import MoodTrackerFloat from '@/components/mood/MoodTrackerFloat';
import { StudentResources } from '@/components/resources/student';
import { CounselorResources } from '@/components/resources/counselor';

export default function ResourcesPage() {
  const { user } = useAuthStore();
  const isCounselor = user?.role === 'counselor' || user?.role === 'admin';

  return (
    <div className="pb-20">
      <MoodTrackerFloat />
      {isCounselor ? <CounselorResources /> : <StudentResources />}
    </div>
  );
}
