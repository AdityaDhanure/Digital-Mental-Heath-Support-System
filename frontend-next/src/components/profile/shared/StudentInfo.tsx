import { EnvelopeIcon, PhoneIcon, UserIcon, AcademicCapIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface ContactInfoProps {
  email: string;
  phone?: string;
  gender?: string;
}

export default function ContactInfo({ email, phone, gender }: ContactInfoProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-gray-600">
        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
        <span>{email}</span>
      </div>
      <div className="flex items-center gap-3 text-gray-600">
        <PhoneIcon className="h-5 w-5 text-gray-400" />
        <span>{phone && phone !== "Not provided" ? phone : "Not provided"}</span>
      </div>
      {gender && (
        <div className="flex items-center gap-3 text-gray-600">
          <UserIcon className="h-5 w-5 text-gray-400" />
          <span className="capitalize">{gender.replace('_', ' ')}</span>
        </div>
      )}
    </div>
  );
}

interface AcademicInfoProps {
  department?: string;
  year?: string;
  studentId?: string;
  semester?: string;
}

export function AcademicInfo({ department, year, studentId, semester }: AcademicInfoProps) {
  const items = [
    { label: 'Department', value: department, icon: AcademicCapIcon },
    { label: 'Year', value: year, icon: CalendarIcon },
    { label: 'Student ID', value: studentId, icon: UserIcon },
  ];

  const hasData = items.some(item => item.value);

  if (!hasData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map(({ label, value, icon: Icon }) => value && (
        <div key={label} className="bg-gray-50 rounded-xl p-4">
          <Icon className="h-6 w-6 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">{label}</p>
          <p className="font-medium text-gray-900">{value}</p>
        </div>
      ))}
    </div>
  );
}
