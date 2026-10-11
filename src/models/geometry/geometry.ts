import { LocalizedError } from '../../utils/localizedMessage';
import { assertPositive } from '../../utils/validation';
import { isValidRhombicNumber } from './rhombicNumbers';
import type { GeometryInputs, GeometryResult } from './types';

const SQRT3 = Math.sqrt(3);

/**
 * Hexagonal cell-planning geometry (docs/curso-referencia.md §13.1,
 * diap. 20-25): lattice step, co-channel reuse distance, hexagonal cell
 * area, co-channel rhombus area, sector area, and (optionally) the number
 * of clusters needed to cover a given total area.
 */
export function calculateCellularGeometry(inputs: GeometryInputs): GeometryResult {
  const { cellRadiusKm, clusterSize, totalAreaKm2 } = inputs;

  assertPositive(cellRadiusKm, 'cellRadius');
  if (!isValidRhombicNumber(clusterSize)) {
    // Geometrically impossible, not an empirical range violation -- same
    // severity as assertPositive (throw, don't just warn).
    throw new LocalizedError('errors.invalidClusterSize', { n: clusterSize });
  }

  const latticeStepKm = cellRadiusKm * SQRT3;
  const reuseDistanceKm = Math.sqrt(3 * clusterSize) * cellRadiusKm;
  const cellAreaKm2 = ((3 * SQRT3) / 2) * cellRadiusKm ** 2;
  const cocellAreaKm2 = clusterSize * cellAreaKm2;
  const sectorAreaKm2 = cellAreaKm2 / 3;

  let clusterCount: number | undefined;
  if (totalAreaKm2 !== undefined) {
    assertPositive(totalAreaKm2, 'totalCoverageArea');
    clusterCount = Math.ceil(totalAreaKm2 / ((3 * reuseDistanceKm ** 2) / 2)) + 1;
  }

  return { latticeStepKm, reuseDistanceKm, cellAreaKm2, cocellAreaKm2, sectorAreaKm2, clusterCount };
}
