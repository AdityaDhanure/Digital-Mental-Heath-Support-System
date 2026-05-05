'use client';

import { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authAPI } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(passwords.newPassword);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (strength < 2) {
      toast.error('Password is too weak');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.changePassword(passwords.currentPassword, passwords.newPassword);
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="space-y-6">
      <div className="relative">
        <Input
          label="Current Password"
          type={showPassword.current ? 'text' : 'password'}
          value={passwords.currentPassword}
          onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
        >
          {showPassword.current ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>

      <div className="relative">
        <Input
          label="New Password"
          type={showPassword.new ? 'text' : 'password'}
          value={passwords.newPassword}
          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
        >
          {showPassword.new ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
        {passwords.newPassword && (
          <div className="mt-3">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-1.5 flex-1 rounded ${i <= strength ? strengthColors[strength - 1] : 'bg-gray-200'}`} />
              ))}
            </div>
            <p className={`text-xs font-medium ${strength > 0 ? strengthColors[strength - 1].replace('bg-', 'text-').replace('-500', '-600') : 'text-gray-400'}`}>
              {strength > 0 ? strengthLabels[strength - 1] : ''}
            </p>
          </div>
        )}
      </div>

      <div className="relative">
        <Input
          label="Confirm New Password"
          type={showPassword.confirm ? 'text' : 'password'}
          value={passwords.confirmPassword}
          onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
          icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
        >
          {showPassword.confirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">Password Requirements:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>✓ At least 8 characters</li>
          <li>✓ Uppercase and lowercase letters</li>
          <li>✓ At least one number</li>
          <li>✓ At least one special character</li>
        </ul>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Change Password
      </Button>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500">Coming soon</p>
          </div>
          <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">Soon</span>
        </div>
      </div>
    </form>
  );
}
