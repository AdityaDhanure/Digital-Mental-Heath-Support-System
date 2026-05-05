// Dashboard Section Header Component
import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ElementType;
}

export function SectionHeader({ title, subtitle, actionText, actionHref, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-purple-100 rounded-lg">
            <Icon className="h-5 w-5 text-purple-600" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {actionText && actionHref && (
        <Link 
          href={actionHref}
          className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
