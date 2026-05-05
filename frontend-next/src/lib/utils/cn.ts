// ============================================
// FILE: src/lib/utils/cn.ts
// PURPOSE: Utility for merging class names (Tailwind CSS)
// ============================================
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
