import { describe, expect, it } from 'vitest';
import { DEFAULT_SERVICE_MIX } from './presets';
import { calculateServiceLoad, calculateWcdmaUplinkLoad } from './wcdma';
import type { WcdmaCommonLinkBudget, WcdmaLoadInputs } from './types';

// docs/curso-referencia.md §13.4 (diap. 66/71-72, confirmed against the
// original PDF as genuine course material, not injected content).
const LINK_BUDGET: WcdmaCommonLinkBudget = {
  eirpDbm: 18,
  thermalNoiseDbm: -108.2,
  noiseFigureDb: 5.0,
  receiveAntennaGainDbi: 18,
  feederLossDb: 2,
  shadowFadingMarginDb: 8,
};

const [VOZ, PS64, PS384] = DEFAULT_SERVICE_MIX;

describe('calculateServiceLoad', () => {
  it('matches the course exactly on Gp and MAPL/sensitivity for all 3 services (diap. 66, 72)', () => {
    const voz = calculateServiceLoad(VOZ, 3.84, LINK_BUDGET);
    const ps64 = calculateServiceLoad(PS64, 3.84, LINK_BUDGET);
    const ps384 = calculateServiceLoad(PS384, 3.84, LINK_BUDGET);

    expect(voz.processingGainDb).toBeCloseTo(25.0, 1);
    expect(ps64.processingGainDb).toBeCloseTo(17.8, 1);
    expect(ps384.processingGainDb).toBeCloseTo(10.0, 1);

    expect(voz.sensitivityDbm).toBeCloseTo(-123.2, 1);
    expect(ps64.sensitivityDbm).toBeCloseTo(-117.5, 1);
    expect(ps384.sensitivityDbm).toBeCloseTo(-111.2, 1);

    expect(voz.maplZeroLoadDb).toBeCloseTo(152.2, 1);
    expect(ps64.maplZeroLoadDb).toBeCloseTo(145.0, 1);
    expect(ps384.maplZeroLoadDb).toBeCloseTo(137.2, 1);
  });

  it('matches the course exactly on load factor (rho) for PS64k and PS384k', () => {
    expect(calculateServiceLoad(PS64, 3.84, LINK_BUDGET).loadFactorPerUser).toBeCloseTo(0.0357, 3);
    expect(calculateServiceLoad(PS384, 3.84, LINK_BUDGET).loadFactorPerUser).toBeCloseTo(0.137, 3);
  });

  it('voice load factor does not reproduce the course-stated 0.0210 -- documents the actual formula result', () => {
    // With the table's own Eb/No=5dB, alpha=0.67, R=12.2kbps, the formula
    // that correctly reproduces PS64k/PS384k above gives 0.0148 for voice,
    // not the slide's stated 0.0210 -- no combination of the given inputs
    // was found that reproduces 0.0210. See wcdma.ts's doc comment.
    const voz = calculateServiceLoad(VOZ, 3.84, LINK_BUDGET);
    expect(voz.loadFactorPerUser).toBeCloseTo(0.0148, 3);
    expect(voz.loadFactorPerUser).not.toBeCloseTo(0.021, 3);
  });

  it('throws for a non-positive bit rate or activity factor', () => {
    expect(() => calculateServiceLoad({ ...VOZ, bitRateKbps: 0 }, 3.84, LINK_BUDGET)).toThrow();
    expect(() => calculateServiceLoad({ ...VOZ, activityFactor: 0 }, 3.84, LINK_BUDGET)).toThrow();
  });
});

// COST-231-Hata coefficients as literally stated on diap. 72 for this one
// exercise (f=2100MHz, hb=30m): L=148.0+34.1*log10(R). Distinct from this
// app's own cost231Hata.ts (textbook-general coefficients), which gives a
// meaningfully different R for the same MAPL -- see wcdma.ts's doc
// comment. Used here only to check the loop mechanics against numbers
// traceable to the exact source data, not to claim this app uses this
// formula anywhere else.
function slideCost231Shortcut(_inputs: unknown, targetLossDb: number): number {
  return Math.pow(10, (targetLossDb - 148.0) / 34.1);
}

function baseInputs(overrides: Partial<WcdmaLoadInputs> = {}): WcdmaLoadInputs {
  return {
    chipRateMcps: 3.84,
    services: DEFAULT_SERVICE_MIX,
    referenceServiceLabel: 'Voz AMR',
    interferenceFactor: 0.55,
    targetUplinkLoad: 0.5,
    linkBudget: LINK_BUDGET,
    propagationInputs: {
      frequencyMHz: 2100,
      baseStationHeightM: 30,
      mobileHeightM: 1.5,
      citySize: 'large',
      environment: 'urban',
      metropolitanCenter: true,
    },
    solveDistanceKm: slideCost231Shortcut,
    totalUsers: 10000,
    averageErlangPerUser: 0.025,
    totalAreaKm2: 50,
    ...overrides,
  };
}

