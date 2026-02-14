import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore, type ThemeMode } from '@/store/useSettings';

export type ThemeScheme = 'light' | 'dark';

export type AppColors = {
  background: string;
  background2: string;
  header: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  placeholder: string;
  accent: string;
  accent2: string;
  danger: string;
  warning: string;
  onAccent: string;
};

const DARK: AppColors = {
  background: '#0f172a',
  background2: '#0b1224',
  header: '#0b1224',
  surface: '#111827',
  surface2: '#0f172a',
  border: '#1f2937',
  text: '#ffffff',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textFaint: '#475569',
  placeholder: '#475569',
  accent: '#a855f7',
  accent2: '#22d3ee',
  danger: '#f87171',
  warning: '#f59e0b',
  onAccent: '#0f172a'
};

const LIGHT: AppColors = {
  background: '#f8fafc',
  background2: '#e2e8f0',
  header: '#ffffff',
  surface: '#ffffff',
  surface2: '#f1f5f9',
  border: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  textFaint: '#94a3b8',
  placeholder: '#94a3b8',
  accent: '#7c3aed',
  accent2: '#06b6d4',
  danger: '#dc2626',
  warning: '#d97706',
  onAccent: '#0f172a'
};

export function useAppTheme() {
  const mode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const system = useColorScheme();

  const scheme: ThemeScheme = useMemo(() => {
    if (mode === 'system') return system === 'light' ? 'light' : 'dark';
    return mode;
  }, [mode, system]);

  const colors = scheme === 'dark' ? DARK : LIGHT;
  const gradient = scheme === 'dark' ? [colors.background, colors.background2] : [colors.background, colors.background2];

  return {
    mode,
    setThemeMode,
    scheme,
    isDark: scheme === 'dark',
    colors,
    gradient
  } as const;
}

export function labelForThemeMode(mode: ThemeMode): string {
  if (mode === 'system') return 'System';
  if (mode === 'light') return 'Light';
  return 'Dark';
}

