import { describe, expect, it } from 'vitest';
import { calculateCellularGeometry } from './geometry';
import { isValidRhombicNumber } from './rhombicNumbers';

describe('isValidRhombicNumber', () => {
  it('accepts every N from the course table (§13.1, diap. 23)', () => {
    for (const n of [3, 4, 7, 9, 12, 13]) {
      expect(isValidRhombicNumber(n)).toBe(true);
    }
  });

  it('accepts valid Loschian numbers not listed in the course table', () => {
    // The slide only shows a handful of examples, not the full set -- the
    // membership test is i^2+i*j+j^2, so these must pass too.
    expect(isValidRhombicNumber(1)).toBe(true);
    expect(isValidRhombicNumber(16)).toBe(true);
    expect(isValidRhombicNumber(19)).toBe(true);
    expect(isValidRhombicNumber(21)).toBe(true);
  });

  it('rejects cluster sizes that are not geometrically possible', () => {
    for (const n of [2, 5, 6, 8, 10, 11]) {
      expect(isValidRhombicNumber(n)).toBe(false);
    }
  });
});

describe('calculateCellularGeometry', () => {
  it('matches the course example: N=7 -> D = sqrt(21)*R (§13.1, diap. 23)', () => {
    const result = calculateCellularGeometry({ cellRadiusKm: 2, clusterSize: 7 });
    expect(result.reuseDistanceKm).toBeCloseTo(Math.sqrt(21) * 2, 6);
  });

  it('throws for a geometrically invalid cluster size', () => {
    expect(() => calculateCellularGeometry({ cellRadiusKm: 1, clusterSize: 5 })).toThrow();
  });

  it('throws for a non-positive radius', () => {
    expect(() => calculateCellularGeometry({ cellRadiusKm: 0, clusterSize: 7 })).toThrow();
  });

  // Self-derived checks below, not cited in the course doc -- cross-checked
  // by hand against the §13.1 formulas, not an independent course oracle.
  it('self-check: cocellAreaKm2 = clusterSize * cellAreaKm2', () => {
    const result = calculateCellularGeometry({ cellRadiusKm: 1.5, clusterSize: 9 });
    expect(result.cocellAreaKm2).toBeCloseTo(9 * result.cellAreaKm2, 9);
  });

  it('self-check: sectorAreaKm2 = cellAreaKm2 / 3', () => {
    const result = calculateCellularGeometry({ cellRadiusKm: 1.5, clusterSize: 9 });
    expect(result.sectorAreaKm2).toBeCloseTo(result.cellAreaKm2 / 3, 9);
  });

  // Diap. 24: Q = E[S_T/S_RC] + 1, S_RC = N*Sc = sqrt(3)*D^2/2. The numbers
  // below are computed by hand from that formula (the course has no worked
  // numeric example for Q), not an independent course oracle.
  it('clusterCount for R=1, N=7, S_T=100 km^2: S_RC=18.187 -> floor(5.499)+1 = 6', () => {
    const result = calculateCellularGeometry({ cellRadiusKm: 1, clusterSize: 7, totalAreaKm2: 100 });
    expect(result.cocellAreaKm2).toBeCloseTo(18.187, 3);
    expect(result.clusterCount).toBe(6);
  });

  it('clusterCount for a large area: R=1, N=7, S_T=500 km^2 -> 28 (the old formula gave 17)', () => {
    const result = calculateCellularGeometry({ cellRadiusKm: 1, clusterSize: 7, totalAreaKm2: 500 });
    expect(result.clusterCount).toBe(28);
  });

  it('clusterCount always covers the area: Q * S_RC >= S_T', () => {
    for (const [r, n, area] of [[1, 7, 50], [2.5, 7, 50], [1, 4, 50], [0.8, 3, 20], [1.5, 12, 333]] as const) {
      const result = calculateCellularGeometry({ cellRadiusKm: r, clusterSize: n, totalAreaKm2: area });
      expect(result.clusterCount! * result.cocellAreaKm2).toBeGreaterThanOrEqual(area);
    }
  });

  it('literal reading of E[.]: an exact integer ratio still adds the +1', () => {
    // S_T = 3 * S_RC exactly -> floor(3)+1 = 4 (ceil would give 3).
    const probe = calculateCellularGeometry({ cellRadiusKm: 1, clusterSize: 7 });
    const result = calculateCellularGeometry({ cellRadiusKm: 1, clusterSize: 7, totalAreaKm2: 3 * probe.cocellAreaKm2 });
    expect(result.clusterCount).toBe(4);
  });

  it('omits clusterCount when totalAreaKm2 is not supplied', () => {
    const result = calculateCellularGeometry({ cellRadiusKm: 1, clusterSize: 7 });
    expect(result.clusterCount).toBeUndefined();
  });
});
