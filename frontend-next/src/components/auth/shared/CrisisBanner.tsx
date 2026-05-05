'use client';

import { PhoneIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function CrisisBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <PhoneIcon className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h3 className="font-bold text-red-900 text-sm">In Crisis? Get Immediate Help</h3>
          <p className="text-sm text-red-700 mt-1">
            Mental Health Rehabilitation Helpline:{' '}
            <a href="tel:18005990019" className="font-bold underline hover:no-underline">
              1800 599 0019
            </a>
          </p>
          <p className="text-xs text-red-600 mt-1">Available 24/7, Free & Confidential</p>
        </div>
      </div>
    </motion.div>
  );
}
