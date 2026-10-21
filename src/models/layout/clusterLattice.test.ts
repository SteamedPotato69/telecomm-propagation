import { describe, expect, it } from 'vitest';
import { LocalizedError } from '../../utils/localizedMessage';
import { isValidRhombicNumber } from '../geometry';
import { axialDistance, axialKey, axialNeighbors, axialToPoint } from './hexGrid';
import type { Axial, HexFrame } from './hexGrid';
import { clusterLatticeFor, clusterTools, frameAnchoredAt } from './clusterLattice';

/** Every valid cluster size up to 91 (1, 3, 4, 7, 9, 12, 13, 16, 19, 21, 25, ...). */
const VALID_SIZES = Array.from({ length: 91 }, (_, k) => k + 1).filter(isValidRhombicNumber);
const unit: HexFrame = { radius: 1, rotationRad: 0, origin: { x: 0, y: 0 } };

describe('clusterLatticeFor', () => {
  it('finds (i, j) for the course sizes (diap. 22-23)', () => {
    const pairs = [1, 3, 4, 7, 9, 12, 13].map((n) => {
      const { i, j } = clusterLatticeFor(n);
      return [n, i, j];
    });
    expect(pairs).toEqual([[1, 1, 0], [3, 1, 1], [4, 2, 0], [7, 2, 1], [9, 3, 0], [12, 2, 2], [13, 3, 1]]);
  });

  it('the translation vectors v1 = (i,j), v2 = (-j, i+j) satisfy N = i^2 + ij + j^2 = det(v1, v2)', () => {
    for (const n of VALID_SIZES) {
      const { i, j, v1, v2 } = clusterLatticeFor(n);
      expect(i * i + i * j + j * j).toBe(n);
      expect(v1.q * v2.r - v1.r * v2.q).toBe(n);
    }
  });

  it('rejects sizes that are not rhombic numbers, with the same translatable error as geometry', () => {
    for (const n of [2, 5, 6, 8, 10, 11, 0, -3, 7.5]) {
      expect(() => clusterLatticeFor(n)).toThrow(LocalizedError);
    }
  });
});

describe('the cluster is a valid frequency-reuse puzzle piece, for every valid N up to 91', () => {
  // A window of cells large enough to contain several repetitions of the biggest cluster.
  const window: Axial[] = [];
  for (let q = -22; q <= 22; q++) for (let r = -22; r <= 22; r++) window.push({ q, r });

  for (const n of VALID_SIZES) {
    it(`N = ${n}: N colours, same-colour cells exactly D = sqrt(3N)*R apart, tiling without gaps or overlaps`, () => {
      const tools = clusterTools(n);

      // exactly N distinct cells in the reference cluster, with N distinct colours
      expect(tools.baseCells).toHaveLength(n);
      expect(new Set(tools.baseCells.map(axialKey)).size).toBe(n);
      expect(new Set(tools.baseCells.map((c) => tools.colorOf(c))).size).toBe(n);

      // colours are periodic under both translations: v1 and v2 map the pattern onto itself
      const { v1, v2 } = tools.lattice;
      for (const cell of window.slice(0, 400)) {
        const colour = tools.colorOf(cell);
        expect(tools.colorOf({ q: cell.q + v1.q, r: cell.r + v1.r })).toBe(colour);
        expect(tools.colorOf({ q: cell.q + v2.q, r: cell.r + v2.r })).toBe(colour);
      }

      // the closest two cells of the same colour are exactly D = sqrt(3N)*R apart (diap. 23)
      const byColour = new Map<number, Axial[]>();
      for (const cell of window) {
        const colour = tools.colorOf(cell);
        byColour.set(colour, [...(byColour.get(colour) ?? []), cell]);
      }
      const sample = byColour.get(0) as Axial[];
      let minimum = Infinity;
      for (let a = 0; a < sample.length; a += 7) {
        const pa = axialToPoint(sample[a], unit);
        for (let b = a + 1; b < Math.min(sample.length, a + 400); b++) {
          const pb = axialToPoint(sample[b], unit);
          minimum = Math.min(minimum, Math.hypot(pa.x - pb.x, pa.y - pb.y));
        }
      }
      expect(minimum).toBeCloseTo(Math.sqrt(3 * n), 9);
    });
  }

  it('translating the reference cluster tiles the plane: every window cell is in exactly one cluster', () => {
    for (const n of [1, 3, 4, 7, 9, 12, 13, 19]) {
      const tools = clusterTools(n);
      const covered = new Map<string, number>();
      for (let a = -12; a <= 12; a++) {
        for (let b = -12; b <= 12; b++) {
          for (const cell of tools.cellsAt({ a, b })) {
            const k = axialKey(cell);
            covered.set(k, (covered.get(k) ?? 0) + 1);
          }
        }
      }
      // inner region (far from the edge of the translated block): covered exactly once
      for (let q = -6; q <= 6; q++) {
        for (let r = -6; r <= 6; r++) {
          expect(covered.get(axialKey({ q, r })), `N=${n} cell ${q},${r}`).toBe(1);
        }
      }
    }
  });

  it('translationOf is the inverse of cellsAt', () => {
    const tools = clusterTools(7);
    for (const translation of [{ a: 0, b: 0 }, { a: 2, b: -3 }, { a: -4, b: 1 }]) {
      for (const cell of tools.cellsAt(translation)) {
        expect(tools.translationOf(cell)).toEqual(translation);
      }
    }
  });
});

