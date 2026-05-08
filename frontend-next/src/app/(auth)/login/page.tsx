// ============================================
// FILE: src/app/(auth)/login/page.tsx (UPDATED)
// ============================================
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  }, [isAuthenticated, isHydrated, router]);

  // Don't render login if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return <LoginForm />;
}
