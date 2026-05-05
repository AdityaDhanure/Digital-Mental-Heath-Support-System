'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/common';
import { StudentProfile } from '@/components/profile/student';
import { CounselorProfile } from '@/components/profile/counselor';

export default function ProfilePage() {
  const { user, isLoading } = useAuth(true);

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  if (user.role === 'counselor' || user.role === 'admin') {
    return <CounselorProfile />;
  }

  return <StudentProfile />;
}
