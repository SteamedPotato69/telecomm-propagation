import { describe, expect, it } from 'vitest';
import { areaShapePolygon, polygonArea } from './areaShape';
import { findMinimalTiling, findMinimalTilingAsync } from './autoTiling';
import { coverageFraction, sampleArea } from './coverage';
import { hexArea, hexVertices } from './hexGrid';
import type { Point } from './hexGrid';

const rect = (areaKm2: number, aspectRatio = 1, rotationRad = 0, center: Point = { x: 0, y: 0 }) =>
  areaShapePolygon({ kind: 'rectangle', areaKm2, aspectRatio, rotationRad, center });

describe('findMinimalTiling', () => {
  it('an area that is exactly one cell is covered by one cell (N = 1): the aligned frame is found', () => {
    // A pointy-top hexagon of R = 1 centred on the origin IS cell (0,0) of the unrotated lattice.
    const oneCell = hexVertices({ x: 0, y: 0 }, 1, 0);
    expect(polygonArea(oneCell)).toBeCloseTo(hexArea(1), 9);
    const solution = findMinimalTiling(oneCell, 1, 1);
    expect(solution.clusters).toBe(1);
    expect(solution.cellsTouchingArea).toBe(1);
  });

  it('a tiny area needs one cluster', () => {
    expect(findMinimalTiling(rect(0.5), 1, 7).clusters).toBe(1);
  });

  it('the solution really covers the whole area', () => {
    for (const [area, n, radius] of [[30, 7, 1], [50, 4, 1.2], [20, 3, 0.8], [40, 1, 0.7]] as const) {
      const polygon = rect(area, 1.5, 0.3);
      const solution = findMinimalTiling(polygon, radius, n);
      const samples = sampleArea(polygon); // the same sample points the solution was scored on
      expect(coverageFraction(samples, { clusterSize: n, frame: solution.frame, translations: solution.translations })).toBe(1);
      expect(solution.cells).toBe(solution.clusters * n);
    }
  });

  it('cannot use fewer clusters than the area allows: clusters * (N * Sc) >= area', () => {
    for (const [area, n, radius] of [[30, 7, 1], [50, 4, 1.2], [120, 9, 0.9], [60, 1, 0.7]] as const) {
      const solution = findMinimalTiling(rect(area), radius, n);
      expect(solution.clusters * n * hexArea(radius)).toBeGreaterThanOrEqual(area * 0.99);
    }
  });

  it('stays within a bounded border overhead of that lower bound', () => {
    // The border adds clusters, but only a perimeter's worth: far from double the area bound.
    const area = 200;
    const radius = 1;
    const solution = findMinimalTiling(rect(area), radius, 7);
    const lowerBound = Math.ceil(area / (7 * hexArea(radius)));
    expect(solution.clusters).toBeGreaterThanOrEqual(lowerBound);
    expect(solution.clusters).toBeLessThanOrEqual(lowerBound + 8);
  });

  it('more candidate frames never give a worse answer than fewer (searching more can only help)', () => {
    const polygon = rect(60, 1.3, 0.2);
    const coarse = findMinimalTiling(polygon, 1, 7, { rotationsDeg: [0], offsetsPerAxis: 1 });
    const fine = findMinimalTiling(polygon, 1, 7, { rotationsDeg: [0, 10, 20, 30, 40, 50], offsetsPerAxis: 5 });
    expect(fine.clusters).toBeLessThanOrEqual(coarse.clusters);
  });

  it('is deterministic', () => {
    const polygon = rect(45, 1.2, 0.4);
    expect(findMinimalTiling(polygon, 1.1, 4)).toEqual(findMinimalTiling(polygon, 1.1, 4));
  });

  it('is invariant to moving the area: the same shape elsewhere needs the same clusters (+/- 1 for the search grid)', () => {
    const here = findMinimalTiling(rect(50), 1, 7).clusters;
    const there = findMinimalTiling(rect(50, 1, 0, { x: 37.3, y: -12.9 }), 1, 7).clusters;
    expect(Math.abs(here - there)).toBeLessThanOrEqual(1);
  });
});

describe('findMinimalTilingAsync', () => {
  it('gives exactly the answer of the synchronous search, for several shapes and cluster sizes', async () => {
    for (const [area, aspect, rotation, n] of [
      [50, 1, 0, 7],
      [36, 2, 0.4, 7],
      [15, 1.5, 0, 3],
      [8, 1.5, 0.2, 1],
    ] as const) {
      const polygon = rect(area, aspect, rotation, { x: 3, y: -2 });
      const radius = n === 7 ? 1.3 : 1;
      const sync = findMinimalTiling(polygon, radius, n);
      const slices = await findMinimalTilingAsync(polygon, radius, n, {}, 5);
      expect(slices).toEqual(sync);
    }
  });

  it('the slice size does not change the answer', async () => {
    const polygon = rect(40, 1.4, 0.3);
    const one = await findMinimalTilingAsync(polygon, 1.2, 7, {}, 1);
    const many = await findMinimalTilingAsync(polygon, 1.2, 7, {}, 1000);
    expect(one).toEqual(many);
  });

  it('resolves to null when cancelled, and does not keep working', async () => {
    let calls = 0;
    const result = await findMinimalTilingAsync(rect(40), 1.2, 7, {}, 3, () => ++calls > 2);
    expect(result).toBeNull();
    expect(calls).toBe(3);
  });
});
