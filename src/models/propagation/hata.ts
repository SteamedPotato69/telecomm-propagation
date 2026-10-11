import { assertPositive, rangeWarningMessage } from '../../utils/validation';
import type { FieldLabel } from '../../utils/localizedMessage';
import type {
  CitySize,
  PropagationInputs,
  PropagationModelDefinition,
  PropagationResult,
  PropagationWarning,
} from './types';

/**
 * Mobile-antenna height correction factor a(hm), per Hata (1980).
 *
 * The large-city branch is only rigorously defined at f <= 200 MHz and
 * f >= 400 MHz in the original paper (200-400 MHz is a gap most
 * implementations don't cover); we resolve it with a single 200 MHz
 * threshold, which is the simplification most textbooks/tools use.
 */
function mobileHeightCorrectionDb(frequencyMHz: number, mobileHeightM: number, citySize: CitySize): number {
  if (citySize === 'large') {
    return frequencyMHz <= 200
      ? 8.29 * Math.pow(Math.log10(1.54 * mobileHeightM), 2) - 1.1
      : 3.2 * Math.pow(Math.log10(11.75 * mobileHeightM), 2) - 4.97;
  }

  const logF = Math.log10(frequencyMHz);
  return (1.1 * logF - 0.7) * mobileHeightM - (1.56 * logF - 0.8);
}

/**
 * Okumura-Hata model.
 *
 * L_urban(dB) = 69.55 + 26.26*log10(f) - 13.82*log10(hb) - a(hm)
 *               + (44.9 - 6.55*log10(hb))*log10(d)
 *
 * Suburban:    L = L_urban - 2*[log10(f/28)]^2 - 5.4
 * Open/rural:  L = L_urban - 4.78*[log10(f)]^2 + 18.33*log10(f) - 40.94
 *
 * Empirical range: f 150-1500 MHz, hb (base station) 30-200 m,
 * hm (mobile) 1-10 m, d 1-20 km.
 *
 * The 26.26 frequency coefficient is per docs/curso-referencia.md §5.3
 * (Universidad del Cauca course slides). Generic industry sources
 * (bilkent.edu.tr, IAENG WCE2008, GaussianWaves -- what this file
 * previously cited) use 26.16, a different published rounding of the
 * same Okumura curve-fit; the course material takes precedence here
 * since this is a course deliverable.
 */
type HataGeometryInputs = Omit<PropagationInputs, 'distanceKm'>;

/**
 * Everything in the Hata formula except the d-dependent term -- shared by
 * calculateHataLoss (adds distanceCoefficient*log10(d)) and
 * solveHataDistanceKm (solves that same equation for d), so the formula
 * itself lives in exactly one place.
 */
function hataDistanceIndependentTerms(inputs: HataGeometryInputs): {
  baseLossDb: number;
  distanceCoefficient: number;
} {
  const { frequencyMHz, baseStationHeightM, mobileHeightM, citySize, environment } = inputs;

  const logF = Math.log10(frequencyMHz);
  const logHb = Math.log10(baseStationHeightM);
  const aHm = mobileHeightCorrectionDb(frequencyMHz, mobileHeightM, citySize);
  const distanceCoefficient = 44.9 - 6.55 * logHb;

  let baseLossDb = 69.55 + 26.26 * logF - 13.82 * logHb - aHm;
  if (environment === 'suburban') {
    baseLossDb -= 2 * Math.pow(Math.log10(frequencyMHz / 28), 2) + 5.4;
  } else if (environment === 'open-rural') {
    baseLossDb += -4.78 * Math.pow(logF, 2) + 18.33 * logF - 40.94;
  }

  return { baseLossDb, distanceCoefficient };
}

export function calculateHataLoss(inputs: PropagationInputs): PropagationResult {
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

  pushRangeWarning('frequencyMHz', frequencyMHz, 150, 1500, 'frequency', 'MHz');
  pushRangeWarning('baseStationHeightM', baseStationHeightM, 30, 200, 'baseStationHeight', 'm');
  pushRangeWarning('mobileHeightM', mobileHeightM, 1, 10, 'mobileHeight', 'm');
  pushRangeWarning('distanceKm', distanceKm, 1, 20, 'distance', 'km');

  const { baseLossDb, distanceCoefficient } = hataDistanceIndependentTerms(inputs);
  const pathLossDb = baseLossDb + distanceCoefficient * Math.log10(distanceKm);

  return { pathLossDb, warnings };
}

/**
 * Inverts calculateHataLoss for distance: Hata is linear in log10(d), so
 * this is closed-form algebra, not a search -- solve
 * targetLossDb = baseLossDb + distanceCoefficient*log10(d) for d.
 * docs/curso-referencia.md §13.3 (diap. 45-46): MAPL=141dB -> R=2.5km and
 * MAPL=133dB -> R=1.5km, both Okumura-Hata Urbano -- verified against this
 * function to within 0.3 dB (the PDF's own rounding), not exactly, since
 * the professor's slides round intermediate results.
 */
export function solveHataDistanceKm(inputs: HataGeometryInputs, targetLossDb: number): number {
  assertPositive(inputs.frequencyMHz, 'frequency');
  assertPositive(inputs.baseStationHeightM, 'baseStationHeight');
  assertPositive(inputs.mobileHeightM, 'mobileHeight');

  const { baseLossDb, distanceCoefficient } = hataDistanceIndependentTerms(inputs);
  return Math.pow(10, (targetLossDb - baseLossDb) / distanceCoefficient);
}

export const hataModel: PropagationModelDefinition = {
  id: 'hata',
  implemented: true,
  calculate: calculateHataLoss,
  solveDistanceKm: solveHataDistanceKm,
};
