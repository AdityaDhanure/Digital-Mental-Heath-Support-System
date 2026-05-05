import { SparklesIcon } from '@heroicons/react/24/outline';

interface CommunityHeaderProps {
  role?: string;
  postCount?: number;
}

export default function CommunityHeader({ role, postCount }: CommunityHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-8 text-white shadow-xl">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-3">Peer Support Community</h1>
          <p className="text-purple-100 text-md leading-relaxed">
            A safe space to share, support, and grow together
          </p>
          {postCount !== undefined && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {postCount} posts in the community
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:w-80">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            Community Guidelines
          </h3>
          <div className="space-y-2 text-sm text-purple-100">
            <div className="flex items-start gap-2">
              <span className="text-green-300">✓</span>
              <span>Be respectful and supportive</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-300">✓</span>
              <span>Keep personal info private</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-300">✗</span>
              <span>No hate speech or bullying</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-300">✗</span>
              <span>No harmful advice</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
