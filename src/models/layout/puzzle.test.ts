import { describe, expect, it } from 'vitest';
import { areaShapePolygon } from './areaShape';
import { findMinimalTiling } from './autoTiling';
import { coverageFraction, sampleArea } from './coverage';
import { clusterColors, nearestSameColorPair, remainingClusters, scorePuzzle, suggestNextCluster, translationKey } from './puzzle';
import type { HexFrame } from './hexGrid';

const rect = (areaKm2: number) =>
  areaShapePolygon({ kind: 'rectangle', areaKm2, aspectRatio: 1.4, rotationRad: 0.2, center: { x: 0, y: 0 } });

describe('clusterColors', () => {
  it('N colours, all different, valid hex; N = 1 is the neon lilac', () => {
    for (const n of [1, 3, 4, 7, 9, 12, 13]) {
      const colours = clusterColors(n);
      expect(colours).toHaveLength(n);
      expect(new Set(colours).size).toBe(n);
      for (const c of colours) expect(c).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(clusterColors(1)).toEqual(['#c084fc']);
  });

  it('is deterministic (the same group always has the same colour)', () => {
    expect(clusterColors(7)).toEqual(clusterColors(7));
  });
});

describe('scorePuzzle', () => {
  const base = { coverage: 1, clustersUsed: 5, optimumClusters: 5, helpLevel: 'none' as const };

  it('not covered -> 0 stars, however few clusters were used', () => {
    expect(scorePuzzle({ ...base, coverage: 0.97, clustersUsed: 2 }).stars).toBe(0);
    expect(scorePuzzle({ ...base, coverage: 0.97 }).covered).toBe(false);
  });

  it('covered with the optimum -> 3 stars', () => {
    expect(scorePuzzle(base)).toEqual({ covered: true, stars: 3, extraClusters: 0 });
  });

  it('covered with up to 2 extra clusters -> 2 stars; 3 or more -> 1 star', () => {
    expect(scorePuzzle({ ...base, clustersUsed: 6 }).stars).toBe(2);
    expect(scorePuzzle({ ...base, clustersUsed: 7 }).stars).toBe(2);
    expect(scorePuzzle({ ...base, clustersUsed: 8 }).stars).toBe(1);
    expect(scorePuzzle({ ...base, clustersUsed: 8 }).extraClusters).toBe(3);
  });

  it('beating the optimum (it is a search, not a proof) is still 3 stars with no negative extra', () => {
    expect(scorePuzzle({ ...base, clustersUsed: 4 })).toEqual({ covered: true, stars: 3, extraClusters: 0 });
  });

  it('hints cap the score at 2 stars and auto-fill at 1', () => {
    expect(scorePuzzle({ ...base, helpLevel: 'hints' }).stars).toBe(2);
    expect(scorePuzzle({ ...base, helpLevel: 'autofill' }).stars).toBe(1);
    expect(scorePuzzle({ ...base, clustersUsed: 8, helpLevel: 'hints' }).stars).toBe(1);
    // help never turns a failure into stars
    expect(scorePuzzle({ ...base, coverage: 0.5, helpLevel: 'hints' }).stars).toBe(0);
  });
});

describe('hints and auto-fill', () => {
  const polygon = rect(50);
  const samples = sampleArea(polygon);
  const radius = 1.2;
  const optimum = findMinimalTiling(polygon, radius, 7);

  it('with nothing placed, the hint is the cluster covering the most of the area', () => {
    const hint = suggestNextCluster(samples, optimum.frame, 7, []);
    expect(hint).not.toBeNull();
    expect(optimum.translations.map(translationKey)).toContain(translationKey(hint!));
  });

  it('the clusters still needed with nothing placed are exactly the optimum', () => {
    const needed = remainingClusters(samples, optimum.frame, 7, []);
    expect(needed).toHaveLength(optimum.clusters);
  });

  it('placing them all reaches 100 % and nothing more is suggested', () => {
    const needed = remainingClusters(samples, optimum.frame, 7, []);
    expect(coverageFraction(samples, { clusterSize: 7, frame: optimum.frame, translations: needed })).toBe(1);
    expect(suggestNextCluster(samples, optimum.frame, 7, needed)).toBeNull();
    expect(remainingClusters(samples, optimum.frame, 7, needed)).toEqual([]);
  });

  it('each hint is a cluster not yet placed, and following hints one by one finishes the job', () => {
    const placed: ReturnType<typeof remainingClusters> = [];
    for (let guard = 0; guard < 50; guard++) {
      const hint = suggestNextCluster(samples, optimum.frame, 7, placed);
      if (hint === null) break;
      expect(placed.map(translationKey)).not.toContain(translationKey(hint));
      placed.push(hint);
    }
    expect(placed).toHaveLength(optimum.clusters);
    expect(coverageFraction(samples, { clusterSize: 7, frame: optimum.frame, translations: placed })).toBe(1);
  });

  it('works in a frame the player chose (not the optimum): it just completes what is missing there', () => {
    const playerFrame = { radius, rotationRad: 0.9, origin: { x: 0.37, y: -0.21 } };
    const needed = remainingClusters(samples, playerFrame, 7, []);
    expect(coverageFraction(samples, { clusterSize: 7, frame: playerFrame, translations: needed })).toBe(1);
    // (no comparison with the optimum: that is a search over a grid of frames, so another frame can tie or even beat it)
    expect(needed.length).toBeGreaterThan(0);
  });
});

describe('nearestSameColorPair', () => {
  const frame: HexFrame = { radius: 1.3, rotationRad: 0.4, origin: { x: 2, y: -1 } };

  it('needs two clusters', () => {
    expect(nearestSameColorPair(7, frame, [])).toBeNull();
    expect(nearestSameColorPair(7, frame, [{ a: 0, b: 0 }])).toBeNull();
  });

  it('two neighbouring clusters put same-colour cells exactly D = sqrt(3N)*R apart, for every colour', () => {
    for (const n of [3, 4, 7, 9, 12, 13]) {
      for (let color = 0; color < n; color++) {
        const pair = nearestSameColorPair(n, frame, [{ a: 0, b: 0 }, { a: 1, b: 0 }], color);
        expect(pair?.distance).toBeCloseTo(Math.sqrt(3 * n) * frame.radius, 9);
      }
    }
  });

  it('takes the closest pair when several clusters are placed', () => {
    const pair = nearestSameColorPair(7, frame, [{ a: 0, b: 0 }, { a: 3, b: 0 }, { a: 4, b: 0 }]);
    expect(pair?.distance).toBeCloseTo(Math.sqrt(21) * frame.radius, 9);
  });
});
