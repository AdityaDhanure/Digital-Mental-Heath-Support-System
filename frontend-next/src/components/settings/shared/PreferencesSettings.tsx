'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { authAPI } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { GlobeAltIcon, PaintBrushIcon, ClockIcon } from '@heroicons/react/24/outline';

interface PreferencesSettingsProps {
  user: any;
  onUpdate: () => void;
}

export default function PreferencesSettings({ user, onUpdate }: PreferencesSettingsProps) {
  const [preferences, setPreferences] = useState({
    language: user?.language || 'english',
    theme: user?.theme || 'light',
    timezone: user?.timezone || 'Asia/Kolkata',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await authAPI.updateProfile(preferences);
      toast.success('Preferences updated');
      onUpdate();
    } catch {
      toast.error('Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const ThemeOption = ({ value, label, icon, bg, checked }: { value: string; label: string; icon: string; bg: string; checked: boolean }) => (
    <button
      type="button"
      onClick={() => setPreferences({ ...preferences, theme: value })}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${checked ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <div className={`w-16 h-12 ${bg} rounded-lg flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <GlobeAltIcon className="h-4 w-4 text-purple-600" />
            </span>
            Language
          </span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'english', label: 'English', flag: '🇺🇸' },
            { value: 'hindi', label: 'हिन्दी', flag: '🇮🇳' },
            { value: 'marathi', label: 'मराठी', flag: '🇮🇳' },
          ].map(({ value, label, flag }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPreferences({ ...preferences, language: value })}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${preferences.language === value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="text-2xl">{flag}</span>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
              <PaintBrushIcon className="h-4 w-4 text-pink-600" />
            </span>
            Theme
          </span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <ThemeOption
            value="light"
            label="Light"
            icon="☀️"
            bg="bg-yellow-100"
            checked={preferences.theme === 'light'}
          />
          <ThemeOption
            value="dark"
            label="Dark"
            icon="🌙"
            bg="bg-slate-800"
            checked={preferences.theme === 'dark'}
          />
          <ThemeOption
            value="auto"
            label="Auto"
            icon="✨"
            bg="bg-gradient-to-r from-yellow-100 to-slate-800"
            checked={preferences.theme === 'auto'}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-blue-600" />
            </span>
            Timezone
          </span>
        </label>
        <select
          value={preferences.timezone}
          onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
        >
          <option value="Asia/Kolkata">India (IST) UTC+5:30</option>
          <option value="America/New_York">US Eastern UTC-5</option>
          <option value="America/Los_Angeles">US Pacific UTC-8</option>
          <option value="Europe/London">UK (GMT) UTC+0</option>
          <option value="Asia/Dubai">UAE (GST) UTC+4</option>
          <option value="Asia/Singapore">Singapore (SGT) UTC+8</option>
        </select>
      </div>

      <Button onClick={handleSave} isLoading={isLoading} className="w-full">
        Save Preferences
      </Button>
    </div>
  );
}
