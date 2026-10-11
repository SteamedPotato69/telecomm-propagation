import { assertPositive, rangeWarningMessage } from '../../utils/validation';
import type { FieldLabel } from '../../utils/localizedMessage';
import type { PropagationInputs, PropagationModelDefinition, PropagationResult, PropagationWarning } from './types';

/**
 * COST-231 Hata model: extends Hata to 1500-2000 MHz.
 *
 * L(dB) = 46.3 + 33.9*log10(f) - 13.82*log10(hb) - a(hm)
 *         + (44.9 - 6.55*log10(hb))*log10(d) + Cm
 *
 * a(hm) uses Hata's small/medium-city formula regardless of city size --
 * the COST-231 spec does not define a separate large-city branch the
 * way the original Hata paper does.
 *
 * Cm = 3 dB for dense metropolitan centers, 0 dB for medium
 * cities/suburban areas.
 *
 * Empirical range: f 1500-2000 MHz, hb 30-200 m, hm 1-10 m, d 1-20 km.
 */
type Cost231HataGeometryInputs = Omit<PropagationInputs, 'distanceKm'>;

/** Everything except the d-dependent term -- see hata.ts's identically-shaped helper for why this is split out. */
function cost231DistanceIndependentTerms(inputs: Cost231HataGeometryInputs): {
  baseLossDb: number;
  distanceCoefficient: number;
} {
  const { frequencyMHz, baseStationHeightM, mobileHeightM, metropolitanCenter } = inputs;

  const logF = Math.log10(frequencyMHz);
  const logHb = Math.log10(baseStationHeightM);
  const aHm = (1.1 * logF - 0.7) * mobileHeightM - (1.56 * logF - 0.8);
  const cm = metropolitanCenter ? 3 : 0;
  const distanceCoefficient = 44.9 - 6.55 * logHb;

  const baseLossDb = 46.3 + 33.9 * logF - 13.82 * logHb - aHm + cm;

  return { baseLossDb, distanceCoefficient };
}

export function calculateCost231HataLoss(inputs: PropagationInputs): PropagationResult {
  const { frequencyMHz, distanceKm, baseStationHeightM, mobileHeightM } = inputs;

  assertPositive(frequencyMHz, 'frequency');
  assertPositive(distanceKm, 'distance');
  assertPositive(baseStationHeightM, 'baseStationHeight');
  assertPositive(mobileHeightM, 'mobileHeight');

  const warnings: PropagationWarning[] = [];
  const pushRangeWarning = (
    field: PropagationWarning['field'],
    value: number,
    min: number,
    max: number,
    label: FieldLabel,
    unit: string
  ) => {
    const message = rangeWarningMessage(value, min, max, label, unit);
    if (message) warnings.push({ field, message });
  };

  pushRangeWarning('frequencyMHz', frequencyMHz, 1500, 2000, 'frequency', 'MHz');
  pushRangeWarning('baseStationHeightM', baseStationHeightM, 30, 200, 'baseStationHeight', 'm');
  pushRangeWarning('mobileHeightM', mobileHeightM, 1, 10, 'mobileHeight', 'm');
  pushRangeWarning('distanceKm', distanceKm, 1, 20, 'distance', 'km');

  const { baseLossDb, distanceCoefficient } = cost231DistanceIndependentTerms(inputs);
  const pathLossDb = baseLossDb + distanceCoefficient * Math.log10(distanceKm);

  return { pathLossDb, warnings };
}

/**
 * Inverts calculateCost231HataLoss for distance -- closed-form algebra,
 * same reasoning as solveHataDistanceKm. No course-cited worked example
 * uses COST-231-Hata for the link-budget/MAPL exercises (both diap. 45-46
 * examples use plain Okumura-Hata, confirmed against the original PDF) --
 * verified instead by a round-trip self-check in cost231Hata.test.ts
 * (calculate then solve recovers the original distance), not a course
 * oracle.
 */
export function solveCost231HataDistanceKm(inputs: Cost231HataGeometryInputs, targetLossDb: number): number {
  assertPositive(inputs.frequencyMHz, 'frequency');
  assertPositive(inputs.baseStationHeightM, 'baseStationHeight');
  assertPositive(inputs.mobileHeightM, 'mobileHeight');

  const { baseLossDb, distanceCoefficient } = cost231DistanceIndependentTerms(inputs);
  return Math.pow(10, (targetLossDb - baseLossDb) / distanceCoefficient);
}

export const cost231HataModel: PropagationModelDefinition = {
  id: 'cost231-hata',
  implemented: true,
  calculate: calculateCost231HataLoss,
  solveDistanceKm: solveCost231HataDistanceKm,
};
