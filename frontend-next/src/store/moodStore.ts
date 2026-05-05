// ============================================
// FILE: src/store/moodStore.ts
// ============================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Mood {
    emoji: string;
    label: string;
    color: string;
}

export const moods: Mood[] = [
    { emoji: '😄', label: 'Great', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
    { emoji: '🙂', label: 'Good', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
    { emoji: '😐', label: 'Okay', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
    { emoji: '😔', label: 'Low', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300' },
    { emoji: '😢', label: 'Struggling', color: 'bg-red-100 hover:bg-red-200 border-red-300' },
];

interface MoodState {
    selectedMoodIndex: number | null;
    setMood: (index: number) => void;
    clearMood: () => void;
    getMoodData: () => Mood | null;
    getMoodText: () => string;
}

export const useMoodStore = create<MoodState>()(
    persist(
        (set, get) => ({
            selectedMoodIndex: null,

            setMood: (index: number) => {
                if (index >= 0 && index < moods.length) {
                    set({ selectedMoodIndex: index });
                }
            },

            clearMood: () => set({ selectedMoodIndex: null }),

            getMoodData: () => {
                const index = get().selectedMoodIndex;
                return index !== null ? moods[index] : null;
            },

            getMoodText: () => {
                const index = get().selectedMoodIndex;
                if (index === null) return '';

                const mood = moods[index];
                // Special case for "Struggling" - show only the label
                if (mood.label === 'Struggling') {
                    return 'Struggling';
                }
                // For others, show "Feeling [emoji] [label]"
                return `Feeling ${mood.label}`;
            },
        }),
        {
            name: 'mood-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
