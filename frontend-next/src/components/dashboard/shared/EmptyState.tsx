// Dashboard Empty State Component
import Link from 'next/link';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  actionIcon?: React.ElementType;
}

export function EmptyState({ icon: Icon, title, description, actionText, actionHref, actionIcon: ActionIcon }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
      <div className="inline-flex p-4 bg-purple-50 rounded-2xl mb-4">
        <Icon className="h-10 w-10 text-purple-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {actionText && actionHref && (
        <Link 
          href={actionHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
        >
          {ActionIcon && <ActionIcon className="h-5 w-5" />}
          {actionText}
        </Link>
      )}
    </div>
  );
}
