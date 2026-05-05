import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface StudentProfileHeaderProps {
  name: string;
  department?: string;
  year?: string;
  studentId?: string;
  isEmailVerified?: boolean;
}

export default function StudentProfileHeader({
  name,
  department,
  year,
  studentId,
}: StudentProfileHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8">
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold text-white ring-4 ring-white/30">
            {name?.charAt(0) || 'S'}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
            <CheckCircleIcon className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="flex-1 text-white">
          <h2 className="text-3xl font-bold mb-1">{name}</h2>
          <p className="text-purple-100 mb-3">
            {department 
              ? `${department} • ${year} Year`
              : 'Student'}
          </p>
          
          {studentId && (
            <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm">
              ID: {studentId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
