'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/common';
import { motion } from 'framer-motion';
import { 
  CheckBadgeIcon,
  StarIcon as StarSolidIcon,
  PencilSquareIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  BookOpenIcon,
  SparklesIcon,
  ShieldCheckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export default function CounselorProfile() {
  const { user, isLoading } = useAuth(true);

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  const fullStars = Math.floor(user.rating || 5);
  const rating = user.rating || 5.0;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 py-12">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-8 left-12 w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
            <div className="absolute top-16 right-20 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>

            <div className="relative flex items-start gap-8">
              {/* Avatar with badge */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-6xl font-bold text-white shadow-2xl border-4 border-white/30">
                  {user.name?.charAt(0)}
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center border-4 border-white shadow-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
              </motion.div>

              {/* Info */}
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  {user.isEmailVerified && (
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                      <CheckBadgeIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <p className="text-purple-200 mb-4 flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4" />
                  {user.role === 'admin' ? 'Administrator' : 'Licensed Professional Counselor'}
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-6">
                  {/* Rating */}
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <StarSolidIcon
                          key={i}
                          className={`h-4 w-4 ${i < fullStars ? 'text-yellow-400' : 'text-white/30'}`}
                        />
                      ))}
                    </div>
                    <span className="font-bold">{rating.toFixed(1)}</span>
                    <span className="text-purple-200 text-sm">({user.totalRatings || 0})</span>
                  </div>

                  {/* Experience */}
                  {user.experience && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                      <span className="font-bold">{user.experience}+</span>
                      <span className="text-purple-200 text-sm ml-1">Years Experience</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {user.bio && (
            <div className="px-8 py-6 border-b border-gray-100">
              <p className="text-gray-600 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Content Grid */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Specializations */}
              {user.specialization && user.specialization.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-100"
                >
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    Specializations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user.specialization.map((spec, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white rounded-xl text-sm font-medium text-purple-700 shadow-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Therapy Approaches */}
              {user.therapyApproaches && user.therapyApproaches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100"
                >
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <HeartIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    Therapy Approaches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user.therapyApproaches.map((approach, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white rounded-xl text-sm font-medium text-blue-700 shadow-sm">
                        {approach}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Education */}
              {user.education && user.education.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100"
                >
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <BookOpenIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                    Education
                  </h3>
                  <div className="space-y-2">
                    {user.education.map((edu, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2"></div>
                        {edu}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Info Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {user.languagesKnown && user.languagesKnown.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Languages</p>
                  <p className="text-sm font-semibold text-gray-900">{user.languagesKnown.join(', ')}</p>
                </div>
              )}
              
              {user.licenseNumber && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">License</p>
                  <p className="text-sm font-semibold text-gray-900">{user.licenseNumber}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-4">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
              </div>

              {user.phone && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{user.phone}</p>
                </div>
              )}

              {user.createdAt && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/settings">
                <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  <PencilSquareIcon className="h-5 w-5" />
                  Edit Profile
                </button>
              </Link>
              {user.role === 'counselor' && (
                <Link href="/bookings">
                  <button className="w-full py-4 bg-gradient-to-r from-violet-100 to-purple-100 text-purple-700 rounded-2xl font-semibold hover:from-violet-200 hover:to-purple-200 transition-all flex items-center justify-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    View Sessions
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
