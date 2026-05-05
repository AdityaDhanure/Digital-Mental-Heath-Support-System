interface MoodHistoryEntry {
  mood: string;
  score: number;
  timestamp: string;
}

interface MoodHistoryProps {
  entries: MoodHistoryEntry[];
}

const moodEmojis: Record<string, string> = {
  'happy': '😊',
  'good': '🙂',
  'neutral': '😐',
  'sad': '😢',
  'anxious': '😰',
  'stressed': '😫',
  'depressed': '😔'
};

export default function MoodHistory({ entries }: MoodHistoryProps) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {entries.slice(0, 7).map((entry, index) => (
        <div key={index} className="flex-shrink-0 bg-purple-50 rounded-xl p-3 text-center min-w-[70px]">
          <p className="text-2xl mb-1">{moodEmojis[entry.mood?.toLowerCase()] || '😐'}</p>
          <p className="text-xs text-gray-500">{entry.score}/10</p>
        </div>
      ))}
    </div>
  );
}
