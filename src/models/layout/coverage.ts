import { assertUsablePolygon, pointInPolygon, polygonArea, polygonBounds } from './areaShape';
import { clusterTools } from './clusterLattice';
import type { ClusterTranslation } from './clusterLattice';
import { axialKey, axialToPoint, pointToAxial } from './hexGrid';
import type { HexFrame, Point } from './hexGrid';

/** The clusters a player has placed: one frame (position + rotation of the lattice) and the translations used. */
export interface PlacedClusters {
  clusterSize: number;
  frame: HexFrame;
  translations: ClusterTranslation[];
}

/**
 * How finely the area is measured. The player's coverage and the optimum that
 * scores it use the SAME sample points, so a solution that covers every sample
 * is exactly 100 %. Gaps smaller than one sample (about 1/3000 of the area) count
 * as covered -- a border sliver of 0.03 % is not worth a whole extra cluster.
 */
export const DEFAULT_SAMPLE_COUNT = 3000;

/**
 * A regular grid of points inside the polygon, about `targetCount` of them.
 * Coverage is measured on these points: exact in the limit, cheap, and valid
 * for any polygon. Deterministic, so the same area always gives the same score.
 */
export function sampleArea(polygon: Point[], targetCount = DEFAULT_SAMPLE_COUNT): Point[] {
  assertUsablePolygon(polygon);
  const { minX, minY, maxX, maxY } = polygonBounds(polygon);
  const step = Math.sqrt(polygonArea(polygon) / targetCount);
  const samples: Point[] = [];
  for (let y = minY + step / 2; y < maxY; y += step) {
    for (let x = minX + step / 2; x < maxX; x += step) {
      const point = { x, y };
      if (pointInPolygon(point, polygon)) samples.push(point);
    }
  }
  return samples;
}

/** Keys of every cell covered by the placed clusters. */
export function placedCellKeys(placed: PlacedClusters): Set<string> {
  const tools = clusterTools(placed.clusterSize);
  const keys = new Set<string>();
  for (const translation of placed.translations) {
    for (const cell of tools.cellsAt(translation)) keys.add(axialKey(cell));
  }
  return keys;
}

/** Fraction (0-1) of the sample points that lie inside a cell of a placed cluster. */
export function coverageFraction(samples: Point[], placed: PlacedClusters): number {
  if (samples.length === 0) return 0;
  const covered = placedCellKeys(placed);
  let hits = 0;
  for (const sample of samples) {
    if (covered.has(axialKey(pointToAxial(sample, placed.frame)))) hits++;
  }
  return hits / samples.length;
}

export interface CoverageSummary {
  /** Fraction of the area covered, 0-1. */
  fraction: number;
  clusters: number;
  /** Cells in the placed clusters (clusters * N). */
  cells: number;
  /** Cells whose centre lies inside the area: the ones that actually work for it. */
  cellsInsideArea: number;
  /** Cells whose centre lies outside the area: overhang at the border. */
  cellsOutsideArea: number;
}

export function summarizeCoverage(samples: Point[], polygon: Point[], placed: PlacedClusters): CoverageSummary {
  const keys = placedCellKeys(placed);
  let inside = 0;
  for (const key of keys) {
    const [q, r] = key.split(',').map(Number);
    if (pointInPolygon(axialToPoint({ q, r }, placed.frame), polygon)) inside++;
  }
  return {
    fraction: coverageFraction(samples, placed),
    clusters: placed.translations.length,
    cells: keys.size,
    cellsInsideArea: inside,
    cellsOutsideArea: keys.size - inside,
  };
}
