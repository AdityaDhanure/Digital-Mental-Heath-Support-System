'use client';

import { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authAPI } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, SparklesIcon, MapPinIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface CounselorAccountSettingsProps {
  user: any;
  onUpdate: () => void;
}

const SPECIALIZATIONS = [
  'Anxiety & Stress Management',
  'Depression & Mood Disorders',
  'Academic Counseling',
  'Career Guidance',
  'Relationship & Family Counseling',
  'Trauma & PTSD',
  'Addiction & Substance Abuse',
  'General Mental Health'
];

export default function CounselorAccountSettings({ user, onUpdate }: CounselorAccountSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: user?.counselorProfile?.licenseNumber || '',
    experience: user?.counselorProfile?.experience || '',
    bio: user?.counselorProfile?.bio || '',
    specialization: user?.counselorProfile?.specialization || [],
    therapyApproaches: user?.counselorProfile?.therapyApproaches || [],
    education: user?.counselorProfile?.education || [],
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });

  const [newEducation, setNewEducation] = useState('');
  const [initialData] = useState(formData);
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.updateProfile({
        licenseNumber: formData.licenseNumber,
        experience: formData.experience,
        bio: formData.bio,
        specialization: formData.specialization,
        therapyApproaches: formData.therapyApproaches,
        education: formData.education,
        address: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      });
      toast.success('Account details updated');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (field: 'specialization' | 'therapyApproaches', item: string) => {
    const current = formData[field];
    const updated = current.includes(item)
      ? current.filter((i: string) => i !== item)
      : [...current, item];
    setFormData({ ...formData, [field]: updated });
  };

  const addEducation = () => {
    if (newEducation.trim() && !formData.education.includes(newEducation.trim())) {
      setFormData({ ...formData, education: [...formData.education, newEducation.trim()] });
      setNewEducation('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900">Professional Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="License Number"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            placeholder="LIC123456"
          />
          <Input
            label="Years of Experience"
            type="number"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            placeholder="5"
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900">Specializations</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SPECIALIZATIONS.map(spec => (
            <button
              key={spec}
              type="button"
              onClick={() => toggleItem('specialization', spec)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                formData.specialization.includes(spec)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-sm font-medium text-gray-700">{spec}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio / About You</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
          placeholder="Tell students about yourself..."
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BookOpenIcon className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900">Education</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.education.map((edu: string) => (
            <span key={edu} className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
              {edu}
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  education: formData.education.filter((e: string) => e !== edu)
                })}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newEducation}
            onChange={(e) => setNewEducation(e.target.value)}
            placeholder="Add education..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEducation())}
          />
          <Button type="button" onClick={addEducation} variant="outline">Add</Button>
        </div>
      </div>

      <div className="flex gap-4">
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
