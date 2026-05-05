// FILE: src/components/mood/MoodTrackerFloat.tsx
'use client';

import { useState } from 'react';
import { useMoodStore, moods } from '@/store/moodStore';
import toast from 'react-hot-toast';

export default function MoodTrackerFloat() {
    const { selectedMoodIndex, setMood } = useMoodStore();
    const [isOpen, setIsOpen] = useState(false);
    const [showLabel, setShowLabel] = useState(false);

    const handleSelect = (index: number) => {
        setMood(index);
        toast.success(`Mood logged: ${moods[index].label}`, { icon: moods[index].emoji });
        setIsOpen(false);
    };

    return (
        <div className="fixed top-20 right-4 z-40">
            <button
                onMouseEnter={() => setShowLabel(true)}
                onMouseLeave={() => setShowLabel(false)}
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
            >
                <span className="text-2xl">{selectedMoodIndex !== null ? moods[selectedMoodIndex].emoji : '😊'}</span>

                {/* Hover Label */}
                {showLabel && !isOpen && (
                    <div className="absolute -bottom-10 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap animate-fade-in">
                        Mood?
                        <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                )}
            </button>

            {/* Mood Popup - Circular Quarter Arc */}
            {isOpen && (
                <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none">
                    {/* Glassmorphism Background */}
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-full border border-white/60 shadow-2xl animate-scale-in"></div>

                    {/* Center Text */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <p className="text-xs font-semibold text-gray-700 whitespace-nowrap">Select Mood</p>
                    </div>

                    {/* Emojis in Full Circle Pattern */}
                    <div className="absolute top-1/2 left-1/2 pb-12 pr-12 -translate-x-1/2 -translate-y-1/2">
                        {moods.map((mood, index) => {
                            // Calculate circular positions around full circle
                            const radius = 65; // Reduced radius
                            const angle = (360 / moods.length) * index - 90; // Start from top, distribute evenly
                            const radian = (angle * Math.PI) / 180;
                            const x = Math.cos(radian) * radius;
                            const y = Math.sin(radian) * radius;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleSelect(index)}
                                    style={{
                                        transform: `translate(${x}px, ${y}px)`,
                                    }}
                                    className={`absolute pointer-events-auto w-12 h-12 rounded-full transition-all hover:scale-125 flex items-center justify-center ${selectedMoodIndex === index
                                            ? 'bg-gradient-to-br from-purple-200 to-pink-200 shadow-lg scale-110'
                                            : 'bg-white/80 hover:bg-white shadow-md'
                                        }`}
                                    title={mood.label}
                                >
                                    <span className="text-xl">{mood.emoji}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
