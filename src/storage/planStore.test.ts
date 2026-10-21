import { describe, expect, it } from 'vitest';
import { COURSE_1G, COURSE_2G, COURSE_3G } from '../models/plan';
import {
  PLAN_STORAGE_KEY,
  PLAN_STORAGE_VERSION,
  clearPlans,
  emptyPlans,
  loadPlans,
  parseStoredPlans,
  savePlans,
  serializePlans,
} from './planStore';
import type { KeyValueStorage, StoredPlans } from './planStore';

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

// Deep copies: the presets are shared module constants, and several tests below
// deliberately damage what they get. Mutating a shared preset would poison every test after it.
const sample = (): StoredPlans =>
  structuredClone({
    version: PLAN_STORAGE_VERSION,
    active: '2g',
    plans: {
      '1g': { inputs: COURSE_1G, step: 3, snapshot: { cellsFinal: 6, computedAt: '2026-10-21T10:00:00.000Z' } },
      '2g': { inputs: COURSE_2G, step: 5, snapshot: null },
      '3g': { inputs: COURSE_3G, step: 1, snapshot: { cellsFinal: null, computedAt: '2026-10-21T11:00:00.000Z' } },
    },
  } as StoredPlans);

describe('save / load round trip', () => {
  it('what is saved is exactly what is loaded back', async () => {
    const storage = memoryStorage();
    expect(await savePlans(storage, sample())).toBe(true);
    expect(await loadPlans(storage)).toEqual(sample());
  });

  it('an empty device loads as no plans', async () => {
    expect(await loadPlans(memoryStorage())).toEqual(emptyPlans());
  });

  it('clearPlans removes the saved plans', async () => {
    const storage = memoryStorage();
    await savePlans(storage, sample());
    await clearPlans(storage);
    expect(storage.data[PLAN_STORAGE_KEY]).toBeUndefined();
    expect(await loadPlans(storage)).toEqual(emptyPlans());
  });
});

describe('a broken save never breaks the app', () => {
  it('corrupt JSON -> empty', () => {
    expect(parseStoredPlans('{not json')).toEqual(emptyPlans());
    expect(parseStoredPlans('')).toEqual(emptyPlans());
    expect(parseStoredPlans('null')).toEqual(emptyPlans());
    expect(parseStoredPlans('[1,2,3]')).toEqual(emptyPlans());
  });

  it('another version -> empty (a future or past format is not guessed at)', () => {
    expect(parseStoredPlans(JSON.stringify({ ...sample(), version: 99 }))).toEqual(emptyPlans());
    expect(parseStoredPlans(JSON.stringify({ ...sample(), version: undefined }))).toEqual(emptyPlans());
  });

  it('one damaged plan is dropped, the others survive', () => {
    const damaged = sample() as unknown as { plans: Record<string, Record<string, unknown>> };
    delete (damaged.plans['1g'].inputs as Record<string, unknown>).scenario;
    const parsed = parseStoredPlans(JSON.stringify(damaged));
    expect(parsed.plans['1g']).toBeUndefined();
    expect(parsed.plans['2g']).toBeDefined();
    expect(parsed.plans['3g']).toBeDefined();
  });

  it('wrong types inside a plan drop it (a string where a number belongs, a bad enum, a NaN-ish value)', () => {
    const mutate = (change: (plans: any) => void) => {
      const copy = JSON.parse(serializePlans(sample()));
      change(copy.plans);
      return parseStoredPlans(JSON.stringify(copy));
    };
    expect(mutate((p) => (p['1g'].inputs.scenario.users = '10000')).plans['1g']).toBeUndefined();
    expect(mutate((p) => (p['1g'].inputs.coverage.environment = 'moon')).plans['1g']).toBeUndefined();
    expect(mutate((p) => (p['1g'].inputs.coverage.linkBudget.bodyLossDb = null)).plans['1g']).toBeUndefined();
    expect(mutate((p) => (p['3g'].inputs.users = null)).plans['3g']).toBeUndefined();
  });

  it('a 1G plan stored under the 2G slot (or vice versa) is rejected', () => {
    const copy = JSON.parse(serializePlans(sample()));
    copy.plans['2g'].inputs = copy.plans['1g'].inputs;
    expect(parseStoredPlans(JSON.stringify(copy)).plans['2g']).toBeUndefined();
  });

  it('the active generation is kept only if that plan survived', () => {
    const copy = JSON.parse(serializePlans(sample()));
    copy.active = '2g';
    copy.plans['2g'].inputs = { nonsense: true };
    expect(parseStoredPlans(JSON.stringify(copy)).active).toBeNull();
    copy.active = 'bogus';
    expect(parseStoredPlans(JSON.stringify(copy)).active).toBeNull();
  });

  it('the step is clamped to the wizard length and defaults to 0', () => {
    const copy = JSON.parse(serializePlans(sample()));
    copy.plans['1g'].step = 99;
    copy.plans['3g'].step = -4;
    copy.plans['2g'].step = 'x';
    const parsed = parseStoredPlans(JSON.stringify(copy));
    expect(parsed.plans['1g']?.step).toBe(5); // 6 steps -> last index
    expect(parsed.plans['3g']?.step).toBe(0);
    expect(parsed.plans['2g']?.step).toBe(0);
  });

  it('a damaged snapshot is ignored without losing the plan', () => {
    const copy = JSON.parse(serializePlans(sample()));
    copy.plans['1g'].snapshot = { cellsFinal: 'six' };
    expect(parseStoredPlans(JSON.stringify(copy)).plans['1g']?.snapshot).toBeNull();
  });

  it('storage that throws on read yields an empty set; on write yields false', async () => {
    const broken: KeyValueStorage = {
      getItem: async () => {
        throw new Error('blocked');
      },
      setItem: async () => {
        throw new Error('quota');
      },
      removeItem: async () => {
        throw new Error('blocked');
      },
    };
    expect(await loadPlans(broken)).toEqual(emptyPlans());
    expect(await savePlans(broken, sample())).toBe(false);
    await expect(clearPlans(broken)).resolves.toBeUndefined();
  });
});
