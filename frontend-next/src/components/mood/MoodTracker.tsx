// FILE: src/components/mood/MoodTracker.tsx
'use client';

import { useMoodStore, moods } from '@/store/moodStore';
import toast from 'react-hot-toast';

export default function MoodTracker() {
    const { selectedMoodIndex, setMood } = useMoodStore();

    const handleMoodSelect = (index: number) => {
        setMood(index);
        toast.success(`Mood logged: ${moods[index].label}`, { icon: moods[index].emoji });
    };

    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-sm font-semibold mb-4 text-white/90">Today's Mood Check-in</p>
            <div className="flex gap-3 flex-wrap">
                {moods.map((mood, index) => (
                    <button
                        key={index}
                        onClick={() => handleMoodSelect(index)}
                        className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl transition-all ${selectedMoodIndex === index
                                ? 'bg-white text-primary-700 shadow-lg scale-105'
                                : 'bg-white/20 hover:bg-white/30 text-white'
                            }`}
                    >
                        <span className="text-3xl">{mood.emoji}</span>
                        <span className="text-sm font-medium">{mood.label}</span>
                    </button>
                ))}
            </div>
            {selectedMoodIndex !== null && (
                <p className="mt-4 text-sm text-white/80">
                    💡 Based on your mood, we recommend: {
                        selectedMoodIndex <= 1
                            ? 'Keep up the positive energy!'
                            : selectedMoodIndex === 2
                                ? 'Try a quick breathing exercise or meditation.'
                                : 'Consider talking to our AI assistant or booking a session.'}
                </p>
            )}
        </div>
    );
}