describe('calculateWcdmaUplinkLoad', () => {
  it('N_max structurally matches eta_obj / (mix_rho * (1+i_oc)) using this module\'s own (formula-correct) rho values', () => {
    // Not the course's stated N_max=9: that used the course's own
    // (unreproduced) voice rho=0.0210. This module's mixLoadFactor uses
    // the formula-verified per-service rho values instead, so N_max
    // comes out at ~10.3, not 9 -- a downstream, documented consequence
    // of the voice-rho finding above, not a separate bug.
    const result = calculateWcdmaUplinkLoad(baseInputs());
    const expectedMix = 0.7 * 0.014773717572374763 + 0.2 * 0.03596990904719988 + 0.1 * 0.13680688860321003;
    expect(result.mixLoadFactor).toBeCloseTo(expectedMix, 6);
    expect(result.maxSimultaneousUsersPerCell).toBeCloseTo(0.5 / (expectedMix * 1.55), 6);
  });

  it('converges to a stable, physically sensible operating point (not the slide\'s specific R=1.07km/54%, see wcdma.ts)', () => {
    const result = calculateWcdmaUplinkLoad(baseInputs());
    expect(result.converged).toBe(true);
    // In the right ballpark of the course's R=1.07km/eta=54% (same order
    // of magnitude, same qualitative shrink-then-settle behavior) without
    // matching exactly -- the exact U_celda -> H_salida formula the course
    // used isn't reconstructable from the extracted material.
    expect(result.finalRadiusKm).not.toBeNull();
    expect(result.finalRadiusKm as number).toBeGreaterThan(0.5);
    expect(result.finalRadiusKm as number).toBeLessThan(1.35); // below the zero-load R=1.33km -- cell breathing must shrink it
    expect(result.finalLoad as number).toBeGreaterThan(0.3);
    expect(result.finalLoad as number).toBeLessThan(0.9);
  });

  it('radius shrinks monotonically from the zero-load value as load builds up (cell breathing)', () => {
    const result = calculateWcdmaUplinkLoad(baseInputs());
    const radii = result.iterations.map((step) => step.radiusKm);
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]).toBeLessThanOrEqual(radii[i - 1] + 1e-9);
    }
  });

  it('reports converged:false (not a thrown error) when maxIterations is too low to settle', () => {
    const result = calculateWcdmaUplinkLoad(baseInputs({ maxIterations: 1 }));
    expect(result.converged).toBe(false);
    expect(result.finalRadiusKm).toBeNull();
    expect(result.iterations.length).toBeGreaterThan(0);
  });

  it('nodeBsByCapacity is well-defined and traceable: ceil(totalUsers*avgErlang / maxSimultaneousUsersPerCell)', () => {
    const result = calculateWcdmaUplinkLoad(baseInputs());
    const totalTrafficErlangs = 10000 * 0.025;
    expect(result.nodeBsByCapacity).toBe(Math.ceil(totalTrafficErlangs / result.maxSimultaneousUsersPerCell));
  });

  it('nodeBsFinal is the max of capacity and coverage, with the correct binding constraint', () => {
    const result = calculateWcdmaUplinkLoad(baseInputs());
    expect(result.nodeBsFinal).toBe(Math.max(result.nodeBsByCapacity, result.nodeBsByCoverage as number));
    expect(result.bindingConstraint).toBe(
      result.nodeBsByCapacity >= (result.nodeBsByCoverage as number) ? 'capacity' : 'coverage'
    );
  });

  it('throws for a target load outside (0,1)', () => {
    expect(() => calculateWcdmaUplinkLoad(baseInputs({ targetUplinkLoad: 0 }))).toThrow();
    expect(() => calculateWcdmaUplinkLoad(baseInputs({ targetUplinkLoad: 1 }))).toThrow();
  });

  it('throws for a damping factor outside (0,1]', () => {
    expect(() => calculateWcdmaUplinkLoad(baseInputs({ dampingFactor: 0 }))).toThrow();
    expect(() => calculateWcdmaUplinkLoad(baseInputs({ dampingFactor: 1.5 }))).toThrow();
  });

  it('throws for an unknown reference service label', () => {
    expect(() => calculateWcdmaUplinkLoad(baseInputs({ referenceServiceLabel: 'No existe' }))).toThrow();
  });
});
