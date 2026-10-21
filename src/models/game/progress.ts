import { TUTORIAL_IDS, isTutorial, nextTutorial } from './levels';
import type { LevelKey, TutorialId } from './levels';

/** 0 = not completed yet. */
export type Stars = 0 | 1 | 2 | 3;

/** First time a level is completed. */
export const LEVEL_XP_BASE = 20;
/** Every star above the best one earned before. */
export const XP_PER_STAR = 15;

export interface Streak {
  /** Consecutive days practised, as of `lastDay`. */
  count: number;
  /** Local calendar day (YYYY-MM-DD) of the last completed level, or null. */
  lastDay: string | null;
}

export interface Progress {
  xp: number;
  streak: Streak;
  /** Best stars per level; a level that is not here has none. */
  stars: Partial<Record<LevelKey, Stars>>;
  /** Confetti and vibration. Off for people it distracts; reduced-motion at system level also turns the motion off. */
  effects: boolean;
}

export const emptyProgress = (): Progress => ({ xp: 0, streak: { count: 0, lastDay: null }, stars: {}, effects: true });

export const starsOf = (progress: Progress, key: LevelKey): Stars => progress.stars[key] ?? 0;

/**
 * XP for improving a level from `previous` to `next` stars: the base the first
 * time, plus 15 per new star. Replaying without improving earns nothing, so the
 * numbers cannot be farmed, and three stars add up to the same 65 XP whether they
 * came in one play or three.
 */
export function xpEarned(previous: Stars, next: Stars): number {
  if (next <= previous) return 0;
  return (previous === 0 ? LEVEL_XP_BASE : 0) + (next - previous) * XP_PER_STAR;
}

// ---- days and streak -----------------------------------------------------------------------------------------

const pad = (value: number) => String(value).padStart(2, '0');

/** The local calendar day as YYYY-MM-DD. */
export const dayKey = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/**
 * The day before a YYYY-MM-DD day. Done in UTC on purpose: subtracting 24 h from a local
 * midnight lands on the wrong day around a daylight-saving change.
 */
export function previousDay(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  const before = new Date(Date.UTC(year, month - 1, date) - 24 * 60 * 60 * 1000);
  return `${before.getUTCFullYear()}-${pad(before.getUTCMonth() + 1)}-${pad(before.getUTCDate())}`;
}

/**
 * Counts `today` as practised. Consecutive day: +1. A gap: starts again at 1. The same day twice: no change.
 * If the last day is in the future (the device clock moved back or the player travelled west) nothing
 * changes either: that is not a reason to take a streak away.
 */
export function practiceDay(streak: Streak, today: string): Streak {
  if (streak.lastDay === today) return streak;
  if (streak.lastDay !== null && streak.lastDay > today) return streak;
  if (streak.lastDay !== null && streak.lastDay === previousDay(today)) return { count: streak.count + 1, lastDay: today };
  return { count: 1, lastDay: today };
}

/** What to show: a streak that was not continued yesterday or today is already broken, even though it is still stored. */
export function currentStreak(streak: Streak, today: string): number {
  if (streak.lastDay === null) return 0;
  if (streak.lastDay >= today || streak.lastDay === previousDay(today)) return streak.count;
  return 0;
}

// ---- unlocking ----------------------------------------------------------------------------------------------

/** Tutorial k opens when tutorial k-1 has at least one star. The missions are never locked: they are the deliverable. */
export function isUnlocked(progress: Progress, key: LevelKey): boolean {
  if (!isTutorial(key)) return true;
  const index = TUTORIAL_IDS.indexOf(key);
  return index === 0 || starsOf(progress, TUTORIAL_IDS[index - 1]) >= 1;
}

// ---- recording a result -------------------------------------------------------------------------------------

export interface RecordedResult {
  progress: Progress;
  xpGained: number;
  /** More stars than ever before in this level. */
  improved: boolean;
  /** The streak to show after this result. */
  streak: number;
  /** The tutorial this result opened, if it is the first completion of the one before it. */
  unlocked: TutorialId | null;
}

/** Applies a finished play. 0 stars (not covered) changes nothing. */
export function recordResult(progress: Progress, key: LevelKey, stars: Stars, today: string): RecordedResult {
  if (stars === 0) {
    return { progress, xpGained: 0, improved: false, streak: currentStreak(progress.streak, today), unlocked: null };
  }
  const before = starsOf(progress, key);
  const xpGained = xpEarned(before, stars);
  const streak = practiceDay(progress.streak, today);
  const next: Progress = {
    ...progress,
    xp: progress.xp + xpGained,
    streak,
    stars: { ...progress.stars, [key]: Math.max(before, stars) as Stars },
  };
  return {
    progress: next,
    xpGained,
    improved: stars > before,
    streak: streak.count,
    unlocked: before === 0 && isTutorial(key) ? nextTutorial(key) : null,
  };
}

/** Total stars earned over every level, for the header of the path. */
export const totalStars = (progress: Progress): number =>
  Object.values(progress.stars).reduce<number>((sum, value) => sum + (value ?? 0), 0);
