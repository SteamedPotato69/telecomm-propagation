import { assertPositive, rangeWarningMessage } from '../../utils/validation';
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
export function calculateCost231HataLoss(inputs: PropagationInputs): PropagationResult {
  const { frequencyMHz, distanceKm, baseStationHeightM, mobileHeightM, metropolitanCenter } = inputs;

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

  pushRangeWarning('frequencyMHz', frequencyMHz, 1500, 2000, 'Frecuencia', 'MHz');
  pushRangeWarning('baseStationHeightM', baseStationHeightM, 30, 200, 'Altura de estación base', 'm');
  pushRangeWarning('mobileHeightM', mobileHeightM, 1, 10, 'Altura del móvil', 'm');
  pushRangeWarning('distanceKm', distanceKm, 1, 20, 'Distancia', 'km');

  const logF = Math.log10(frequencyMHz);
  const logHb = Math.log10(baseStationHeightM);
  const aHm = (1.1 * logF - 0.7) * mobileHeightM - (1.56 * logF - 0.8);
  const cm = metropolitanCenter ? 3 : 0;

  const pathLossDb =
    46.3 + 33.9 * logF - 13.82 * logHb - aHm + (44.9 - 6.55 * logHb) * Math.log10(distanceKm) + cm;

  return { pathLossDb, warnings };
}

export const cost231HataModel: PropagationModelDefinition = {
  id: 'cost231-hata',
  label: 'COST-231 Hata',
  shortLabel: 'COST-231',
  citation: 'COST Action 231 (1999). Extensión de Hata para f: 1500-2000 MHz.',
  implemented: true,
  calculate: calculateCost231HataLoss,
};
