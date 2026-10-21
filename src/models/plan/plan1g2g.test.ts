import { describe, expect, it } from 'vitest';
import { LocalizedError } from '../../utils/localizedMessage';
import { COURSE_1G, COURSE_2G } from './presets';
import { calculatePlan1g2g } from './plan1g2g';

// The reference numbers below were computed apart (Python: Erlang B recursion +
// bisection, Okumura-Hata closed-form inverse, ceil) -- an independent
// re-derivation, NOT the course's printed figures, which round (47 Erl, Sc=7 km^2...).
// Where the app and the course differ the difference is spelled out in the test.

describe('calculatePlan1g2g -- 1G, the course example (diap. 44-45)', () => {
  const plan = calculatePlan1g2g(COURSE_1G);

  it('scenario and spectrum: A_T = 250 Erl, 416 channels, 59 per cell', () => {
    expect(plan.totalTrafficErlangs).toBe(250);
    expect(plan.frequencyPlan.totalChannels).toBe(416);
    expect(plan.frequencyPlan.channelsPerCell).toBe(59);
  });

  it('capacity: A_c = B^-1(59, 2%) = 48.700 Erl (course prints 47: rounded table) -> 6 cells (course: 6)', () => {
    expect(plan.dimensioning.trafficPerCellErlangs).toBeCloseTo(48.7004, 3);
    expect(plan.dimensioning.cellsByCapacity).toBe(6);
  });

  it('coverage: MAPL 143 dB (course states 141, an open discrepancy), R = 2.899 km, 2 cells (course: 3)', () => {
    expect(plan.dimensioning.maplDb).toBe(143);
    expect(plan.dimensioning.cellRadiusKm).toBeCloseTo(2.8994, 3);
    expect(plan.dimensioning.cellsByCoverage).toBe(2);
  });

  it('result: 6 cells, limited by capacity -- the course reaches the same conclusion', () => {
    expect(plan.cellsFinal).toBe(6);
    expect(plan.bindingConstraint).toBe('capacity');
  });

  it('900 MHz selects Okumura-Hata, in range, with no warnings', () => {
    expect(plan.propagationModel).toEqual({ modelId: 'hata', inRange: true, outsideByMHz: 0 });
    expect(plan.warnings).toEqual([]);
  });

  it('echoes S_T and N for the next stage (geometry / the game)', () => {
    expect(plan.totalAreaKm2).toBe(50);
    expect(plan.clusterSize).toBe(7);
  });
});

describe('calculatePlan1g2g -- 2G, the course example (diap. 46)', () => {
  const plan = calculatePlan1g2g(COURSE_2G);

  it('spectrum: 40 carriers, 10 TRX per cell, 70 TCH per cell', () => {
    expect(plan.frequencyPlan.carriers).toBe(40);
    expect(plan.frequencyPlan.transceiversPerCell).toBe(10);
    expect(plan.frequencyPlan.channelsPerCell).toBe(70);
  });

  it('capacity: A_c = B^-1(70, 2%) = 59.129 Erl (course prints 57) -> 5 cells (course: 5)', () => {
    expect(plan.dimensioning.trafficPerCellErlangs).toBeCloseTo(59.1291, 3);
    expect(plan.dimensioning.cellsByCapacity).toBe(5);
  });

  it('coverage: MAPL = 133 dB exactly as the course (EIRP derived as 30+0-3 = 27 dBm)', () => {
    expect(plan.dimensioning.eirpDbm).toBe(27);
    expect(plan.dimensioning.maplDb).toBe(133);
    expect(plan.dimensioning.cellRadiusKm).toBeCloseTo(1.508, 3);
  });

  it('coverage cells: 50 / (pi*R^2) = 6.998 -> 7; the course gets 8 only because it rounds Sc to 7 km^2', () => {
    // Knife-edge: 6.998 is 0.002 below 7. The app does not round the intermediate
    // radius/area the way the slide does, so it reports 7 where the slide says 8.
    expect(scenarioRatio(plan)).toBeCloseTo(6.998, 2);
    expect(plan.dimensioning.cellsByCoverage).toBe(7);
  });

  it('result: 7 cells, limited by coverage -- same binding constraint as the course (which says 8)', () => {
    expect(plan.cellsFinal).toBe(7);
    expect(plan.bindingConstraint).toBe('coverage');
  });
});

function scenarioRatio(plan: ReturnType<typeof calculatePlan1g2g>): number {
  return plan.totalAreaKm2 / plan.dimensioning.cellAreaKm2;
}

describe('calculatePlan1g2g -- model selection and validation', () => {
  it('at 1800 MHz the model switches to COST-231-Hata, in range', () => {
    const plan = calculatePlan1g2g({ ...COURSE_1G, coverage: { ...COURSE_1G.coverage, frequencyMHz: 1800 } });
    expect(plan.propagationModel).toEqual({ modelId: 'cost231-hata', inRange: true, outsideByMHz: 0 });
    expect(plan.warnings).toEqual([]);
  });

  it('at 2100 MHz it uses COST-231-Hata and returns a structured out-of-range warning', () => {
    const plan = calculatePlan1g2g({ ...COURSE_1G, coverage: { ...COURSE_1G.coverage, frequencyMHz: 2100 } });
    expect(plan.propagationModel.modelId).toBe('cost231-hata');
    expect(plan.propagationModel.inRange).toBe(false);
    expect(plan.warnings).toEqual([
      {
        key: 'warnings.modelOutOfRange',
        params: { model: { key: 'models.cost231-hata.label' }, frequency: 2100, min: 1500, max: 2000 },
      },
    ]);
  });

  it('rejects an invalid scenario or cluster size with LocalizedError', () => {
    expect(() => calculatePlan1g2g({ ...COURSE_1G, scenario: { ...COURSE_1G.scenario, users: 0 } })).toThrow(LocalizedError);
    expect(() => calculatePlan1g2g({ ...COURSE_1G, scenario: { ...COURSE_1G.scenario, totalAreaKm2: -5 } })).toThrow(LocalizedError);
    expect(() => calculatePlan1g2g({ ...COURSE_1G, scenario: { ...COURSE_1G.scenario, targetGoS: 1 } })).toThrow(LocalizedError);
    expect(() =>
      calculatePlan1g2g({ ...COURSE_1G, spectrum: { ...COURSE_1G.spectrum, clusterSize: 5 } })
    ).toThrow(LocalizedError);
  });

  it('more users never reduce the cells needed (monotonic)', () => {
    const small = calculatePlan1g2g({ ...COURSE_1G, scenario: { ...COURSE_1G.scenario, users: 1000 } });
    const large = calculatePlan1g2g({ ...COURSE_1G, scenario: { ...COURSE_1G.scenario, users: 20000 } });
    expect(large.cellsFinal).toBeGreaterThanOrEqual(small.cellsFinal);
    // 25 Erl / 48.7 -> 1 cell by capacity < 2 by coverage: few users make coverage the binding limit
    expect(small.bindingConstraint).toBe('coverage');
    expect(small.cellsFinal).toBe(2);
    expect(large.bindingConstraint).toBe('capacity');
  });
});
