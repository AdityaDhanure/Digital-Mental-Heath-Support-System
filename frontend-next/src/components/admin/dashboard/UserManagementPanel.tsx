'use client';
import Link from 'next/link';
import { UsersIcon } from '@heroicons/react/24/outline';

interface RoleCount { _id: string; count: number; }

interface Props {
  usersByRole: RoleCount[];
  totalUsers: number;
  inactiveCount: number;
}

const roleConfig: Record<string, { label: string; color: string; bg: string; abbr: string }> = {
  student:   { label: 'Students',   color: 'text-indigo-600', bg: 'bg-indigo-100', abbr: 'S' },
  counselor: { label: 'Counselors', color: 'text-teal-600',   bg: 'bg-teal-100',   abbr: 'C' },
  admin:     { label: 'Admins',     color: 'text-orange-600', bg: 'bg-orange-100', abbr: 'A' },
};

export default function UserManagementPanel({ usersByRole, totalUsers, inactiveCount }: Props) {
  const getCount = (role: string) => usersByRole.find(r => r._id === role)?.count ?? 0;

  const rows = ['student', 'counselor', 'admin'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">User Management</h3>
        <Link href="/admin/users" className="text-xs text-indigo-600 hover:underline font-medium">View All</Link>
      </div>

      <div className="space-y-3">
        {rows.map((role) => {
          const cfg = roleConfig[role];
          const count = getCount(role);
          const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
          return (
            <div key={role} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                  {cfg.abbr}
                </div>
                <span className="text-sm text-gray-700">{cfg.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{count}</span>
                <span className="text-xs text-gray-400">{pct}%</span>
              </div>
            </div>
          );
        })}

        {/* Inactive / Blocked */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-red-100 text-red-600">B</div>
            <span className="text-sm text-gray-700">Blocked Users</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">{inactiveCount}</span>
            <span className="text-xs text-gray-400">inactive</span>
          </div>
        </div>
      </div>

      <Link href="/admin/users"
        className="mt-auto flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-indigo-200 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition-colors">
        <UsersIcon className="h-4 w-4" /> Manage Users
      </Link>
    </div>
  );
}
