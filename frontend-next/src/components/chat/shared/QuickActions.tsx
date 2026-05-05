'use client';

import { motion } from 'framer-motion';

interface QuickAction {
  label: string;
  prompt: string;
  icon: string;
  color: string;
}

const quickActions: QuickAction[] = [
  { label: 'Feeling anxious', prompt: "I'm feeling really anxious right now", icon: '😰', color: 'from-purple-400 to-pink-400' },
  { label: 'Exam stress', prompt: "I'm stressed about my upcoming exams", icon: '📚', color: 'from-blue-400 to-cyan-400' },
  { label: 'Can\'t sleep', prompt: "I'm having trouble sleeping lately", icon: '😴', color: 'from-indigo-400 to-purple-400' },
  { label: 'Feeling lonely', prompt: "I'm feeling lonely and isolated", icon: '💙', color: 'from-teal-400 to-green-400' },
  { label: 'Need motivation', prompt: "I need some motivation to get through the day", icon: '💪', color: 'from-orange-400 to-red-400' },
  { label: 'Low mood', prompt: "I've been feeling down lately", icon: '🌧️', color: 'from-gray-400 to-gray-500' },
];

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
}

export default function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
        <p className="text-xs font-medium text-gray-500">Start a conversation with:</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(action.prompt)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${action.color} text-white rounded-xl text-xs font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all`}
          >
            <span className="text-base">{action.icon}</span>
            <span>{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
