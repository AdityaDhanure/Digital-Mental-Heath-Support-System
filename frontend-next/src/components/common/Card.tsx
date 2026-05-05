// ============================================
// FILE: src/components/common/Card.tsx
// ============================================
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = true }) => {
  return (
    <div
      className={cn(
        'card',
        hover && 'hover:shadow-xl',
        className
      )}
    >
      {children}
    </div>
  );
};