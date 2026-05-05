interface ResourcesHeaderProps {
  role: string;
  resourceCount?: number;
}

export default function ResourcesHeader({ role, resourceCount }: ResourcesHeaderProps) {
  const isCounselor = role === 'counselor' || role === 'admin';

  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-8 text-white shadow-xl">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold mb-3">
          {isCounselor ? 'Resource Library' : 'Mental Health Resources'}
        </h1>
        <p className="text-purple-100 text-md leading-relaxed">
          {isCounselor 
            ? 'Manage and share mental health resources with students. Upload articles, videos, and guides to support your community.'
            : 'Explore our curated collection of articles, videos, and guides designed to support your mental wellness journey.'
          }
        </p>
        {resourceCount !== undefined && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {resourceCount} resources available
          </div>
        )}
      </div>
    </div>
  );
}
