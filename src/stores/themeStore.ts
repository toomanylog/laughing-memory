import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  systemPreference: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setSystemPreference: (useSystem: boolean) => void;
}

// Fonction utilitaire pour déterminer le thème système
const getSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    immer((set) => ({
      mode: 'dark', // Thème par défaut
      systemPreference: true, // Utiliser les préférences système par défaut
      
      setMode: (mode) => set((state) => {
        state.mode = mode;
        state.systemPreference = false; // Désactiver l'utilisation des préférences système
      }),
      
      toggleMode: () => set((state) => {
        state.mode = state.mode === 'light' ? 'dark' : 'light';
        state.systemPreference = false; // Désactiver l'utilisation des préférences système
      }),
      
      setSystemPreference: (useSystem) => set((state) => {
        state.systemPreference = useSystem;
        if (useSystem) {
          state.mode = getSystemTheme();
        }
      }),
    })),
    {
      name: 'theme-storage', // Nom du stockage local
      partialize: (state) => ({ 
        mode: state.mode, 
        systemPreference: state.systemPreference 
      }),
    }
  )
);

// Écouter les changements de préférence de thème du système
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = () => {
    const store = useThemeStore.getState();
    if (store.systemPreference) {
      store.setMode(getSystemTheme());
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
} 