import { assertPositive } from '../../utils/validation';
import type { PropagationInputs, PropagationModelDefinition, PropagationResult, PropagationWarning } from './types';

/**
 * ECC-33 model (Electronic Communications Committee, Report 33), a
 * refinement of the Ericsson model for fixed wireless access up to
 * ~3.5 GHz.
 *
 * PL = Afs + Abm - Gb - Gr   (all terms in dB)
 *   Afs = 92.4 + 20*log10(d) + 20*log10(f)          [d km, f GHz]
 *   Abm = 20.41 + 9.83*log10(d) + 7.894*log10(f) + 9.56*[log10(f)]^2
 *   Gb  = log10(hb/200) * (13.958 + 5.8*[log10(d)]^2)
 *   Gr  = (42.57 + 13.7*log10(f)) * (log10(hr) - 0.585)   [medium city]
 *       = 0.759*hr - 1.862                                 [large city]
 *
 * NOTE on the large-city Gr constant: the literature is not unanimous
 * here -- most sources cite -1.862, but at least one widely mirrored
 * implementation uses -1.892 (and separately has Abm/Gb typo'd as
 * "2*log10(x)" instead of "[log10(x)]^2", which is almost certainly a
 * transcription bug, not an alternate formula). We use the squared
 * form and -1.862, consistent with the original Ofcom/ECC-33 papers.
 *
 * ECC-33 has no single official validity range like Hata's; the
 * practical range reported across the literature is roughly
 * f: 800-3500 MHz, so we don't emit range warnings for it here.
 */
export function calculateEcc33Loss(inputs: PropagationInputs): PropagationResult {
  const { frequencyMHz, distanceKm, baseStationHeightM, mobileHeightM, citySize } = inputs;

  assertPositive(frequencyMHz, 'Frecuencia');
  assertPositive(distanceKm, 'Distancia');
  assertPositive(baseStationHeightM, 'Altura de estación base');
  assertPositive(mobileHeightM, 'Altura del móvil');

  const warnings: PropagationWarning[] = [];

  const frequencyGHz = frequencyMHz / 1000;
  const logD = Math.log10(distanceKm);
  const logF = Math.log10(frequencyGHz);

  const afs = 92.4 + 20 * logD + 20 * logF;
  const abm = 20.41 + 9.83 * logD + 7.894 * logF + 9.56 * Math.pow(logF, 2);
  const gb = Math.log10(baseStationHeightM / 200) * (13.958 + 5.8 * Math.pow(logD, 2));
  const gr =
    citySize === 'large'
      ? 0.759 * mobileHeightM - 1.862
      : (42.57 + 13.7 * logF) * (Math.log10(mobileHeightM) - 0.585);

  const pathLossDb = afs + abm - gb - gr;

  return { pathLossDb, warnings };
}

export const ecc33Model: PropagationModelDefinition = {
  id: 'ecc33',
  label: 'ECC-33',
  shortLabel: 'ECC-33',
  citation:
    'Electronic Communications Committee, Report 33 (refinamiento del modelo Ericsson). Rango práctico reportado en literatura: hasta ~3.5 GHz.',
  implemented: true,
  calculate: calculateEcc33Loss,
};
