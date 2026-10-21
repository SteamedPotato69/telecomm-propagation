import { describe, expect, it } from 'vitest';
import { LocalizedError } from '../../utils/localizedMessage';
import {
  MAX_ASPECT_RATIO,
  MIN_ASPECT_RATIO,
  areaShapePolygon,
  assertUsablePolygon,
  pointInPolygon,
  polygonArea,
  polygonBounds,
} from './areaShape';
import type { AreaShapeSpec } from './areaShape';

const spec = (overrides: Partial<AreaShapeSpec> = {}): AreaShapeSpec => ({
  kind: 'rectangle',
  areaKm2: 50,
  aspectRatio: 1,
  rotationRad: 0,
  center: { x: 0, y: 0 },
  ...overrides,
});

describe('areaShapePolygon: the plan decides S_T, so the shape always has exactly that area', () => {
  it('rectangles and ellipses of any proportion, rotation and position have area S_T', () => {
    for (const kind of ['rectangle', 'ellipse'] as const) {
      for (const aspectRatio of [MIN_ASPECT_RATIO, 0.5, 1, 2, 3.7, MAX_ASPECT_RATIO]) {
        for (const areaKm2 of [0.5, 50, 1234.5]) {
          const polygon = areaShapePolygon(spec({ kind, aspectRatio, areaKm2, rotationRad: 0.7, center: { x: 12, y: -3 } }));
          expect(polygonArea(polygon), `${kind} ${aspectRatio} ${areaKm2}`).toBeCloseTo(areaKm2, 6);
        }
      }
    }
  });

  it('a square of 50 km^2 is sqrt(50) = 7.07 km on a side', () => {
    const { minX, maxX, minY, maxY } = polygonBounds(areaShapePolygon(spec()));
    expect(maxX - minX).toBeCloseTo(Math.sqrt(50), 9);
    expect(maxY - minY).toBeCloseTo(Math.sqrt(50), 9);
  });

  it('aspect ratio = width / height: 2:1 of 50 km^2 is 10 km x 5 km', () => {
    const { minX, maxX, minY, maxY } = polygonBounds(areaShapePolygon(spec({ aspectRatio: 2 })));
    expect(maxX - minX).toBeCloseTo(10, 9);
    expect(maxY - minY).toBeCloseTo(5, 9);
  });

  it('a circle of 50 km^2 has radius sqrt(50/pi) = 3.99 km', () => {
    const { minX, maxX } = polygonBounds(areaShapePolygon(spec({ kind: 'ellipse' })));
    expect((maxX - minX) / 2).toBeCloseTo(Math.sqrt(50 / Math.PI), 1);
  });

  it('is centred where asked and rotation turns it without changing it', () => {
    const polygon = areaShapePolygon(spec({ center: { x: 5, y: 8 }, rotationRad: Math.PI / 2, aspectRatio: 2 }));
    const { minX, maxX, minY, maxY } = polygonBounds(polygon);
    expect((minX + maxX) / 2).toBeCloseTo(5, 9);
    expect((minY + maxY) / 2).toBeCloseTo(8, 9);
    // a 2:1 rectangle turned 90 degrees is now taller than wide
    expect(maxY - minY).toBeGreaterThan(maxX - minX);
  });

  it('rejects a non-positive area and an aspect ratio outside the allowed range (translatable errors)', () => {
    expect(() => areaShapePolygon(spec({ areaKm2: 0 }))).toThrow(LocalizedError);
    expect(() => areaShapePolygon(spec({ aspectRatio: 0.1 }))).toThrow(LocalizedError);
    expect(() => areaShapePolygon(spec({ aspectRatio: 9 }))).toThrow(LocalizedError);
  });
});

describe('polygon helpers', () => {
  const square = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }];

  it('shoelace area, independent of winding direction', () => {
    expect(polygonArea(square)).toBe(16);
    expect(polygonArea([...square].reverse())).toBe(16);
  });

  it('point in polygon: inside, outside, and a concave shape', () => {
    expect(pointInPolygon({ x: 2, y: 2 }, square)).toBe(true);
    expect(pointInPolygon({ x: 5, y: 2 }, square)).toBe(false);
    expect(pointInPolygon({ x: -0.1, y: 2 }, square)).toBe(false);
    // an "L": the notch at (3,3) is outside
    const ell = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 4 }, { x: 0, y: 4 }];
    expect(pointInPolygon({ x: 1, y: 3 }, ell)).toBe(true);
    expect(pointInPolygon({ x: 3, y: 3 }, ell)).toBe(false);
  });

  it('assertUsablePolygon rejects fewer than 3 points and zero-area (collinear) polygons', () => {
    expect(() => assertUsablePolygon([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toThrow(LocalizedError);
    expect(() => assertUsablePolygon([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }])).toThrow(LocalizedError);
    expect(() => assertUsablePolygon(square)).not.toThrow();
  });
});
