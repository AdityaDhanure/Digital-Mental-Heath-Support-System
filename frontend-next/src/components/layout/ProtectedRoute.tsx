// ============================================
// FILE: src/components/layout/ProtectedRoute.tsx (NEW)
// ============================================
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/common/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth(requireAuth);

  if (isLoading) {
    return <Loading />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Loading />; // useAuth hook will handle redirect
  }

  return <>{children}</>;
}