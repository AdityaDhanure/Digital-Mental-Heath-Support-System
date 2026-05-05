'use client';

import { useState, useRef, useEffect } from 'react';
import { FaceSmileIcon } from '@heroicons/react/24/outline';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
  '😊': ['😊', '😂', '🥰', '😍', '🤗', '😌', '😔', '😢', '😭', '😤', '😰', '😱', '🤔', '😐', '😑', '🙄'],
  '👍': ['👍', '👎', '👏', '🙏', '💪', '✌️', '🤝', '👋', '🤷', '🤦', '💁', '🙋'],
  '❤️': ['❤️', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💕', '💖', '💗', '💝'],
  '🌸': ['🌸', '🌺', '🌻', '🌷', '🌹', '🍀', '🌙', '⭐', '✨', '🌈', '☀️', '🌤️'],
  '💡': ['💭', '💬', '📱', '💻', '📚', '✏️', '📝', '🎵', '🎨', '⚡', '🔥', '💡'],
};

const CATEGORY_LABELS: Record<string, string> = {
  '😊': 'Mood',
  '👍': 'Actions',
  '❤️': 'Hearts',
  '🌸': 'Nature',
  '💡': 'Things',
};

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('😊');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
        title="Add emoji"
      >
        <FaceSmileIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <div className="flex border-b border-gray-100 p-2 gap-1 overflow-x-auto">
            {Object.keys(EMOJI_CATEGORIES).map((emoji) => (
              <button
                key={emoji}
                onClick={() => setActiveCategory(emoji)}
                className={`p-2 text-xl rounded-lg transition-all ${
                  activeCategory === emoji
                    ? 'bg-purple-100 shadow-sm'
                    : 'hover:bg-gray-100'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="p-3 max-h-56 overflow-y-auto">
            <p className="text-xs text-gray-400 mb-2 font-medium">
              {CATEGORY_LABELS[activeCategory]}
            </p>
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl p-1.5 hover:bg-purple-50 rounded-lg transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
