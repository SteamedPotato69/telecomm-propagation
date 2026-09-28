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

  it('self-check: clusterCount for R=1, N=7, S_T=100 km^2', () => {
    // D = sqrt(21) ~= 4.5826 km; 3*D^2/2 = 31.5; ceil(100/31.5)+1 = 4+1 = 5.
    const result = calculateCellularGeometry({ cellRadiusKm: 1, clusterSize: 7, totalAreaKm2: 100 });
    expect(result.clusterCount).toBe(5);
  });

  it('omits clusterCount when totalAreaKm2 is not supplied', () => {
    const result = calculateCellularGeometry({ cellRadiusKm: 1, clusterSize: 7 });
    expect(result.clusterCount).toBeUndefined();
  });
});
