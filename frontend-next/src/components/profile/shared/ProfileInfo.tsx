import { EnvelopeIcon, PhoneIcon, CalendarIcon, LanguageIcon, BriefcaseIcon, BookOpenIcon } from '@heroicons/react/24/outline';

interface ProfileInfoProps {
  email: string;
  phone?: string;
  createdAt?: string;
  languages?: string[];
  bio?: string;
  specialization?: string[];
  therapyApproaches?: string[];
  education?: string[];
  licenseNumber?: string;
  showContact?: boolean;
  showProfessional?: boolean;
}

export default function ProfileInfo({
  email,
  phone,
  createdAt,
  languages,
  bio,
  specialization,
  therapyApproaches,
  education,
  licenseNumber,
  showContact = true,
  showProfessional = false
}: ProfileInfoProps) {
  return (
    <div className="space-y-6">
      {bio && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
          <p className="text-gray-600 leading-relaxed">{bio}</p>
        </div>
      )}

      {specialization && specialization.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {specialization.map((spec, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {therapyApproaches && therapyApproaches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Therapy Approaches</h3>
          <div className="flex flex-wrap gap-2">
            {therapyApproaches.map((approach, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
              >
                {approach}
              </span>
            ))}
          </div>
        </div>
      )}

      {education && education.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
          <div className="space-y-2">
            {education.map((edu, index) => (
              <div key={index} className="flex items-center gap-3 text-gray-600">
                <BookOpenIcon className="h-5 w-5 text-gray-400" />
                <span>{edu}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        {languages && languages.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <LanguageIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Languages</p>
              <p className="font-medium text-gray-900">{languages.join(', ')}</p>
            </div>
          </div>
        )}

        {licenseNumber && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BriefcaseIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">License</p>
              <p className="font-medium text-gray-900">{licenseNumber}</p>
            </div>
          </div>
        )}
      </div>

      {showContact && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <span>{email}</span>
            </div>
            {phone && (
              <div className="flex items-center gap-3 text-gray-600">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <span>{phone}</span>
              </div>
            )}
            {createdAt && (
              <div className="flex items-center gap-3 text-gray-600">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span>Joined {new Date(createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
