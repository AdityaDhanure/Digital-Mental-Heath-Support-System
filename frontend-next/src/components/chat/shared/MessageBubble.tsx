'use client';

import { motion } from 'framer-motion';
import { ChatMessage } from '@/types/chat.types';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
            isUser
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
              : 'bg-gradient-to-br from-pink-500 to-rose-600'
          }`}
        >
          {isUser ? (
            <span className="text-white font-semibold text-sm">You</span>
          ) : (
            <img src="/giffie.png" alt="Giffie" className="w-10 h-10 rounded-full" />
          )}
        </div>

        <div
          className={`rounded-2xl px-5 py-4 shadow-sm ${
            isUser
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-md'
              : 'bg-white border border-gray-100 text-gray-900 rounded-tl-md'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none break-words overflow-hidden text-gray-800">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}

          <p
            className={`text-xs mt-2 ${
              isUser ? 'text-purple-200' : 'text-gray-400'
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          {!isUser && message.emotionalRiskScore && message.emotionalRiskScore > 7 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs text-red-700 font-medium flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                High emotional distress detected. Consider reaching out to a counselor.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
