'use client';

import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface OTPDigitInputProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: (el: HTMLInputElement | null) => void;
  isFocused: boolean;
}

export default function OTPDigitInput({
  index,
  value,
  onChange,
  onKeyDown,
  inputRef,
  isFocused
}: OTPDigitInputProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <input
        ref={inputRef}
        type="text"
        maxLength={1}
        inputMode="numeric"
        pattern="[0-9]"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        onKeyDown={onKeyDown}
        autoFocus={isFocused}
        className={`w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 transition-all duration-200 focus:outline-none ${
          isFocused || value
            ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-200'
            : 'border-gray-200 bg-white hover:border-purple-300'
        }`}
      />
    </motion.div>
  );
}
