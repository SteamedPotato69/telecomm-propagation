import { assertPositive, rangeWarningMessage } from '../../utils/validation';
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
export function calculateHataLoss(inputs: PropagationInputs): PropagationResult {
  const { frequencyMHz, distanceKm, baseStationHeightM, mobileHeightM, citySize, environment } = inputs;

  assertPositive(frequencyMHz, 'Frecuencia');
  assertPositive(distanceKm, 'Distancia');
  assertPositive(baseStationHeightM, 'Altura de estación base');
  assertPositive(mobileHeightM, 'Altura del móvil');

  const warnings: PropagationWarning[] = [];
  const pushRangeWarning = (
    field: PropagationWarning['field'],
    value: number,
    min: number,
    max: number,
    label: string,
    unit: string
  ) => {
    const message = rangeWarningMessage(value, min, max, label, unit);
    if (message) warnings.push({ field, message });
  };

  pushRangeWarning('frequencyMHz', frequencyMHz, 150, 1500, 'Frecuencia', 'MHz');
  pushRangeWarning('baseStationHeightM', baseStationHeightM, 30, 200, 'Altura de estación base', 'm');
  pushRangeWarning('mobileHeightM', mobileHeightM, 1, 10, 'Altura del móvil', 'm');
  pushRangeWarning('distanceKm', distanceKm, 1, 20, 'Distancia', 'km');

  const logF = Math.log10(frequencyMHz);
  const logHb = Math.log10(baseStationHeightM);
  const aHm = mobileHeightCorrectionDb(frequencyMHz, mobileHeightM, citySize);

  const urbanLossDb =
    69.55 + 26.26 * logF - 13.82 * logHb - aHm + (44.9 - 6.55 * logHb) * Math.log10(distanceKm);

  let pathLossDb = urbanLossDb;
  if (environment === 'suburban') {
    pathLossDb = urbanLossDb - 2 * Math.pow(Math.log10(frequencyMHz / 28), 2) - 5.4;
  } else if (environment === 'open-rural') {
    pathLossDb = urbanLossDb - 4.78 * Math.pow(logF, 2) + 18.33 * logF - 40.94;
  }

  return { pathLossDb, warnings };
}

export const hataModel: PropagationModelDefinition = {
  id: 'hata',
  label: 'Okumura-Hata',
  shortLabel: 'Hata',
  citation: 'Hata, M. (1980), IEEE Trans. Vehicular Technology. Válido para f: 150-1500 MHz.',
  implemented: true,
  calculate: calculateHataLoss,
};
