import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
  autoplay: boolean;
}

interface AppState {
  preferences: UserPreferences;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'fr' | 'en') => void;
  setAutoplay: (autoplay: boolean) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  language: 'fr',
  autoplay: true,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),
      setLanguage: (language) =>
        set((state) => ({
          preferences: { ...state.preferences, language },
        })),
      setAutoplay: (autoplay) =>
        set((state) => ({
          preferences: { ...state.preferences, autoplay },
        })),
      resetPreferences: () =>
        set({
          preferences: defaultPreferences,
        }),
    }),
    {
      name: 'laughing-memory-preferences',
    }
  )
); 