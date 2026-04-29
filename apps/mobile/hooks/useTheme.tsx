import React, { createContext, useContext, useState } from 'react';

import { MC_DEFAULT_ACCENT, MC_TOKENS } from '../constants/tokens';

type AccentKey = 'mint' | 'violet' | 'coral' | 'blue' | 'amber';

interface ThemeContextValue {
  dark: boolean;
  toggleDark: () => void;
  accentKey: AccentKey;
  setAccent: (key: AccentKey) => void;
  accent: string;
  accentDark: string;
  t: (typeof MC_TOKENS)['light'];
}

const ACCENTS: Record<AccentKey, { primary: string; dark: string }> = {
  mint: { primary: '#00D9A3', dark: '#00B386' },
  violet: { primary: '#6C5CE7', dark: '#5849CC' },
  coral: { primary: '#FF6B6B', dark: '#E55555' },
  blue: { primary: '#0084FF', dark: '#006EE0' },
  amber: { primary: '#F59E0B', dark: '#D97706' },
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [accentKey, setAccentKey] = useState<AccentKey>('mint');

  const toggleDark = () => setDark((d) => !d);
  const setAccent = (key: AccentKey) => setAccentKey(key);

  const acc = ACCENTS[accentKey] ?? MC_DEFAULT_ACCENT;

  return (
    <ThemeContext.Provider
      value={{
        dark,
        toggleDark,
        accentKey,
        setAccent,
        accent: acc.primary,
        accentDark: acc.dark,
        t: dark ? MC_TOKENS.dark : MC_TOKENS.light,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
