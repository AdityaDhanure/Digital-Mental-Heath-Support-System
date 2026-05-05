'use client';

import { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authAPI } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { UserIcon, EnvelopeIcon, PhoneIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface ProfileSettingsProps {
  user: any;
  onUpdate: () => void;
}

const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Sanskrit', 'Telugu', 'Bengali', 'Gujarati', 'Tamil', 'Kannada', 'Malayalam', 'Punjabi'];

export default function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    languagesKnown: user?.languagesKnown || [],
  });

  const [initialData] = useState(formData);
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.updateProfile(formData);
      toast.success('Profile updated successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          icon={<UserIcon className="h-5 w-5 text-gray-400" />}
          required
        />
        <Input
          label="Email"
          type="email"
          value={user?.email || ''}
          icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
          disabled
          helperText="Email cannot be changed"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
          placeholder="+91 98765 43210"
        />
        <Input
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          icon={<CalendarIcon className="h-5 w-5 text-gray-400" />}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <select
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Languages Known</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.languagesKnown.map((lang: string) => (
            <span key={lang} className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
              {lang}
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  languagesKnown: formData.languagesKnown.filter((l: string) => l !== lang)
                })}
                className="ml-2 text-purple-500 hover:text-purple-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <select
          onChange={(e) => {
            if (e.target.value && !formData.languagesKnown.includes(e.target.value)) {
              setFormData({
                ...formData,
                languagesKnown: [...formData.languagesKnown, e.target.value]
              });
            }
            e.target.value = '';
          }}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
        >
          <option value="">Add a language...</option>
          {LANGUAGES.filter(l => !formData.languagesKnown.includes(l)).map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" isLoading={isLoading} disabled={!hasChanges}>
          Save Changes
        </Button>
        {hasChanges && (
          <Button type="button" variant="outline" onClick={() => setFormData(initialData)}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
