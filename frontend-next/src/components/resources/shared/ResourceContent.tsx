import { Resource } from '@/types/resource.types';
import { PlayIcon, DocumentTextIcon, MusicalNoteIcon, BookOpenIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface ResourceContentProps {
  resource: Resource;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function VideoPlayer({ url }: { url?: string }) {
  if (!url) {
    return (
      <div className="aspect-video bg-gray-900 rounded-2xl flex flex-col items-center justify-center text-white gap-4">
        <PlayIcon className="h-20 w-20 opacity-40" />
        <p className="text-sm text-gray-400">No video URL available</p>
      </div>
    );
  }

  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) {
    return (
      <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl">
      <video controls className="w-full h-full" src={url}>
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

function AudioPlayer({ url, title }: { url?: string; title: string }) {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-2xl p-10 text-white shadow-xl">
      <div className="flex flex-col items-center gap-6">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
          <MusicalNoteIcon className="h-12 w-12 text-white" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">{title}</p>
          <p className="text-sm text-white/70 mt-1">Audio Resource</p>
        </div>
        {url ? (
          <audio controls className="w-full max-w-lg mt-2">
            <source src={url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        ) : (
          <p className="text-sm text-white/60">No audio URL available</p>
        )}
      </div>
    </div>
  );
}

function ArticleContent({ text }: { text?: string }) {
  if (!text) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <p className="text-gray-400 italic">Article content is not available yet.</p>
      </div>
    );
  }

  const paragraphs = text.split(/\n{2,}/);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
        {paragraphs.map((para, i) => {
          if (para.startsWith('# ')) {
            return <h2 key={i} className="text-2xl font-bold text-gray-900 mt-6 mb-3">{para.slice(2)}</h2>;
          }
          if (para.startsWith('## ')) {
            return <h3 key={i} className="text-xl font-semibold text-gray-900 mt-5 mb-2">{para.slice(3)}</h3>;
          }
          if (para.startsWith('- ')) {
            const items = para.split('\n').filter(l => l.startsWith('- '));
            return (
              <ul key={i} className="list-disc list-inside space-y-1 my-3">
                {items.map((item, j) => (
                  <li key={j} className="text-gray-700">{item.slice(2)}</li>
                ))}
              </ul>
            );
          }
          return <p key={i} className="mb-4 text-gray-700">{para}</p>;
        })}
      </div>
    </div>
  );
}

function PdfViewer({ url }: { url?: string }) {
  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 flex flex-col items-center gap-6 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center">
        <BookOpenIcon className="h-10 w-10 text-red-600" />
      </div>
      <div>
        <p className="text-lg font-semibold text-gray-900">PDF Document</p>
        <p className="text-sm text-gray-500 mt-1">Click below to open the full PDF in a new tab</p>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
          Open PDF
        </a>
      ) : (
        <p className="text-sm text-gray-400 italic">PDF URL not available</p>
      )}
    </div>
  );
}

function ExerciseGuide({ text, title }: { text?: string; title: string }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
          <PlayIcon className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-green-900">{title}</h2>
      </div>
      {text ? (
        <div className="text-gray-700 whitespace-pre-line leading-relaxed">{text}</div>
      ) : (
        <p className="text-gray-400 italic">Content not available</p>
      )}
    </div>
  );
}

function InfographicView({ url, title }: { url?: string; title: string }) {
  if (!url) {
    return (
      <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 flex flex-col items-center gap-4 text-center">
        <DocumentTextIcon className="h-16 w-16 text-gray-300" />
        <p className="text-gray-400 italic">Infographic not available</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <img src={url} alt={title} className="w-full object-contain" />
    </div>
  );
}

export default function ResourceContent({ resource }: ResourceContentProps) {
  const url = resource.content?.mediaUrl;
  const text = resource.content?.text;

  switch (resource.type) {
    case 'video':
      return <VideoPlayer url={url} />;
    case 'audio':
      return <AudioPlayer url={url} title={resource.title} />;
    case 'article':
      return <ArticleContent text={text} />;
    case 'pdf':
      return <PdfViewer url={url} />;
    case 'exercise':
      return <ExerciseGuide text={text} title={resource.title} />;
    case 'guide':
      return <ArticleContent text={text} />;
    case 'infographic':
      return <InfographicView url={url || resource.content?.thumbnailUrl} title={resource.title} />;
    default:
      return <ArticleContent text={text || resource.description} />;
  }
}
