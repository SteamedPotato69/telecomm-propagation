import { describe, expect, it } from 'vitest';
import { areaDimensionsKm, areaPolygonKm, clampAreaCenterPx, initialAreaPlacement } from './areaPlacement';
import type { AreaPlacement } from './areaPlacement';
import { polygonArea, polygonBounds } from './areaShape';
import { checkAreaFits } from './scale';

const image = { width: 1000, height: 600 };

describe('areaPolygonKm', () => {
  it('keeps the area exactly S_T whatever the scale and the position', () => {
    const placement: AreaPlacement = { ...initialAreaPlacement(image), kind: 'ellipse', aspectRatio: 2, rotationRad: 0.4 };
    for (const pxPerKm of [20, 100, 333]) {
      expect(polygonArea(areaPolygonKm(50, placement, pxPerKm))).toBeCloseTo(50, 9);
    }
  });

  it('puts the centre where the pixel centre says, converted to km', () => {
    const placement: AreaPlacement = { ...initialAreaPlacement(image), centerPx: { x: 400, y: 200 } };
    const bounds = polygonBounds(areaPolygonKm(36, placement, 100));
    expect((bounds.minX + bounds.maxX) / 2).toBeCloseTo(4, 9);
    expect((bounds.minY + bounds.maxY) / 2).toBeCloseTo(2, 9);
  });
});

describe('areaDimensionsKm', () => {
  it('a rectangle of 50 km² and 2:1 measures sqrt(100) x sqrt(25)', () => {
    const { widthKm, heightKm } = areaDimensionsKm('rectangle', 50, 2);
    expect(widthKm).toBeCloseTo(10, 9);
    expect(heightKm).toBeCloseTo(5, 9);
  });

  it('a circle of area pi*r² measures 2r across', () => {
    const { widthKm, heightKm } = areaDimensionsKm('ellipse', Math.PI * 9, 1);
    expect(widthKm).toBeCloseTo(6, 1);
    expect(heightKm).toBeCloseTo(6, 1);
  });
});

describe('clampAreaCenterPx', () => {
  const area = 25; // 5 x 5 km square
  const pxPerKm = 40; // 200 x 200 px on screen

  it('leaves a centre that is already inside untouched', () => {
    const placement: AreaPlacement = { ...initialAreaPlacement(image), centerPx: { x: 500, y: 300 } };
    expect(clampAreaCenterPx(area, placement, pxPerKm, image)).toEqual({ x: 500, y: 300 });
  });

  it('pulls a centre that would push the shape past an edge back so the shape touches it', () => {
    const placement: AreaPlacement = { ...initialAreaPlacement(image), centerPx: { x: -50, y: 9999 } };
    const clamped = clampAreaCenterPx(area, placement, pxPerKm, image);
    expect(clamped.x).toBeCloseTo(100, 9); // half of 200 px
    expect(clamped.y).toBeCloseTo(500, 9); // 600 - 100
  });

  it('after clamping, a shape that fits really is inside the image', () => {
    const placement: AreaPlacement = { ...initialAreaPlacement(image), rotationRad: Math.PI / 5, centerPx: { x: 1, y: 1 } };
    const centerPx = clampAreaCenterPx(area, placement, pxPerKm, image);
    const bounds = polygonBounds(areaPolygonKm(area, { ...placement, centerPx }, pxPerKm));
    expect(bounds.minX * pxPerKm).toBeGreaterThanOrEqual(-1e-6);
    expect(bounds.minY * pxPerKm).toBeGreaterThanOrEqual(-1e-6);
    expect(bounds.maxX * pxPerKm).toBeLessThanOrEqual(image.width + 1e-6);
    expect(bounds.maxY * pxPerKm).toBeLessThanOrEqual(image.height + 1e-6);
  });

  it('a shape bigger than the image is centred, and the fit check says so', () => {
    const big = 400; // 20 x 20 km at 40 px/km = 800 px: taller than the 600 px image
    const placement: AreaPlacement = { ...initialAreaPlacement(image), centerPx: { x: 0, y: 0 } };
    const clamped = clampAreaCenterPx(big, placement, pxPerKm, image);
    expect(clamped.y).toBeCloseTo(300, 9);
    expect(checkAreaFits(areaPolygonKm(big, { ...placement, centerPx: clamped }, pxPerKm), pxPerKm, image).fits).toBe(false);
  });
});
