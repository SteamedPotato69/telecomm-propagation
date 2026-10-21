import { describe, expect, it } from 'vitest';
import { emptyProgress } from '../models/game/progress';
import type { Progress } from '../models/game/progress';
import type { KeyValueStorage } from './planStore';
import {
  PROGRESS_STORAGE_KEY,
  PROGRESS_STORAGE_VERSION,
  clearProgress,
  loadProgress,
  parseStoredProgress,
  saveProgress,
  serializeProgress,
} from './progressStore';

/** In-memory stand-in for AsyncStorage. */
function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: async (key) => (key in data ? data[key] : null),
    setItem: async (key, value) => {
      data[key] = value;
    },
    removeItem: async (key) => {
      delete data[key];
    },
  };
}

const sample = (): Progress => ({
  xp: 145,
  streak: { count: 4, lastDay: '2026-10-21' },
  stars: { hexagon: 3, patch: 2, 'mission-1g': 1 },
  effects: false,
});

const stored = (patch: Record<string, unknown>) =>
  JSON.stringify({ version: PROGRESS_STORAGE_VERSION, ...sample(), ...patch });

describe('save / load round trip', () => {
  it('what is saved is exactly what is loaded back', async () => {
    const storage = memoryStorage();
    expect(await saveProgress(storage, sample())).toBe(true);
    expect(await loadProgress(storage)).toEqual(sample());
  });

  it('an empty device loads as a fresh start (effects on by default)', async () => {
    expect(await loadProgress(memoryStorage())).toEqual(emptyProgress());
    expect(emptyProgress().effects).toBe(true);
  });

  it('clearProgress removes the saved progress', async () => {
    const storage = memoryStorage();
    await saveProgress(storage, sample());
    await clearProgress(storage);
    expect(PROGRESS_STORAGE_KEY in storage.data).toBe(false);
  });

  it('serialises with the version so a later format can be told apart', () => {
    expect(JSON.parse(serializeProgress(sample())).version).toBe(PROGRESS_STORAGE_VERSION);
  });
});

describe('tolerance to damaged data', () => {
  it('corrupt JSON -> fresh start', () => {
    expect(parseStoredProgress('{not json')).toEqual(emptyProgress());
    expect(parseStoredProgress('42')).toEqual(emptyProgress());
    expect(parseStoredProgress('[]')).toEqual(emptyProgress());
  });

  it('another version -> fresh start (a different format is not guessed at)', () => {
    expect(parseStoredProgress(stored({ version: 99 }))).toEqual(emptyProgress());
  });

  it('one bad field is dropped without losing the rest of what was earned', () => {
    const result = parseStoredProgress(stored({ xp: 'lots' }));
    expect(result.xp).toBe(0);
    expect(result.stars).toEqual(sample().stars);
    expect(result.streak).toEqual(sample().streak);
    expect(result.effects).toBe(false);
  });

  it('negative, fractional or non-finite numbers are not accepted as XP or as a streak', () => {
    expect(parseStoredProgress(stored({ xp: -5 })).xp).toBe(0);
    expect(parseStoredProgress(stored({ xp: 1.5 })).xp).toBe(0);
    expect(parseStoredProgress(stored({ streak: { count: -1, lastDay: '2026-10-21' } })).streak).toEqual(emptyProgress().streak);
  });

  it('an impossible calendar day drops the streak, and a real leap day is kept', () => {
    expect(parseStoredProgress(stored({ streak: { count: 3, lastDay: '2026-02-31' } })).streak).toEqual(emptyProgress().streak);
    expect(parseStoredProgress(stored({ streak: { count: 3, lastDay: 'yesterday' } })).streak).toEqual(emptyProgress().streak);
    expect(parseStoredProgress(stored({ streak: { count: 3, lastDay: '2028-02-29' } })).streak).toEqual({ count: 3, lastDay: '2028-02-29' });
    expect(parseStoredProgress(stored({ streak: { count: 3, lastDay: '2027-02-29' } })).streak).toEqual(emptyProgress().streak);
  });

  it('stars outside 0-3, for levels that do not exist or with the wrong type are ignored; valid ones survive', () => {
    const result = parseStoredProgress(
      stored({ stars: { hexagon: 9, patch: '2', cluster: 2, nowhere: 3, 'mission-2g': 3, reuse: 0 } })
    );
    expect(result.stars).toEqual({ cluster: 2, 'mission-2g': 3 });
  });

  it('effects must be a boolean, otherwise the default (on) is kept', () => {
    expect(parseStoredProgress(stored({ effects: 'no' })).effects).toBe(true);
    expect(parseStoredProgress(stored({ effects: false })).effects).toBe(false);
  });

  it('storage that throws on read yields a fresh start; on write yields false', async () => {
    const broken: KeyValueStorage = {
      getItem: async () => {
        throw new Error('blocked');
      },
      setItem: async () => {
        throw new Error('full');
      },
      removeItem: async () => {
        throw new Error('blocked');
      },
    };
    expect(await loadProgress(broken)).toEqual(emptyProgress());
    expect(await saveProgress(broken, sample())).toBe(false);
    await expect(clearProgress(broken)).resolves.toBeUndefined();
  });
});
