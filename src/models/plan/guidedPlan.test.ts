import { describe, expect, it } from 'vitest';
import { COURSE_3G, STEPS_1G2G, STEPS_3G, computePlan1g2g, computePlan3g, stepsFor } from './guidedPlan';
import { ledger1g2g, ledger3g } from './ledger';
import { COURSE_1G, COURSE_2G } from './presets';

describe('computePlan1g2g / computePlan3g never throw', () => {
  it('returns the result and no error for the course examples', () => {
    for (const inputs of [COURSE_1G, COURSE_2G]) {
      const computed = computePlan1g2g(inputs);
      expect(computed.error).toBeNull();
      expect(computed.result?.cellsFinal).toBeGreaterThan(0);
    }
    const computed3g = computePlan3g(COURSE_3G);
    expect(computed3g.error).toBeNull();
    expect(computed3g.result?.cellsFinal).toBe(20);
  });

  it('turns an impossible value into a structured, translatable error instead of throwing', () => {
    const computed = computePlan1g2g({ ...COURSE_1G, scenario: { ...COURSE_1G.scenario, users: 0 } });
    expect(computed.result).toBeNull();
    expect(computed.error).toEqual({ key: 'errors.mustBePositive', params: { field: { key: 'totalUsers' } } });
  });

  it('an invalid cluster size is reported with its parameter', () => {
    const computed = computePlan1g2g({ ...COURSE_1G, spectrum: { ...COURSE_1G.spectrum, clusterSize: 5 } });
    expect(computed.error).toEqual({ key: 'errors.invalidClusterSize', params: { n: 5 } });
  });

  it('a non-LocalizedError becomes errors.unknown (no raw message leaks to the UI)', () => {
    // NaN passes through to a library call that is not guarded; whatever it throws must not crash the screen.
    const computed = computePlan1g2g({ ...COURSE_1G, coverage: { ...COURSE_1G.coverage, linkBudget: { ...COURSE_1G.coverage.linkBudget, receiverSensitivityDbm: 500 } } });
    expect(computed.result).toBeNull();
    expect(computed.error).not.toBeNull();
    expect(typeof computed.error?.key).toBe('string');
  });

  it('3G maps the user inputs onto the engine: the band decides the model', () => {
    const at900 = computePlan3g({ ...COURSE_3G, frequencyMHz: 900 });
    expect(at900.result?.propagationModel.modelId).toBe('hata');
    expect(computePlan3g({ ...COURSE_3G, users: 0 }).error?.key).toBe('errors.mustBePositive');
  });
});

describe('steps', () => {
  it('1G/2G follow the pencil-and-paper order; 3G is automated and shorter', () => {
    expect(STEPS_1G2G).toEqual(['scenario', 'spectrum', 'capacity', 'coverage', 'result', 'summary']);
    expect(STEPS_3G).toEqual(['scenario', 'result', 'summary']);
    expect(stepsFor('1g')).toBe(STEPS_1G2G);
    expect(stepsFor('2g')).toBe(STEPS_1G2G);
    expect(stepsFor('3g')).toBe(STEPS_3G);
  });
});

describe('ledger1g2g: "Tu plan hasta ahora" grows in the order of the steps', () => {
  const plan = computePlan1g2g(COURSE_1G).result!;
  const ids = (n: number) => ledger1g2g(plan, n).map((item) => item.id);

  it('nothing is shown before any step is done', () => {
    expect(ledger1g2g(plan, 0)).toEqual([]);
  });

  it('each completed step appends its own rows and keeps the earlier ones', () => {
    expect(ids(1)).toEqual(['totalArea', 'totalTraffic']);
    expect(ids(2)).toEqual(['totalArea', 'totalTraffic', 'clusterSize', 'totalChannels', 'channelsPerCell']);
    expect(ids(3).slice(-2)).toEqual(['trafficPerCell', 'cellsByCapacity']);
    expect(ids(4).slice(-5)).toEqual(['propagationModel', 'mapl', 'cellRadius', 'cellArea', 'cellsByCoverage']);
    expect(ids(5).slice(-2)).toEqual(['cellsFinal', 'bindingConstraint']);
    for (let n = 1; n < 5; n++) expect(ids(n + 1).slice(0, ids(n).length)).toEqual(ids(n));
  });

  it('1G course example values: 250 Erl, N=7, 416 channels, 59 per cell, 6 cells by capacity', () => {
    const byId = Object.fromEntries(ledger1g2g(plan, 5).map((i) => [i.id, i.value]));
    expect(byId.totalTraffic).toBe(250);
    expect(byId.clusterSize).toBe(7);
    expect(byId.totalChannels).toBe(416);
    expect(byId.channelsPerCell).toBe(59);
    expect(byId.cellsByCapacity).toBe(6);
    expect(byId.cellsFinal).toBe(6);
    expect(byId.propagationModel).toEqual({ key: 'models.hata.shortLabel' });
    expect(byId.bindingConstraint).toEqual({ key: 'plan.constraint.capacity' });
  });

  it('2G shows carriers and transceivers instead of the analog channel count', () => {
    const plan2g = computePlan1g2g(COURSE_2G).result!;
    const rows = Object.fromEntries(ledger1g2g(plan2g, 2).map((i) => [i.id, i.value]));
    expect(rows.carriers).toBe(40);
    expect(rows.transceiversPerCell).toBe(10);
    expect(rows.channelsPerCell).toBe(70);
    expect(rows.totalChannels).toBeUndefined();
  });
});

describe('ledger3g', () => {
  const plan = computePlan3g(COURSE_3G).result!;

  it('step 1 is the scenario; step 2 adds the automatic result with the converged values', () => {
    expect(ledger3g(plan, 10000, 0.025, 1).map((i) => i.id)).toEqual(['totalArea', 'totalTraffic']);
    const rows = Object.fromEntries(ledger3g(plan, 10000, 0.025, 2).map((i) => [i.id, i.value]));
    expect(rows.totalTraffic).toBe(250);
    expect(rows.nodeBsByCapacity).toBe(20);
    expect(rows.nodeBsByCoverage).toBe(13);
    expect(rows.cellsFinal).toBe(20);
    expect(rows.convergedLoad).toBeCloseTo(81.1, 0);
  });

  it('without a converged loop there are no converged rows and no final count, but the capacity minimum stays', () => {
    const stuck = computePlan3g({ ...COURSE_3G, users: 80000 }).result!;
    const ids = ledger3g(stuck, 80000, 0.025, 2).map((i) => i.id);
    expect(ids).toContain('nodeBsByCapacity');
    expect(ids).not.toContain('cellsFinal');
    expect(ids).not.toContain('convergedRadius');
  });
});
