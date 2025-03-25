import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MediaContent, WatchHistory } from './types';

interface StoreState {
  watchHistory: Record<string, WatchHistory>;
  favorites: string[];
  currentMedia: MediaContent | null;
  currentEpisodeId: string | null;
}

interface StoreActions {
  setCurrentMedia: (media: MediaContent | null) => void;
  setCurrentEpisodeId: (episodeId: string | null) => void;
  updateWatchProgress: (contentId: string, progress: number, completed: boolean) => void;
  toggleFavorite: (contentId: string) => void;
  isInFavorites: (contentId: string) => boolean;
  getWatchProgress: (contentId: string) => number | null;
  clearHistory: () => void;
}

export type AppState = StoreState & StoreActions;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // État
      watchHistory: {},
      favorites: [],
      currentMedia: null,
      currentEpisodeId: null,
      
      // Actions
      setCurrentMedia: (media) => set({ currentMedia: media }),
      setCurrentEpisodeId: (episodeId) => set({ currentEpisodeId: episodeId }),
      
      updateWatchProgress: (contentId, progress, completed) => set((state) => ({
        watchHistory: {
          ...state.watchHistory,
          [contentId]: {
            contentId,
            timestamp: Date.now(),
            progress,
            completed
          }
        }
      })),
      
      toggleFavorite: (contentId) => set((state) => {
        const isFavorite = state.favorites.includes(contentId);
        return {
          favorites: isFavorite
            ? state.favorites.filter(id => id !== contentId)
            : [...state.favorites, contentId]
        };
      }),
      
      isInFavorites: (contentId) => {
        return get().favorites.includes(contentId);
      },
      
      getWatchProgress: (contentId) => {
        const history = get().watchHistory[contentId];
        return history ? history.progress : null;
      },
      
      clearHistory: () => set({ watchHistory: {} }),
    }),
    {
      name: 'streaming-app-storage',
      partialize: (state) => ({ 
        watchHistory: state.watchHistory,
        favorites: state.favorites 
      }),
    }
  )
); 