import { assertPositive, requireField } from '../../utils/validation';
import type { PropagationInputs, PropagationModelDefinition, PropagationResult } from './types';

const MODEL_NAME = 'Ikegami';

/**
 * Ikegami model (Ikegami et al., 1984).
 *
 * Lb[dB] = 26.25 + 30*log10(f) + 20*log10(d)
 *          - 10*log10(1 + 3/lr^2) - 10*log10(W)
 *          + 20*log10(H - hr) + 10*log10(sin(Φ))
 *
 * Per docs/curso-referencia.md §5.6 ("forma final combinada"). f in
 * MHz, d in km, W/H/hr in meters, Φ in degrees (converted to radians
 * here for Math.sin), lr the facade-reflection parameter (course
 * gives 2 as typical for VHF, 3.2 for UHF).
 *
 * The source document flags this whole section [OCR-verificar] --
 * the signs weren't independently re-checked against the original
 * slides (39-41), only transcribed. It also lists a variable `w`
 * (distance from the receiver to the diffracting building) that never
 * appears in this closed form; it's intentionally not in
 * PropagationInputs since the formula as transcribed doesn't use it.
 */
export function calculateIkegamiLoss(inputs: PropagationInputs): PropagationResult {
  const { frequencyMHz, distanceKm, mobileHeightM } = inputs;

  assertPositive(frequencyMHz, 'Frecuencia');
  assertPositive(distanceKm, 'Distancia');
  assertPositive(mobileHeightM, 'Altura del móvil');

  const streetWidthM = requireField(inputs.streetWidthM, 'Ancho de calle (W)', MODEL_NAME);
  const buildingHeightM = requireField(
    inputs.diffractingBuildingHeightM,
    'Altura del edificio de difracción (H)',
    MODEL_NAME
  );
  const streetOrientationDeg = requireField(
    inputs.streetOrientationDeg,
    'Ángulo de orientación de calle (Φ)',
    MODEL_NAME
  );
  const facadeReflectionLr = requireField(
    inputs.facadeReflectionLr,
    'Parámetro de reflexión de fachada (lr)',
    MODEL_NAME
  );

  assertPositive(streetWidthM, 'Ancho de calle (W)');
  assertPositive(facadeReflectionLr, 'Parámetro de reflexión de fachada (lr)');

  if (buildingHeightM <= mobileHeightM) {
    throw new Error(
      'La altura del edificio de difracción (H) debe ser mayor que la altura del móvil (hr): sin eso, la difracción sobre el tejado no tiene sentido físico y log10(H - hr) queda indefinido.'
    );
  }

  const sinPhi = Math.sin((streetOrientationDeg * Math.PI) / 180);
  if (sinPhi <= 0) {
    throw new Error(
      'El ángulo de orientación de calle (Φ) no puede ser 0° o 180°: produce log10(sen Φ) indefinido (sen Φ = 0).'
    );
  }

  const pathLossDb =
    26.25 +
    30 * Math.log10(frequencyMHz) +
    20 * Math.log10(distanceKm) -
    10 * Math.log10(1 + 3 / Math.pow(facadeReflectionLr, 2)) -
    10 * Math.log10(streetWidthM) +
    20 * Math.log10(buildingHeightM - mobileHeightM) +
    10 * Math.log10(sinPhi);

  return { pathLossDb, warnings: [] };
}

export const ikegamiModel: PropagationModelDefinition = {
  id: 'ikegami',
  label: 'Ikegami',
  shortLabel: 'Ikegami',
  citation:
    'Ikegami et al. (1984). Fórmula: docs/curso-referencia.md §5.6 (la fuente marca los signos de esta sección como [OCR-verificar]).',
  implemented: true,
  calculate: calculateIkegamiLoss,
};
