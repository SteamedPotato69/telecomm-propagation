import type { PropagationInputs, PropagationModelDefinition } from './types';

export interface SeriesPoint {
  distanceKm: number;
  pathLossDb: number | null;
}

/**
 * Evaluates a model's calculate() at each distance in `distancesKm`,
 * holding every other input fixed. A distance where the model throws
 * (e.g. outside a hard-validated domain) yields `pathLossDb: null`
 * for that point rather than aborting the whole series -- the chart
 * renders it as a gap instead of failing to render at all.
 */
export function sampleModelOverDistance(
  model: PropagationModelDefinition,
  baseInputs: PropagationInputs,
  distancesKm: number[]
): SeriesPoint[] {
  return distancesKm.map((distanceKm) => {
    try {
      const result = model.calculate({ ...baseInputs, distanceKm });
      return { distanceKm, pathLossDb: result.pathLossDb };
    } catch {
      return { distanceKm, pathLossDb: null };
    }
  });
}

/** `count` distances log-spaced between minKm and maxKm (inclusive), e.g. for a log-distance axis. */
export function generateLogSpacedDistances(minKm: number, maxKm: number, count: number): number[] {
  const logMin = Math.log10(minKm);
  const logMax = Math.log10(maxKm);
  const step = (logMax - logMin) / (count - 1);
  return Array.from({ length: count }, (_, index) => Math.pow(10, logMin + index * step));
}
