import { TUTORIAL_IDS } from '../models/game/levels';
import type { LevelKey } from '../models/game/levels';
import { emptyProgress } from '../models/game/progress';
import type { Progress, Stars } from '../models/game/progress';
import type { KeyValueStorage } from './planStore';

/**
 * Persistence of the game progress (XP, stars, streak, effects switch), on the
 * device only. Same rules as the saved plan: storage injected, versioned, and
 * anything unreadable is dropped field by field instead of thrown -- a damaged
 * save must never stop the app, and one bad field must not wipe the rest of what
 * the student earned.
 */
export const PROGRESS_STORAGE_KEY = 'telecomm-propagation.progress';
export const PROGRESS_STORAGE_VERSION = 1;

const LEVEL_KEYS: readonly LevelKey[] = [...TUTORIAL_IDS, 'mission-1g', 'mission-2g', 'mission-3g'];

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0;
const isStars = (value: unknown): value is Stars => value === 0 || value === 1 || value === 2 || value === 3;

/** A real calendar day written YYYY-MM-DD ("2026-02-31" is not one). */
function isDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Never throws: whatever is not understood falls back to a fresh value for that field. */
export function parseStoredProgress(raw: string | null): Progress {
  if (raw === null) return emptyProgress();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return emptyProgress();
  }
  if (!isObject(data) || data.version !== PROGRESS_STORAGE_VERSION) return emptyProgress();

  const progress = emptyProgress();
  if (isCount(data.xp)) progress.xp = data.xp;

  if (isObject(data.streak) && isCount(data.streak.count) && isDay(data.streak.lastDay)) {
    progress.streak = { count: data.streak.count, lastDay: data.streak.lastDay };
  }

  if (isObject(data.stars)) {
    for (const key of LEVEL_KEYS) {
      const value = data.stars[key];
      if (isStars(value) && value > 0) progress.stars[key] = value;
    }
  }

  if (typeof data.effects === 'boolean') progress.effects = data.effects;
  return progress;
}

export const serializeProgress = (progress: Progress): string =>
  JSON.stringify({ version: PROGRESS_STORAGE_VERSION, ...progress });

export async function loadProgress(storage: KeyValueStorage): Promise<Progress> {
  try {
    return parseStoredProgress(await storage.getItem(PROGRESS_STORAGE_KEY));
  } catch {
    return emptyProgress();
  }
}

/** Resolves to false (instead of throwing) when the device refuses the write. */
export async function saveProgress(storage: KeyValueStorage, progress: Progress): Promise<boolean> {
  try {
    await storage.setItem(PROGRESS_STORAGE_KEY, serializeProgress(progress));
    return true;
  } catch {
    return false;
  }
}

export async function clearProgress(storage: KeyValueStorage): Promise<void> {
  try {
    await storage.removeItem(PROGRESS_STORAGE_KEY);
  } catch {
    // nothing to clear, or storage unavailable
  }
}
