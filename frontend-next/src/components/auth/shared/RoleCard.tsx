'use client';

interface RoleCardProps {
  role: 'student' | 'counselor';
  selected: boolean;
  onSelect: () => void;
}

export default function RoleCard({ role, selected, onSelect }: RoleCardProps) {
  const isStudent = role === 'student';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
        selected
          ? isStudent
            ? 'border-blue-500 bg-blue-50'
            : 'border-green-500 bg-green-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            selected
              ? isStudent
                ? 'bg-blue-500 text-white'
                : 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600'
          } transition-colors`}>
            {isStudent ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              {isStudent ? 'Student' : 'Counselor'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isStudent
                ? 'Access counseling & resources'
                : 'Help students with mental health'}
            </p>
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
          selected
            ? 'border-transparent bg-gradient-to-r from-purple-500 to-pink-500'
            : 'border-gray-300'
        }`}>
          {selected && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