describe('the reference cluster is compact', () => {
  it('N = 7 is the "flower": a centre cell with its six neighbours (diap. 24 draws exactly this)', () => {
    const cells = clusterTools(7).baseCells;
    const keys = new Set(cells.map(axialKey));
    const centre = cells.find((c) => axialNeighbors(c).every((n) => keys.has(axialKey(n))));
    expect(centre).toBeDefined();
  });

  it('every cell of every cluster touches another cell of its own cluster (no isolated cells)', () => {
    for (const n of VALID_SIZES.filter((size) => size > 1)) {
      const cells = clusterTools(n).baseCells;
      const keys = new Set(cells.map(axialKey));
      for (const cell of cells) {
        expect(axialNeighbors(cell).some((neighbour) => keys.has(axialKey(neighbour))), `N=${n}`).toBe(true);
      }
    }
  });

  it('the cluster fits in a disc of about sqrt(N) cell-widths (no long thin strips for the common sizes)', () => {
    for (const n of [3, 4, 7, 9, 12, 13]) {
      const cells = clusterTools(n).baseCells;
      const centre = {
        x: cells.reduce((s, c) => s + axialToPoint(c, unit).x, 0) / n,
        y: cells.reduce((s, c) => s + axialToPoint(c, unit).y, 0) / n,
      };
      const farthest = Math.max(...cells.map((c) => Math.hypot(axialToPoint(c, unit).x - centre.x, axialToPoint(c, unit).y - centre.y)));
      // a disc holding N hexagons of area A has radius sqrt(N*A/pi); allow a generous 1.6x
      expect(farthest).toBeLessThan(1.6 * Math.sqrt((n * 2.598076) / Math.PI) + 1);
    }
  });
});

describe('snapping (the "iman")', () => {
  it('a point near a cluster centre snaps to that cluster', () => {
    const tools = clusterTools(7);
    const frame: HexFrame = { radius: 1.5, rotationRad: 0.3, origin: { x: 2, y: 1 } };
    for (const translation of [{ a: 0, b: 0 }, { a: 1, b: 0 }, { a: -2, b: 3 }]) {
      const c = tools.centerOf(translation, frame);
      expect(tools.snap({ x: c.x + 0.4, y: c.y - 0.3 }, frame)).toEqual(translation);
    }
  });

  it('snapped clusters never overlap each other: neighbouring translations are at least D apart', () => {
    const tools = clusterTools(7);
    const frame: HexFrame = { radius: 1, rotationRad: 0, origin: { x: 0, y: 0 } };
    const c00 = tools.centerOf({ a: 0, b: 0 }, frame);
    for (const [a, b] of [[1, 0], [0, 1], [-1, 1], [1, -1]]) {
      const c = tools.centerOf({ a, b }, frame);
      expect(Math.hypot(c.x - c00.x, c.y - c00.y)).toBeCloseTo(Math.sqrt(21), 9); // D = sqrt(3*7)*R
    }
  });

  it('frameAnchoredAt puts the (0,0) cluster centre exactly on the anchor, whatever the rotation', () => {
    for (const rotation of [0, 0.5, 2]) {
      const frame = frameAnchoredAt({ x: 10, y: -4 }, 2, rotation, 7);
      const c = clusterTools(7).centerOf({ a: 0, b: 0 }, frame);
      expect(c.x).toBeCloseTo(10, 9);
      expect(c.y).toBeCloseTo(-4, 9);
    }
  });

  it('colours of cells in one cluster are all different; cells at distance D share a colour', () => {
    const tools = clusterTools(4);
    const same = tools.baseCells[0];
    const another = { q: same.q + tools.lattice.v1.q, r: same.r + tools.lattice.v1.r };
    expect(tools.colorOf(another)).toBe(tools.colorOf(same));
    expect(axialDistance(same, another)).toBeGreaterThanOrEqual(2);
  });
});
