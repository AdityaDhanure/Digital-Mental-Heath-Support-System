'use client';

import MoodTrackerFloat from '@/components/mood/MoodTrackerFloat';
import { StudentCommunity } from '@/components/community/student';

export default function CommunityPage() {
  return (
    <div>
      <MoodTrackerFloat />
      <StudentCommunity />
    </div>
  );
}
