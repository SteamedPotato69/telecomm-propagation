import { describe, expect, it } from 'vitest';
import { recommendInvertibleModel } from './modelSelection';
import { PROPAGATION_MODEL_LIST } from './registry';
import type { PropagationInputs } from './types';

describe('recommendInvertibleModel', () => {
  it('900 MHz -> Okumura-Hata, in range', () => {
    expect(recommendInvertibleModel(900)).toEqual({ modelId: 'hata', inRange: true, outsideByMHz: 0 });
  });

  it('1800 MHz -> COST-231-Hata, in range', () => {
    expect(recommendInvertibleModel(1800)).toEqual({ modelId: 'cost231-hata', inRange: true, outsideByMHz: 0 });
  });

  it('exactly 1500 MHz is in both ranges: the first in registry order (Hata) wins', () => {
    expect(recommendInvertibleModel(1500).modelId).toBe('hata');
  });

  it('2100 MHz (the course\'s 3G example, diap. 72) -> COST-231-Hata, flagged 100 MHz out of range', () => {
    // Plain Hata at 2100 MHz is 600 MHz out of range -- and is what made the
    // WCDMA screen's cell-breathing loop fail to converge by default.
    expect(recommendInvertibleModel(2100)).toEqual({ modelId: 'cost231-hata', inRange: false, outsideByMHz: 100 });
  });

  it('below every range picks the nearest one', () => {
    expect(recommendInvertibleModel(100)).toEqual({ modelId: 'hata', inRange: false, outsideByMHz: 50 });
  });

  it('rejects a non-positive frequency', () => {
    expect(() => recommendInvertibleModel(0)).toThrow();
    expect(() => recommendInvertibleModel(Number.NaN)).toThrow();
  });
});

describe('frequencyRangeMHz is the same constant the model\'s warning uses', () => {
  const base: PropagationInputs = {
    frequencyMHz: 900,
    distanceKm: 2,
    baseStationHeightM: 40,
    mobileHeightM: 5,
    citySize: 'small-medium',
    environment: 'urban',
    metropolitanCenter: false,
    // geometry fields so Walfisch-Bertoni accepts the inputs
    baseStationHeightAboveRoofM: 28,
    averageBuildingHeightM: 12,
    buildingSeparationM: 50,
  };
  const hasFrequencyWarning = (model: (typeof PROPAGATION_MODEL_LIST)[number], f: number) =>
    model.calculate({ ...base, frequencyMHz: f }).warnings.some((w) => w.field === 'frequencyMHz');

  const withRange = PROPAGATION_MODEL_LIST.filter((m) => m.frequencyRangeMHz);

  it('some models declare a range (guards against the field being silently dropped)', () => {
    expect(withRange.map((m) => m.id).sort()).toEqual(['cost231-hata', 'ecc33', 'hata', 'walfisch-bertoni']);
  });

  for (const model of withRange) {
    it(`${model.id}: no warning at the range limits, warning just outside`, () => {
      const [min, max] = model.frequencyRangeMHz!;
      expect(hasFrequencyWarning(model, Math.max(min, 1))).toBe(false);
      expect(hasFrequencyWarning(model, max)).toBe(false);
      expect(hasFrequencyWarning(model, max + 1)).toBe(true);
      if (min > 1) expect(hasFrequencyWarning(model, min - 1)).toBe(true);
    });
  }
});
