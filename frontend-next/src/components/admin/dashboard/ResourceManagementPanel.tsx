'use client';
import Link from 'next/link';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface Props {
  totalResources: number;
  resourcesByCategory: { _id: string; count: number }[];
}

const categoryConfig: Record<string, { label: string; emoji: string; color: string }> = {
  article:  { label: 'Articles', emoji: '📄', color: 'text-blue-600' },
  video:    { label: 'Videos',   emoji: '🎬', color: 'text-purple-600' },
  audio:    { label: 'Audio',    emoji: '🎧', color: 'text-pink-600' },
  exercise: { label: 'Guides',   emoji: '📖', color: 'text-green-600' },
};

export default function ResourceManagementPanel({ totalResources, resourcesByCategory }: Props) {
  const getCount = (cat: string) => resourcesByCategory.find(r => r._id === cat)?.count ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Resource Management</h3>
        <Link href="/admin/resources" className="text-xs text-indigo-600 hover:underline font-medium">View All</Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <span className="text-sm text-gray-700">Total Resources</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{totalResources}</span>
        </div>

        {Object.entries(categoryConfig).map(([cat, cfg]) => (
          <div key={cat} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{cfg.emoji}</span>
              <span className="text-sm text-gray-700">{cfg.label}</span>
            </div>
            <span className={`text-sm font-semibold ${cfg.color}`}>{getCount(cat)}</span>
          </div>
        ))}
      </div>

      <Link href="/admin/resources"
        className="mt-auto flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-purple-200 text-purple-700 text-sm font-medium hover:bg-purple-50 transition-colors">
        <WrenchScrewdriverIcon className="h-4 w-4" /> Manage Resources
      </Link>
    </div>
  );
}
