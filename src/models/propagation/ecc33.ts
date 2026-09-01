import { assertPositive, rangeWarningMessage } from '../../utils/validation';
import type { PropagationInputs, PropagationModelDefinition, PropagationResult, PropagationWarning } from './types';

/**
 * ECC-33 model (Electronic Communications Committee, Report 33), a
 * refinement of the Ericsson model for fixed wireless access up to
 * ~4 GHz.
 *
 * PL = Afs + Abm - Gb - Gr   (all terms in dB)
 *   Afs = 92.45 + 20*log10(d) + 20*log10(f)          [d km, f GHz]
 *   Abm = 20.41 + 9.83*log10(d) + 7.894*log10(f) + 9.56*[log10(f)]^2
 *   Gb  = log10(hb/200) * (13.958 + 5.8*[log10(d)]^2)
 *   Gr  = (42.57 + 13.7*log10(f)) * (log10(hr) - 0.6)     [medium city]
 *       = 0.759*hr - 1.862                                 [large city]
 *
 * Constants and range per docs/curso-referencia.md §5.5 (Universidad
 * del Cauca course slides): Afs=92.45 (matches the GHz-km form of the
 * free-space constant already used in freeSpace.ts, 32.44 dB + 60 dB
 * for the MHz->GHz shift) and Gr's medium-city term uses -0.6, not the
 * -0.585 this file previously cited from generic sources (bilkent.edu.tr,
 * an ns-3 implementation, various WiMAX papers) -- the course value
 * takes precedence for this deliverable.
 *
 * Range: f <= 4 GHz, d <= 10 km, 20 <= hb <= 200 m, 5 <= hr <= 10 m.
 */
export function calculateEcc33Loss(inputs: PropagationInputs): PropagationResult {
  const { frequencyMHz, distanceKm, baseStationHeightM, mobileHeightM, citySize } = inputs;

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

  pushRangeWarning('frequencyMHz', frequencyMHz, 0, 4000, 'Frecuencia', 'MHz');
  pushRangeWarning('distanceKm', distanceKm, 0, 10, 'Distancia', 'km');
  pushRangeWarning('baseStationHeightM', baseStationHeightM, 20, 200, 'Altura de estación base', 'm');
  pushRangeWarning('mobileHeightM', mobileHeightM, 5, 10, 'Altura del móvil', 'm');

  const frequencyGHz = frequencyMHz / 1000;
  const logD = Math.log10(distanceKm);
  const logF = Math.log10(frequencyGHz);

  const afs = 92.45 + 20 * logD + 20 * logF;
  const abm = 20.41 + 9.83 * logD + 7.894 * logF + 9.56 * Math.pow(logF, 2);
  const gb = Math.log10(baseStationHeightM / 200) * (13.958 + 5.8 * Math.pow(logD, 2));
  const gr =
    citySize === 'large'
      ? 0.759 * mobileHeightM - 1.862
      : (42.57 + 13.7 * logF) * (Math.log10(mobileHeightM) - 0.6);

  const pathLossDb = afs + abm - gb - gr;

  return { pathLossDb, warnings };
}

export const ecc33Model: PropagationModelDefinition = {
  id: 'ecc33',
  label: 'ECC-33',
  shortLabel: 'ECC-33',
  citation: 'Electronic Communications Committee, Report 33. Válido para f: 0-4000 MHz (docs/curso-referencia.md §5.5).',
  implemented: true,
  calculate: calculateEcc33Loss,
};
