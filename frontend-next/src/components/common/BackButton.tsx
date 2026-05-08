'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface Props {
  href?: string;       // explicit destination; omit to use router.back()
  label?: string;
  className?: string;
}

export default function BackButton({ href, label = 'Back', className = '' }: Props) {
  const router = useRouter();

  const handleClick = () => {
    if (href) router.push(href);
    else router.back();
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group ${className}`}
    >
      <ChevronLeftIcon className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
      {label}
    </button>
  );
}
