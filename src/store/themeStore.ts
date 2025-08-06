import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  applyTheme: (theme: Theme) => void;
}

const applyThemeToDocument = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
};

// Detect system preference
const getSystemTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: getSystemTheme(),
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        applyThemeToDocument(newTheme);
      },
      
      setTheme: (theme: Theme) => {
        set({ theme });
        applyThemeToDocument(theme);
      },
      
      applyTheme: (theme: Theme) => {
        applyThemeToDocument(theme);
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme immediately when store is rehydrated
        if (state?.theme) {
          applyThemeToDocument(state.theme);
        }
      },
    }
  )
);