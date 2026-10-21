import { describe, expect, it } from 'vitest';
import { LocalizedError } from '../../utils/localizedMessage';
import { areaShapePolygon } from './areaShape';
import {
  DEFAULT_REFERENCE_KM,
  MIN_REFERENCE_LINE_PX,
  checkAreaFits,
  hexRadiusPx,
  hexesTooSmall,
  kmToPx,
  pixelsPerKm,
  pxToKm,
} from './scale';

describe('pixelsPerKm: the traced line is the unit of the whole system', () => {
  it('a 300-400 line (a 3-4-5 triangle: 500 px long) that stands for 1 km gives 500 px/km', () => {
    const line = { a: { x: 100, y: 100 }, b: { x: 400, y: 500 }, realKm: DEFAULT_REFERENCE_KM };
    expect(pixelsPerKm(line)).toBe(500);
  });

  it('the same line standing for 0.5 km or 2 km gives 1000 or 250 px/km', () => {
    const base = { a: { x: 0, y: 0 }, b: { x: 300, y: 400 } };
    expect(pixelsPerKm({ ...base, realKm: 0.5 })).toBe(1000);
    expect(pixelsPerKm({ ...base, realKm: 2 })).toBe(250);
  });

  it('is independent of the direction the line was traced', () => {
    const forward = pixelsPerKm({ a: { x: 10, y: 10 }, b: { x: 250, y: 90 }, realKm: 1 });
    const backward = pixelsPerKm({ a: { x: 250, y: 90 }, b: { x: 10, y: 10 }, realKm: 1 });
    expect(forward).toBeCloseTo(backward, 12);
  });

  it('rejects a line shorter than the minimum, and a non-positive real length (translatable errors)', () => {
    const tooShort = { a: { x: 0, y: 0 }, b: { x: MIN_REFERENCE_LINE_PX - 1, y: 0 }, realKm: 1 };
    expect(() => pixelsPerKm(tooShort)).toThrow(LocalizedError);
    expect(() => pixelsPerKm({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, realKm: 0 })).toThrow(LocalizedError);
    expect(() => pixelsPerKm({ a: { x: 5, y: 5 }, b: { x: 5, y: 5 }, realKm: 1 })).toThrow(LocalizedError);
  });

  it('km <-> px conversions are inverses', () => {
    expect(pxToKm(kmToPx(3.7, 120), 120)).toBeCloseTo(3.7, 12);
  });
});

describe('checkAreaFits: the area is fixed in km, so the scale decides whether it fits in the picture', () => {
  const square50 = areaShapePolygon({ kind: 'rectangle', areaKm2: 50, aspectRatio: 1, rotationRad: 0, center: { x: 0, y: 0 } });

  it('50 km^2 (7.07 km square) at 100 px/km needs 707 px: does not fit an 800x600 image', () => {
    const fit = checkAreaFits(square50, 100, { width: 800, height: 600 });
    expect(fit.requiredWidthPx).toBeCloseTo(707.1, 1);
    expect(fit.fits).toBe(false); // 707 > 600 tall
  });

  it('suggests the largest scale that fits: min(800, 600) / 7.07 = 84.9 px/km', () => {
    const fit = checkAreaFits(square50, 100, { width: 800, height: 600 });
    expect(fit.maxPxPerKmToFit).toBeCloseTo(600 / Math.sqrt(50), 6);
  });

  it('at that suggested scale it fits, and a smaller scale fits too', () => {
    const suggested = checkAreaFits(square50, 100, { width: 800, height: 600 }).maxPxPerKmToFit;
    expect(checkAreaFits(square50, suggested, { width: 800, height: 600 }).fits).toBe(true);
    expect(checkAreaFits(square50, suggested * 0.5, { width: 800, height: 600 }).fits).toBe(true);
    expect(checkAreaFits(square50, suggested * 1.05, { width: 800, height: 600 }).fits).toBe(false);
  });
});

describe('hexagon size on screen', () => {
  it('radius in pixels = radius in km x scale; tiny hexagons are flagged', () => {
    expect(hexRadiusPx(1.79, 100)).toBeCloseTo(179, 9);
    expect(hexesTooSmall(1.79, 100)).toBe(false);
    expect(hexesTooSmall(0.1, 100)).toBe(true); // 10 px: not touchable
  });
});
