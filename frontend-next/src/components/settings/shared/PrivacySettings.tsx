'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { authAPI } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { EyeIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface PrivacySettingsProps {
  user: any;
  onUpdate: () => void;
}

export default function PrivacySettings({ user, onUpdate }: PrivacySettingsProps) {
  const [privacy, setPrivacy] = useState({
    profileVisibility: user?.privacySettings?.profileVisibility || 'public',
    showEmail: user?.privacySettings?.showEmail || false,
    showPhone: user?.privacySettings?.showPhone || false,
    anonymousPosting: user?.privacySettings?.anonymousPosting || true,
    dataCollection: user?.privacySettings?.dataCollection || true,
  });

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-purple-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`} />
    </button>
  );

  const handleSave = async () => {
    try {
      await authAPI.updateProfile({ privacySettings: privacy });
      toast.success('Privacy settings updated');
      onUpdate();
    } catch {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
        <select
          value={privacy.profileVisibility}
          onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
        >
          <option value="public">🌐 Public - Anyone can see</option>
          <option value="students">👥 Students Only</option>
          <option value="private">🔒 Private - Only you</option>
        </select>
      </div>

      {user?.role !== 'counselor' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-medium text-gray-900">Show Email</div>
              <div className="text-sm text-gray-500">Allow others to see your email</div>
            </div>
            <ToggleSwitch checked={privacy.showEmail} onChange={(val) => setPrivacy({ ...privacy, showEmail: val })} />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-medium text-gray-900">Show Phone</div>
              <div className="text-sm text-gray-500">Allow counselors to contact you</div>
            </div>
            <ToggleSwitch checked={privacy.showPhone} onChange={(val) => setPrivacy({ ...privacy, showPhone: val })} />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-medium text-gray-900">Anonymous Posts</div>
              <div className="text-sm text-gray-500">Post anonymously in community</div>
            </div>
            <ToggleSwitch checked={privacy.anonymousPosting} onChange={(val) => setPrivacy({ ...privacy, anonymousPosting: val })} />
          </div>
        </div>
      )}

      {user?.role === 'counselor' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">Professional Transparency</h4>
              <p className="text-sm text-blue-700 mt-1">
                As a counselor, your identity is visible to maintain professional standards.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="font-medium text-gray-900">Data Collection</div>
          <div className="text-sm text-gray-500">Help improve the platform</div>
        </div>
        <ToggleSwitch checked={privacy.dataCollection} onChange={(val) => setPrivacy({ ...privacy, dataCollection: val })} />
      </div>

      <Button onClick={handleSave} className="w-full">
        Save Settings
      </Button>
    </div>
  );
}
