import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';

type SettingsState = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'system',
  setThemeMode: (mode) => set({ themeMode: mode })
}));

