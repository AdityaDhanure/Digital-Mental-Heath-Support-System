// Dashboard Wellness Tip Card
interface WellnessTipProps {
  title: string;
  content: string;
  emoji?: string;
}

export function WellnessTip({ title, content, emoji = '💡' }: WellnessTipProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}
