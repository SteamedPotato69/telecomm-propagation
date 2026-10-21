import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { currentStreak, dayKey, emptyProgress, recordResult } from '../models/game';
import type { LevelKey, Progress, RecordedResult, Stars } from '../models/game';
import { loadProgress, saveProgress } from '../storage/progressStore';

/** Same debounce as the saved plan: several results in a row are written once. */
const SAVE_DELAY_MS = 400;

interface ProgressContextValue {
  /** false until the saved progress has been read: nothing may be written before that, or it would overwrite it. */
  ready: boolean;
  saveFailed: boolean;
  progress: Progress;
  /** The streak as it should be shown today (a streak not continued since yesterday shows 0). */
  streakToday: number;
  /** Applies a finished level (0 stars = not covered = no effect) and tells what it earned. */
  record: (key: LevelKey, stars: Stars) => RecordedResult;
  setEffects: (on: boolean) => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  // The newest progress, readable synchronously: `record` has to RETURN what the result earned, and
  // that cannot wait for React to flush a state update.
  const latest = useRef(progress);

  useEffect(() => {
    let cancelled = false;
    loadProgress(AsyncStorage).then((loaded) => {
      if (cancelled) return;
      latest.current = loaded;
      setProgress(loaded);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const firstRun = useRef(true);
  useEffect(() => {
    if (!ready) return;
    if (firstRun.current) {
      // the state just loaded from storage: writing it straight back is pointless
      firstRun.current = false;
      return;
    }
    const timer = setTimeout(() => {
      saveProgress(AsyncStorage, progress).then((ok) => setSaveFailed(!ok));
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [progress, ready]);

  const record = useCallback<ProgressContextValue['record']>((key, stars) => {
    const result = recordResult(latest.current, key, stars, dayKey(new Date()));
    if (result.progress !== latest.current) {
      latest.current = result.progress;
      setProgress(result.progress);
    }
    return result;
  }, []);

  const setEffects = useCallback((on: boolean) => {
    const next = { ...latest.current, effects: on };
    latest.current = next;
    setProgress(next);
  }, []);

  const streakToday = currentStreak(progress.streak, dayKey(new Date()));

  const value = useMemo<ProgressContextValue>(
    () => ({ ready, saveFailed, progress, streakToday, record, setEffects }),
    [ready, saveFailed, progress, streakToday, record, setEffects]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used inside a ProgressProvider.');
  }
  return context;
}
