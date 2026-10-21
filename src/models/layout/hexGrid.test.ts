import { describe, expect, it } from 'vitest';
import {
  AXIAL_DIRECTIONS,
  axialDistance,
  axialFromKey,
  axialKey,
  axialNeighbors,
  axialToPoint,
  hexArea,
  hexVertices,
  pointToAxial,
} from './hexGrid';
import type { HexFrame } from './hexGrid';

/** Small deterministic generator so the "random" tests are reproducible. */
function lcg(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const frame = (radius = 1, rotationDeg = 0, origin = { x: 0, y: 0 }): HexFrame => ({
  radius,
  rotationRad: (rotationDeg * Math.PI) / 180,
  origin,
});

describe('hex grid geometry (diap. 21: d = R*sqrt(3), Sc = 3*sqrt(3)/2*R^2)', () => {
  it('adjacent cell centres are d = R*sqrt(3) apart, for any rotation', () => {
    for (const rotation of [0, 17, 30, 90]) {
      const f = frame(2.5, rotation, { x: 3, y: -4 });
      const centre = axialToPoint({ q: 0, r: 0 }, f);
      for (const neighbour of axialNeighbors({ q: 0, r: 0 })) {
        const p = axialToPoint(neighbour, f);
        expect(Math.hypot(p.x - centre.x, p.y - centre.y)).toBeCloseTo(2.5 * Math.sqrt(3), 9);
      }
    }
  });

  it('a hexagon has six corners, each R from its centre, and area 3*sqrt(3)/2*R^2', () => {
    const vertices = hexVertices({ x: 1, y: 2 }, 1.7, 0.4);
    expect(vertices).toHaveLength(6);
    for (const v of vertices) expect(Math.hypot(v.x - 1, v.y - 2)).toBeCloseTo(1.7, 9);
    // shoelace
    let twiceArea = 0;
    vertices.forEach((v, k) => {
      const w = vertices[(k + 1) % 6];
      twiceArea += v.x * w.y - w.x * v.y;
    });
    expect(Math.abs(twiceArea) / 2).toBeCloseTo(hexArea(1.7), 9);
    expect(hexArea(1)).toBeCloseTo(2.598076, 6);
  });

  it('pointToAxial inverts axialToPoint for random cells, radii, rotations and origins', () => {
    const random = lcg(42);
    for (let k = 0; k < 300; k++) {
      const f = frame(0.2 + random() * 5, random() * 360, { x: random() * 20 - 10, y: random() * 20 - 10 });
      const cell = { q: Math.floor(random() * 41) - 20, r: Math.floor(random() * 41) - 20 };
      expect(pointToAxial(axialToPoint(cell, f), f)).toEqual(cell);
    }
  });

  it('a point inside a hexagon (anywhere within the inscribed circle) belongs to that cell', () => {
    const random = lcg(7);
    const f = frame(1.3, 23, { x: 0.5, y: -0.2 });
    const inradius = 1.3 * (Math.sqrt(3) / 2);
    for (let k = 0; k < 300; k++) {
      const cell = { q: Math.floor(random() * 11) - 5, r: Math.floor(random() * 11) - 5 };
      const centre = axialToPoint(cell, f);
      const angle = random() * 2 * Math.PI;
      const distance = random() * inradius * 0.99;
      const point = { x: centre.x + distance * Math.cos(angle), y: centre.y + distance * Math.sin(angle) };
      expect(pointToAxial(point, f)).toEqual(cell);
    }
  });

  it('axial distance: 0 for the same cell, 1 for neighbours, symmetric, triangle-consistent', () => {
    expect(axialDistance({ q: 2, r: -1 }, { q: 2, r: -1 })).toBe(0);
    for (const d of AXIAL_DIRECTIONS) expect(axialDistance({ q: 0, r: 0 }, d)).toBe(1);
    expect(axialDistance({ q: 0, r: 0 }, { q: 3, r: -1 })).toBe(3);
    expect(axialDistance({ q: 3, r: -1 }, { q: 0, r: 0 })).toBe(3);
  });

  it('keys round-trip, and never produce "-0"', () => {
    expect(axialFromKey(axialKey({ q: -3, r: 5 }))).toEqual({ q: -3, r: 5 });
    const origin = pointToAxial({ x: 0.0001, y: -0.0001 }, frame());
    expect(axialKey(origin)).toBe('0,0');
  });
});
