// Dashboard shared components - QuickAction
import Link from 'next/link';

interface QuickActionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  gradient: string;
  badge?: string;
}

export function QuickAction({ icon: Icon, title, description, href, gradient, badge }: QuickActionProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer group">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-3">{description}</p>
        {badge && (
          <span className="inline-block text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full font-medium">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}
