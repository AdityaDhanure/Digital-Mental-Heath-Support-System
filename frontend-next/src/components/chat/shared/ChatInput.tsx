'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import EmojiPicker from './EmojiPicker';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px';
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setMessage(target.value);
    target.style.height = '24px';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    }
  };

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100">
      <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl px-4 py-3 border border-gray-200 transition-all focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100">
        <div className="flex-shrink-0">
          <EmojiPicker onSelect={handleEmojiSelect} />
        </div>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Share your feelings with Giffie..."
          readOnly={isLoading}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 resize-none text-sm text-gray-800 placeholder-gray-400 disabled:cursor-not-allowed leading-relaxed"
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />

        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          className={`flex-shrink-0 p-2.5 rounded-xl transition-all shadow-md ${
            message.trim() && !isLoading
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <SparklesIcon className="h-5 w-5 animate-pulse" />
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        Giffie provides support, not medical advice. For emergencies, call 1800 599 0019
      </p>
    </div>
  );
}
