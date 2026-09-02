import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ColorPalette, darkPalette, lightPalette } from './palette';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedScheme = 'light' | 'dark';

const STORAGE_KEY = 'telecomm-propagation.themeMode';
const MODE_CYCLE: ThemeMode[] = ['system', 'light', 'dark'];

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedScheme: ResolvedScheme;
  colors: ColorPalette;
  setMode: (mode: ThemeMode) => void;
  /** Advances mode through system -> light -> dark -> system, for a single toggle control. */
  cycleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Resolves "system" against the OS/browser preference (useColorScheme),
 * persists an explicit manual choice via AsyncStorage (works on both
 * web -- backed by localStorage -- and native), and exposes both the
 * mode the user picked and the actual light/dark palette to render.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      })
      .catch(() => {
        // No persisted preference (or storage unavailable) -- default to "system" is already set.
      });
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const cycleMode = () => {
    const next = MODE_CYCLE[(MODE_CYCLE.indexOf(mode) + 1) % MODE_CYCLE.length];
    setMode(next);
  };

  const resolvedScheme: ResolvedScheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const colors = resolvedScheme === 'dark' ? darkPalette : lightPalette;

  const value = useMemo(
    () => ({ mode, resolvedScheme, colors, setMode, cycleMode }),
    [mode, resolvedScheme, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider.');
  }
  return context;
}
