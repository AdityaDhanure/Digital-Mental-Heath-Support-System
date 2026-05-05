// FILE: src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import { StudentDashboard } from '@/components/dashboard/student';
import { CounselorDashboard } from '@/components/dashboard/counselor';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isCounselor = user?.role === 'counselor';

  if (isCounselor) {
    return <CounselorDashboard />;
  }

  return <StudentDashboard />;
}
