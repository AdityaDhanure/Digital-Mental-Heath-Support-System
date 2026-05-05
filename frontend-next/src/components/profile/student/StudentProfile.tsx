'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/common';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon, 
  LanguageIcon, 
  PencilSquareIcon,
  CheckBadgeIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export default function StudentProfile() {
  const { user, isLoading } = useAuth(true);

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-rose-600 px-8 py-12">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute top-4 right-8 w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
            <div className="absolute top-12 right-16 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            
            <div className="relative flex items-center gap-6">
              {/* Avatar */}
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-5xl font-bold text-white shadow-2xl border-4 border-white/30">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center border-4 border-white shadow-lg">
                  <HeartSolidIcon className="h-5 w-5 text-white" />
                </div>
              </motion.div>

              {/* Info */}
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  {user?.isEmailVerified && (
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                      <CheckBadgeIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-purple-100">
                  <SparklesIcon className="h-4 w-4" />
                  <span className="capitalize font-medium">{user.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 border border-gray-100"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <EnvelopeIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <PhoneIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  {user.createdAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <CalendarIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Member Since</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Languages Card */}
              {user.languagesKnown && user.languagesKnown.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-gray-50 to-pink-50 rounded-2xl p-6 border border-gray-100"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <LanguageIcon className="h-4 w-4 text-pink-600" />
                    </div>
                    Languages Known
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {user.languagesKnown.map((lang, index) => (
                      <motion.span
                        key={lang}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="px-4 py-2 bg-white rounded-xl text-sm font-medium text-gray-700 shadow-sm border border-gray-100"
                      >
                        {lang}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Edit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <Link href="/settings">
                <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  <PencilSquareIcon className="h-5 w-5" />
                  Edit Profile
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
