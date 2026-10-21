import { describe, expect, it } from 'vitest';
import { LocalizedError } from '../../utils/localizedMessage';
import { areaShapePolygon, pointInPolygon, polygonArea } from './areaShape';
import { clusterTools } from './clusterLattice';
import { coverageFraction, placedCellKeys, sampleArea, summarizeCoverage } from './coverage';
import type { PlacedClusters } from './coverage';
import { hexArea } from './hexGrid';
import type { HexFrame } from './hexGrid';

const rect = (areaKm2: number, aspectRatio = 1) =>
  areaShapePolygon({ kind: 'rectangle', areaKm2, aspectRatio, rotationRad: 0, center: { x: 0, y: 0 } });

const frame: HexFrame = { radius: 1, rotationRad: 0, origin: { x: 0, y: 0 } };

/** Every cluster translation in a block big enough to cover any area used below. */
function blockOfTranslations(span: number) {
  const translations = [];
  for (let a = -span; a <= span; a++) for (let b = -span; b <= span; b++) translations.push({ a, b });
  return translations;
}

describe('sampleArea', () => {
  it('returns about the requested number of points, all inside the polygon, deterministically', () => {
    const polygon = rect(50);
    const samples = sampleArea(polygon, 4000);
    expect(samples.length).toBeGreaterThan(3600);
    expect(samples.length).toBeLessThan(4400);
    expect(samples.every((p) => pointInPolygon(p, polygon))).toBe(true);
    expect(sampleArea(polygon, 4000)).toEqual(samples);
  });

  it('works on non-rectangular and thin shapes', () => {
    expect(sampleArea(areaShapePolygon({ kind: 'ellipse', areaKm2: 30, aspectRatio: 4, rotationRad: 0.6, center: { x: 1, y: 1 } }), 2000).length).toBeGreaterThan(1500);
  });

  it('rejects a degenerate polygon', () => {
    expect(() => sampleArea([{ x: 0, y: 0 }, { x: 1, y: 0 }], 100)).toThrow(LocalizedError);
  });
});

describe('coverage of placed clusters', () => {
  const polygon = rect(30);
  const samples = sampleArea(polygon, 3000);

  it('nothing placed -> 0 %', () => {
    const none: PlacedClusters = { clusterSize: 7, frame, translations: [] };
    expect(coverageFraction(samples, none)).toBe(0);
  });

  it('a block of clusters that blankets the plane -> 100 %', () => {
    const all: PlacedClusters = { clusterSize: 7, frame, translations: blockOfTranslations(6) };
    expect(coverageFraction(samples, all)).toBe(1);
  });

  it('removing clusters lowers coverage, and never below 0', () => {
    const full = blockOfTranslations(6);
    const half = full.filter((_, index) => index % 2 === 0);
    const f = coverageFraction(samples, { clusterSize: 7, frame, translations: half });
    expect(f).toBeGreaterThan(0.2);
    expect(f).toBeLessThan(0.8);
  });

  it('one cell covers about its own area: coverage of a single hexagon on a large area = Sc / S_T', () => {
    const big = rect(400);
    const bigSamples = sampleArea(big, 20000);
    const one: PlacedClusters = { clusterSize: 1, frame, translations: [{ a: 0, b: 0 }] };
    expect(coverageFraction(bigSamples, one)).toBeCloseTo(hexArea(1) / 400, 2);
  });

  it('summary counts clusters, cells, and cells inside vs outside the area (border overhang)', () => {
    const placed: PlacedClusters = { clusterSize: 7, frame, translations: blockOfTranslations(6) };
    const summary = summarizeCoverage(samples, polygon, placed);
    expect(summary.clusters).toBe(13 * 13);
    expect(summary.cells).toBe(13 * 13 * 7);
    expect(summary.cellsInsideArea + summary.cellsOutsideArea).toBe(summary.cells);
    // cells whose centre is inside a 30 km^2 area ~ area / hexagon area
    expect(summary.cellsInsideArea).toBeGreaterThan(polygonArea(polygon) / hexArea(1) - 8);
    expect(summary.cellsInsideArea).toBeLessThan(polygonArea(polygon) / hexArea(1) + 8);
  });

  it('placedCellKeys has N cells per distinct cluster', () => {
    const keys = placedCellKeys({ clusterSize: 7, frame, translations: [{ a: 0, b: 0 }, { a: 1, b: 0 }, { a: 1, b: 0 }] });
    expect(keys.size).toBe(14); // the duplicate translation adds nothing
    expect(clusterTools(7).baseCells).toHaveLength(7);
  });
});
