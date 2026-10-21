import { assertPositive } from '../../utils/validation';
import { PROPAGATION_MODEL_LIST } from './registry';
import type { PropagationModelId } from './types';

export interface InvertibleModelRecommendation {
  modelId: PropagationModelId;
  /** true when the frequency lies inside the model's documented range. */
  inRange: boolean;
  /** MHz by which the frequency falls outside the model's range; 0 when inside. */
  outsideByMHz: number;
}

/**
 * Picks, among the models that can be inverted for distance (those with a
 * `solveDistanceKm`, i.e. the ones a link budget can use), the one whose
 * documented frequency range fits `frequencyMHz` -- the assignment's
 * "seleccionar los modelos adecuados" (docs/curso-referencia.md §12.3),
 * automated for the link-budget/dimensioning flows.
 *
 *   900 MHz  -> Okumura-Hata        (150-1500)
 *   1800 MHz -> COST-231-Hata       (1500-2000)
 *   2100 MHz -> COST-231-Hata, flagged out of range by 100 MHz: no model
 *               covers it, and the course's own 3G example (diap. 72) uses
 *               COST-231 at 2100 MHz anyway. Plain Hata would be 600 MHz
 *               out of range.
 *
 * When no range contains the frequency the nearest one wins; on a tie
 * (exactly 1500 MHz is in both) the first in registry order wins -- Hata,
 * the original formulation. The caller turns `inRange: false` into a
 * visible warning; this module only chooses.
 */
export function recommendInvertibleModel(frequencyMHz: number): InvertibleModelRecommendation {
  assertPositive(frequencyMHz, 'frequency');

  let best: InvertibleModelRecommendation | null = null;
  for (const model of PROPAGATION_MODEL_LIST) {
    if (!model.solveDistanceKm || !model.frequencyRangeMHz) continue;
    const [min, max] = model.frequencyRangeMHz;
    const outsideByMHz = frequencyMHz < min ? min - frequencyMHz : frequencyMHz > max ? frequencyMHz - max : 0;
    if (best === null || outsideByMHz < best.outsideByMHz) {
      best = { modelId: model.id, inRange: outsideByMHz === 0, outsideByMHz };
    }
  }
  if (best === null) {
    throw new Error('No invertible propagation model declares a frequency range.');
  }
  return best;
}
