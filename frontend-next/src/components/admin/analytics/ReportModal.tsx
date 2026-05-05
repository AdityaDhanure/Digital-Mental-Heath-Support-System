'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

const reportTypes = [
  { value: 'comprehensive', label: 'Comprehensive Report' },
  { value: 'mental-health-trends', label: 'Mental Health Trends' },
  { value: 'user-engagement', label: 'User Engagement' },
  { value: 'counselor-performance', label: 'Counselor Performance' },
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: string;
  setReportType: (type: string) => void;
  onGenerate: () => void;
  generating: boolean;
}

export default function ReportModal({ 
  isOpen, 
  onClose, 
  reportType, 
  setReportType, 
  onGenerate,
  generating 
}: ReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Generate Analytics Report</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Report will include:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• User engagement statistics</li>
              <li>• Chat sentiment analysis</li>
              <li>• Risk assessment overview</li>
              <li>• Counselor performance metrics</li>
              <li>• Mental health trends</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500">
            Report will be downloaded as a text file.
          </p>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate & Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
