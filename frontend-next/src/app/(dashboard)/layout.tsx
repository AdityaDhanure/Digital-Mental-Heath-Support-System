// Dashboard Layout - Updated with new Sidebar
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import Sidebar from '@/components/layout/SidebarNew';
import { Loading } from '@/components/common/Loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth(true);

  if (isLoading || !isAuthenticated) {
    return <Loading />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 md:px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
