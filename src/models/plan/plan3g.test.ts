import { describe, expect, it } from 'vitest';
import { LocalizedError } from '../../utils/localizedMessage';
import { calculatePlan3g } from './plan3g';

// Reference values were computed apart (an independent Python re-implementation of
// the damped cell-breathing loop with the closed-form COST-231-Hata inverse), not
// taken from the course: the course's own iteration (R=1.07 km, eta=54 %) depends
// on a users->load conversion that is not documented (see wcdma.ts).
const COURSE_3G = { totalAreaKm2: 50, users: 10000, erlangPerUser: 0.025 };

describe('calculatePlan3g -- three inputs, everything else from the course example', () => {
  const plan = calculatePlan3g(COURSE_3G);

  it('uses COST-231-Hata at 2100 MHz (100 MHz out of range) -- plain Hata would not converge', () => {
    expect(plan.propagationModel).toEqual({ modelId: 'cost231-hata', inRange: false, outsideByMHz: 100 });
  });

  it('converges with the defaults (it did not when the screen defaulted to plain Hata)', () => {
    expect(plan.converged).toBe(true);
    expect(plan.wcdma.iterations.length - 1).toBe(6);
    expect(plan.wcdma.finalRadiusKm).toBeCloseTo(1.256, 2);
    expect(plan.wcdma.finalLoad).toBeCloseTo(0.811, 2);
  });

  it('N_max = 12.62 users per cell (the diap. 67 equation; the course states 9, see wcdma.ts)', () => {
    expect(plan.wcdma.maxSimultaneousUsersPerCell).toBeCloseTo(12.62, 2);
  });

  it('NodeBs: 13 by coverage, 20 by capacity -> 20, limited by capacity', () => {
    expect(plan.wcdma.nodeBsByCoverage).toBe(13);
    expect(plan.wcdma.nodeBsByCapacity).toBe(20);
    expect(plan.cellsFinal).toBe(20);
    expect(plan.bindingConstraint).toBe('capacity');
  });

  it('frequency reuse in 3G is 1: the cluster is a single cell', () => {
    expect(plan.clusterSize).toBe(1);
    expect(plan.generation).toBe('3g');
  });

  it('warns that the model is out of range and that only the uplink was evaluated -- as structured messages', () => {
    expect(plan.warnings.map((w) => w.key)).toEqual(['warnings.modelOutOfRange', 'warnings.uplinkOnly']);
    expect(plan.warnings[0].params).toEqual({
      model: { key: 'models.cost231-hata.label' },
      frequency: 2100,
      min: 1500,
      max: 2000,
    });
  });
});

describe('calculatePlan3g -- overrides and failure modes', () => {
  it('an advanced override is honoured: at 900 MHz the model becomes Hata, in range, with no range warning', () => {
    const plan = calculatePlan3g({ ...COURSE_3G, advanced: { frequencyMHz: 900 } });
    expect(plan.propagationModel).toEqual({ modelId: 'hata', inRange: true, outsideByMHz: 0 });
    expect(plan.warnings.map((w) => w.key)).not.toContain('warnings.modelOutOfRange');
  });

  it('a loop that cannot settle gives NO final count (null), not a made-up one, and says so', () => {
    const plan = calculatePlan3g({ ...COURSE_3G, advanced: { maxIterations: 1 } });
    expect(plan.converged).toBe(false);
    expect(plan.cellsFinal).toBeNull();
    expect(plan.bindingConstraint).toBeNull();
    expect(plan.warnings.map((w) => w.key)).toContain('warnings.cellBreathingNotConverged');
  });

  it('more users never reduce the NodeBs needed', () => {
    const few = calculatePlan3g({ ...COURSE_3G, users: 5000 });
    const many = calculatePlan3g({ ...COURSE_3G, users: 15000 });
    expect(many.cellsFinal as number).toBeGreaterThanOrEqual(few.cellsFinal as number);
  });

  it('the course density settles on the first, default step (0.3)', () => {
    expect(calculatePlan3g(COURSE_3G).dampingFactorUsed).toBe(0.3);
  });

  it('a denser scenario that oscillates at step 0.3 is retried with a smaller step and reaches the same kind of result', () => {
    const dense = calculatePlan3g({ ...COURSE_3G, users: 20000 });
    expect(dense.converged).toBe(true);
    expect(dense.dampingFactorUsed).toBe(0.1);
    expect(dense.wcdma.finalRadiusKm).toBeCloseTo(0.95, 2);
    expect(dense.cellsFinal).toBe(40);
  });

  it('the retry finds the same fixed point as a smaller step fixed by the caller (15 000 users: 1.075 km)', () => {
    const viaDefault = calculatePlan3g({ ...COURSE_3G, users: 15000 });
    const viaSmallStep = calculatePlan3g({ ...COURSE_3G, users: 15000, advanced: { dampingFactor: 0.1, maxIterations: 300 } });
    expect(viaDefault.wcdma.finalRadiusKm).toBeCloseTo(viaSmallStep.wcdma.finalRadiusKm as number, 2);
  });

  it('when even the smallest step cannot settle, there is no final count but the capacity minimum is still given', () => {
    const extreme = calculatePlan3g({ ...COURSE_3G, users: 80000 });
    expect(extreme.converged).toBe(false);
    expect(extreme.cellsFinal).toBeNull();
    expect(extreme.minCellsByCapacity).toBe(159);
    expect(extreme.dampingFactorUsed).toBe(0.03);
  });

  it('caller-fixed loop parameters are respected: no retries', () => {
    const plan = calculatePlan3g({ ...COURSE_3G, users: 20000, advanced: { dampingFactor: 0.3 } });
    expect(plan.dampingFactorUsed).toBe(0.3);
    expect(plan.converged).toBe(false); // would have settled with a smaller step, but it was fixed
  });

  it('rejects non-positive inputs with LocalizedError', () => {
    expect(() => calculatePlan3g({ ...COURSE_3G, users: 0 })).toThrow(LocalizedError);
    expect(() => calculatePlan3g({ ...COURSE_3G, totalAreaKm2: 0 })).toThrow(LocalizedError);
    expect(() => calculatePlan3g({ ...COURSE_3G, erlangPerUser: -1 })).toThrow(LocalizedError);
  });
});
