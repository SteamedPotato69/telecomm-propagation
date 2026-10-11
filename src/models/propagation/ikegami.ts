import { LocalizedError } from '../../utils/localizedMessage';
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

  assertPositive(frequencyMHz, 'frequency');
  assertPositive(distanceKm, 'distance');
  assertPositive(mobileHeightM, 'mobileHeight');

  const streetWidthM = requireField(inputs.streetWidthM, 'streetWidth', MODEL_NAME);
  const buildingHeightM = requireField(
    inputs.diffractingBuildingHeightM,
    'diffractingBuildingHeight',
    MODEL_NAME
  );
  const streetOrientationDeg = requireField(
    inputs.streetOrientationDeg,
    'streetOrientation',
    MODEL_NAME
  );
  const facadeReflectionLr = requireField(
    inputs.facadeReflectionLr,
    'facadeReflection',
    MODEL_NAME
  );

  assertPositive(streetWidthM, 'streetWidth');
  assertPositive(facadeReflectionLr, 'facadeReflection');

  if (buildingHeightM <= mobileHeightM) {
    throw new LocalizedError('errors.diffractingBuildingBelowMobile');
  }

  const sinPhi = Math.sin((streetOrientationDeg * Math.PI) / 180);
  if (sinPhi <= 0) {
    throw new LocalizedError('errors.streetOrientationSinZero');
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
  implemented: true,
  extraFields: ['streetWidthM', 'diffractingBuildingHeightM', 'streetOrientationDeg', 'facadeReflectionLr'],
  calculate: calculateIkegamiLoss,
};
