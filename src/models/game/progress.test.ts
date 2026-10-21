import { describe, expect, it } from 'vitest';
import {
  LEVEL_XP_BASE,
  XP_PER_STAR,
  currentStreak,
  dayKey,
  emptyProgress,
  isUnlocked,
  practiceDay,
  previousDay,
  recordResult,
  starsOf,
  totalStars,
  xpEarned,
} from './progress';
import type { Progress, Stars } from './progress';

describe('xpEarned', () => {
  it('the first completion gives the base plus 15 per star', () => {
    expect(xpEarned(0, 1)).toBe(LEVEL_XP_BASE + XP_PER_STAR);
    expect(xpEarned(0, 3)).toBe(LEVEL_XP_BASE + 3 * XP_PER_STAR);
  });

  it('an improvement gives 15 per new star only', () => {
    expect(xpEarned(1, 3)).toBe(2 * XP_PER_STAR);
    expect(xpEarned(2, 3)).toBe(XP_PER_STAR);
  });

  it('replaying without improving gives nothing: the numbers cannot be farmed', () => {
    expect(xpEarned(2, 2)).toBe(0);
    expect(xpEarned(3, 1)).toBe(0);
    expect(xpEarned(0, 0)).toBe(0);
  });

  it('three stars add up to the same XP however they were reached', () => {
    const oneGo = xpEarned(0, 3);
    const inSteps = xpEarned(0, 1) + xpEarned(1, 2) + xpEarned(2, 3);
    expect(inSteps).toBe(oneGo);
  });
});

describe('days', () => {
  it('formats the local calendar day with zero padding', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(dayKey(new Date(2026, 9, 21))).toBe('2026-10-21');
  });

  it('the previous day crosses month, year and leap-day boundaries', () => {
    expect(previousDay('2026-10-21')).toBe('2026-10-20');
    expect(previousDay('2026-03-01')).toBe('2026-02-28');
    expect(previousDay('2028-03-01')).toBe('2028-02-29');
    expect(previousDay('2027-01-01')).toBe('2026-12-31');
  });
});

describe('streak', () => {
  it('the first day starts a streak of 1', () => {
    expect(practiceDay({ count: 0, lastDay: null }, '2026-10-21')).toEqual({ count: 1, lastDay: '2026-10-21' });
  });

  it('the next day adds one, including across a month boundary', () => {
    expect(practiceDay({ count: 4, lastDay: '2026-10-31' }, '2026-11-01')).toEqual({ count: 5, lastDay: '2026-11-01' });
  });

  it('twice on the same day changes nothing', () => {
    const streak = { count: 4, lastDay: '2026-10-21' };
    expect(practiceDay(streak, '2026-10-21')).toBe(streak);
  });

  it('a missed day starts over at 1', () => {
    expect(practiceDay({ count: 9, lastDay: '2026-10-18' }, '2026-10-21')).toEqual({ count: 1, lastDay: '2026-10-21' });
  });

  it('a last day in the future (clock moved back, travelling) neither adds nor takes away', () => {
    const streak = { count: 6, lastDay: '2026-10-22' };
    expect(practiceDay(streak, '2026-10-21')).toBe(streak);
    expect(currentStreak(streak, '2026-10-21')).toBe(6);
  });

  it('shows a streak as broken once a whole day has passed without playing, even though it is still stored', () => {
    const streak = { count: 5, lastDay: '2026-10-19' };
    expect(currentStreak(streak, '2026-10-19')).toBe(5);
    expect(currentStreak(streak, '2026-10-20')).toBe(5); // yesterday still counts: today can still extend it
    expect(currentStreak(streak, '2026-10-21')).toBe(0);
    expect(currentStreak({ count: 0, lastDay: null }, '2026-10-21')).toBe(0);
  });
});

describe('unlocking', () => {
  it('only the first tutorial is open at the start; the missions are always open', () => {
    const start = emptyProgress();
    expect(isUnlocked(start, 'hexagon')).toBe(true);
    expect(isUnlocked(start, 'patch')).toBe(false);
    expect(isUnlocked(start, 'reuse')).toBe(false);
    expect(isUnlocked(start, 'mission-1g')).toBe(true);
    expect(isUnlocked(start, 'mission-3g')).toBe(true);
  });

  it('a tutorial opens with one star on the one before', () => {
    const progress: Progress = { ...emptyProgress(), stars: { hexagon: 1 } };
    expect(isUnlocked(progress, 'patch')).toBe(true);
    expect(isUnlocked(progress, 'cluster')).toBe(false);
  });
});

describe('recordResult', () => {
  const today = '2026-10-21';

  it('not covered (0 stars) changes nothing, not even the streak', () => {
    const start = emptyProgress();
    const result = recordResult(start, 'hexagon', 0, today);
    expect(result.progress).toBe(start);
    expect(result.xpGained).toBe(0);
    expect(result.improved).toBe(false);
    expect(result.unlocked).toBeNull();
  });

  it('the first completion earns XP, a star, a streak day and opens the next tutorial', () => {
    const result = recordResult(emptyProgress(), 'hexagon', 2, today);
    expect(result.xpGained).toBe(LEVEL_XP_BASE + 2 * XP_PER_STAR);
    expect(result.progress.xp).toBe(result.xpGained);
    expect(starsOf(result.progress, 'hexagon')).toBe(2);
    expect(result.improved).toBe(true);
    expect(result.streak).toBe(1);
    expect(result.unlocked).toBe('patch');
  });

  it('keeps the best stars: a worse replay never lowers them', () => {
    const first = recordResult(emptyProgress(), 'patch', 3, today).progress;
    const replay = recordResult(first, 'patch', 1, today);
    expect(starsOf(replay.progress, 'patch')).toBe(3);
    expect(replay.xpGained).toBe(0);
    expect(replay.improved).toBe(false);
    expect(replay.unlocked).toBeNull();
  });

  it('does not announce an unlock again on a replay', () => {
    const first = recordResult(emptyProgress(), 'hexagon', 1, today).progress;
    expect(recordResult(first, 'hexagon', 3, today).unlocked).toBeNull();
  });

  it('the last tutorial and the missions unlock nothing', () => {
    expect(recordResult(emptyProgress(), 'reuse', 3, today).unlocked).toBeNull();
    expect(recordResult(emptyProgress(), 'mission-2g', 3, today).unlocked).toBeNull();
  });

  it('missions keep their stars per generation', () => {
    let progress = recordResult(emptyProgress(), 'mission-1g', 3, today).progress;
    progress = recordResult(progress, 'mission-3g', 1, today).progress;
    expect(starsOf(progress, 'mission-1g')).toBe(3);
    expect(starsOf(progress, 'mission-2g')).toBe(0);
    expect(starsOf(progress, 'mission-3g')).toBe(1);
    expect(totalStars(progress)).toBe(4);
  });

  it('a replay on the same day does not add a streak day', () => {
    const first = recordResult(emptyProgress(), 'hexagon', 1, today).progress;
    expect(recordResult(first, 'hexagon', 2, today).streak).toBe(1);
  });

  it('never returns more than three stars even for odd input', () => {
    const stars = 3 as Stars;
    expect(starsOf(recordResult(emptyProgress(), 'hexagon', stars, today).progress, 'hexagon')).toBe(3);
  });
});
