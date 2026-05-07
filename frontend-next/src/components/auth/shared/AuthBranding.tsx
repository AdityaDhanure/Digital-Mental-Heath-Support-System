'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HeartIcon, SparklesIcon, ShieldCheckIcon, UsersIcon } from '@heroicons/react/24/outline';

const benefits = [
  {
    icon: SparklesIcon,
    title: '24/7 AI Support',
    description: 'Instant help whenever you need it',
    color: 'from-purple-400 to-pink-400'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Completely Confidential',
    description: 'Your privacy is our top priority',
    color: 'from-blue-400 to-cyan-400'
  },
  {
    icon: UsersIcon,
    title: 'Professional Counselors',
    description: 'Licensed experts ready to help',
    color: 'from-green-400 to-emerald-400'
  },
];

export default function AuthBranding() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-12 text-white flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
      
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

      <Link href="/" className="relative z-10 flex items-center gap-3">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <HeartIcon className="h-7 w-7" />
        </div>
        <span className="text-2xl font-bold">MindSage AI</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 space-y-8"
      >
        <div className="space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
            Your Mental Wellness Matters
          </h2>
          <p className="text-lg text-white/90 max-w-md">
            Join thousands of students finding support, healing, and growth through our compassionate platform.
          </p>
        </div>

        <div className="space-y-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <benefit.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{benefit.title}</h3>
                <p className="text-white/80 text-sm">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="relative z-10 flex items-center justify-between text-sm text-white/70">
        <p>© 2025 MindSage AI. All rights reserved.</p>
        <div className="flex items-center gap-1">
          <ShieldCheckIcon className="h-4 w-4" />
          <span>SSL Secured</span>
        </div>
      </div>
    </div>
  );
}
