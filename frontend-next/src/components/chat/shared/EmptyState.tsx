'use client';

import { motion } from 'framer-motion';

const features = [
  { icon: '🗣️', text: 'Talk about your feelings in a safe space' },
  { icon: '💡', text: 'Get personalized coping strategies' },
  { icon: '🤝', text: 'Connect with human counselors when needed' },
  { icon: '🔒', text: 'Your conversations are always private' },
];

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-fit text-center px-4 py-8"
    >
      <div className="relative mb-8">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-2xl"
        >
          <img src="/giffie.png" alt="Giffie" className="w-24 h-24 rounded-full" />
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-white text-sm">✓</span>
        </motion.div>
        <div className="absolute -top-2 -left-4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute -bottom-4 -left-2 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-50"></div>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-gray-900 mb-3"
      >
        Hey there! I'm Giffie 👋
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 max-w-md text-base mb-8"
      >
        Your AI mental wellness companion. I'm here to listen, support, and help you navigate your feelings.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full mb-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <span className="text-2xl">{feature.icon}</span>
            <p className="text-sm text-gray-600 text-left">{feature.text}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl px-6 py-4 max-w-md"
      >
        <p className="text-sm text-red-700">
          <span className="font-semibold">🆘 In case of crisis:</span> Please contact the 24/7 Helpline at{' '}
          <a href="tel:18005990019" className="font-bold underline hover:text-red-800">
            1800 599 0019
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}
