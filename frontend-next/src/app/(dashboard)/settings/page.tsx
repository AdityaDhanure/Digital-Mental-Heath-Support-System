'use client';

import { useEffect, useMemo } from 'react';
import { Card } from '@/components/common/Card';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePersistentState } from '@/lib/hooks/usePersistentState';
import { Loading } from '@/components/common/Loading';
import AvailabilitySettings from '@/components/settings/AvailabilitySettings';
import { ProfileSettings } from '@/components/settings/shared';
import { SecuritySettings } from '@/components/settings/shared';
import { NotificationSettings } from '@/components/settings/shared';
import { PrivacySettings } from '@/components/settings/shared';
import { PreferencesSettings } from '@/components/settings/shared';
import { VerifyEmailSettings } from '@/components/settings/shared';
import { StudentAccountSettings } from '@/components/settings/student';
import { CounselorAccountSettings } from '@/components/settings/counselor';
import {
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  EyeIcon,
  LanguageIcon,
  AcademicCapIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { user, refreshUser, isLoading } = useAuth(true);
  const [activeTab, setActiveTab] = usePersistentState('mindsage:settings:tab', 'profile');

  const tabs = useMemo(() => [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    ...(user?.role === 'counselor' ? [{ id: 'availability', label: 'Availability', icon: CalendarIcon }] : []),
    { id: 'account', label: 'Account Details', icon: AcademicCapIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'privacy', label: 'Privacy', icon: EyeIcon },
    { id: 'preferences', label: 'Preferences', icon: LanguageIcon },
  ], [user?.role]);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab('profile');
    }
  }, [activeTab, setActiveTab, tabs]);

  if (isLoading) {
    return <Loading />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings user={user} onUpdate={refreshUser} />;
      case 'availability':
        return <AvailabilitySettings />;
      case 'account':
        if (user?.role === 'student') {
          return <StudentAccountSettings user={user} onUpdate={refreshUser} />;
        } else if (user?.role === 'counselor') {
          return <CounselorAccountSettings user={user} onUpdate={refreshUser} />;
        }
        return null;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings user={user} onUpdate={refreshUser} />;
      case 'privacy':
        return <PrivacySettings user={user} onUpdate={refreshUser} />;
      case 'preferences':
        return <PreferencesSettings user={user} onUpdate={refreshUser} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 my-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.isEmailVerified ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Email Verified</span>
            </div>
          ) : (
            <VerifyEmailSettings user={user} onVerified={refreshUser} />
          )}
        </div>
      </div>

      <div className="flex gap-6">
        <Card className="w-72 h-fit p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'student' ? 'bg-blue-100 text-blue-700' :
                  user?.role === 'counselor' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex-1">
          <Card>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {activeTab === 'profile' && 'Update your personal information'}
                {activeTab === 'availability' && 'Manage your appointment slots'}
                {activeTab === 'account' && (user?.role === 'student' ? 'Student academic information' : 'Professional information')}
                {activeTab === 'security' && 'Ensure your account is secure'}
                {activeTab === 'notifications' && 'Choose what notifications you receive'}
                {activeTab === 'privacy' && 'Control your privacy and data'}
                {activeTab === 'preferences' && 'Customize your experience'}
              </p>
            </div>
            {renderContent()}
          </Card>
        </div>
      </div>
    </div>
  );
}
