import { assertPositive } from '../../utils/validation';
import type { PropagationInputs, PropagationModelDefinition, PropagationResult } from './types';

/**
 * Free-space path loss (Friis transmission equation, log-distance form).
 *
 * FSPL(dB) = 20*log10(d_km) + 20*log10(f_MHz) + 32.44
 *
 * No environment or antenna-height terms: it's the theoretical
 * lower bound for any other model at the same frequency/distance.
 * Valid for any d, f > 0 -- there is no empirical range to warn about.
 */
export function calculateFreeSpaceLoss(inputs: PropagationInputs): PropagationResult {
  const { frequencyMHz, distanceKm } = inputs;

  assertPositive(frequencyMHz, 'frequency');
  assertPositive(distanceKm, 'distance');

  const pathLossDb = 20 * Math.log10(distanceKm) + 20 * Math.log10(frequencyMHz) + 32.44;

  return { pathLossDb, warnings: [] };
}

export const freeSpaceModel: PropagationModelDefinition = {
  id: 'free-space',
  implemented: true,
  calculate: calculateFreeSpaceLoss,
};
