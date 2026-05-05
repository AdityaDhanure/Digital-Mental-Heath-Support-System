'use client';

import { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authAPI } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { BookOpenIcon, MapPinIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface StudentAccountSettingsProps {
  user: any;
  onUpdate: () => void;
}

const DEPARTMENTS = ['CSE', 'ENTC', 'Mechanical', 'Civil', 'Electrical', 'IT'];

export default function StudentAccountSettings({ user, onUpdate }: StudentAccountSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    enrollmentNumber: user?.studentProfile?.enrollmentNumber || '',
    department: user?.studentProfile?.department || '',
    year: user?.studentProfile?.year || '',
    course: user?.studentProfile?.course || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });

  const [initialData] = useState(formData);
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.updateProfile({
        enrollmentNumber: formData.enrollmentNumber,
        department: formData.department,
        year: formData.year,
        course: formData.course,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BookOpenIcon className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900">Academic Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Enrollment Number"
            value={formData.enrollmentNumber}
            onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
            icon={<IdentificationIcon className="h-5 w-5 text-gray-400" />}
            placeholder="BE22F05F048"
          />
          <Input
            label="Course"
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            placeholder="B.E. / B.Tech"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <MapPinIcon className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900">Address</h3>
        </div>
        <Input
          label="Street"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
          placeholder="123 Main Street"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="City"
          />
          <Input
            label="State"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="State"
          />
          <Input
            label="PIN Code"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            placeholder="431001"
          />
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
