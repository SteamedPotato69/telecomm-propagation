import { LocalizedError } from '../../utils/localizedMessage';
import { assertPositive, requireField } from '../../utils/validation';
import { calculateFreeSpaceLoss } from './freeSpace';
import type { PropagationInputs, PropagationModelDefinition, PropagationResult } from './types';

const MODEL_NAME = 'COST-231 Walfish-Ikegami';

/**
 * Lori: street-orientation correction, piecewise over Φ in [0°, 90°].
 * The course formula has no defined branch outside that range.
 */
function calculateLori(streetOrientationDeg: number): number {
  if (streetOrientationDeg < 0 || streetOrientationDeg > 90) {
    throw new LocalizedError('errors.streetOrientationRange');
  }
  if (streetOrientationDeg <= 35) {
    return -10 + 0.3571 * streetOrientationDeg;
  }
  if (streetOrientationDeg <= 55) {
    return 2.5 + 0.075 * (streetOrientationDeg - 35);
  }
  return 4 + 0.114 * (streetOrientationDeg - 55);
}

/**
 * COST-231 Walfish-Ikegami model -- combines Walfisch-Bertoni's
 * multi-screen diffraction (Lmsd) with Ikegami's rooftop-to-street
 * geometry (Lrts).
 *
 * Lb = L0 + Lrts + Lmsd
 *
 * Lrts = -16.9 - 10*log10(W) + 10*log10(f) + 20*log10(hR-hm) + Lori
 *        (clamped to 0 if negative)
 * Lmsd = Lbsh + Ka + Kd*log10(d) + Kf*log10(f) + 9*log10(b)
 *   Lbsh = -18*log10(1 + (hB-hR))   if hB >= hR, else 0
 *   Ka   = 54                        if hB >= hR
 *        = 54 - 0.8*(hB-hR)          if hB < hR and d >= 0.5 km
 *        = 54 - 1.6*(hB-hR)*d        if hB < hR and d < 0.5 km
 *   Kd   = 18                        if hB >= hR
 *        = 18 - 15*(hB-hR)/hR        if hB < hR
 *   Kf   = -4 + 0.7*(f/925 - 1)      medium city/suburban
 *        = -4 + 1.5*(f/925 - 1)      metropolitan centers
 *
 * Per docs/curso-referencia.md §5.8; Ka/Kd/Kf/Lrts/Lori cross-verified
 * against Altair WinProp's technical documentation (independent
 * source, matches exactly).
 *
 * hB is baseStationHeightM (absolute BS height, reused as-is -- this
 * model's "hB" is the plain antenna height, unlike Walfisch-Bertoni's
 * own "H" which means height *above* the roofline). L0 is reused from
 * freeSpace.ts rather than re-deriving the 32.44 constant a second
 * time.
 *
 * No numeric validity range is documented for this combined model in
 * the course material (only qualitative validation points: 900/1800
 * MHz, 10m-3km) -- per the same policy as Ikegami, no range warnings
 * are added without a confirmed range.
 */
export function calculateCost231WalfishIkegamiLoss(inputs: PropagationInputs): PropagationResult {
  const { frequencyMHz, distanceKm, baseStationHeightM, mobileHeightM, metropolitanCenter } = inputs;

  assertPositive(frequencyMHz, 'frequency');
  assertPositive(distanceKm, 'distance');
  assertPositive(baseStationHeightM, 'baseStationHeight');
  assertPositive(mobileHeightM, 'mobileHeight');

  const streetWidthM = requireField(inputs.streetWidthM, 'streetWidth', MODEL_NAME);
  const streetOrientationDeg = requireField(
    inputs.streetOrientationDeg,
    'streetOrientation',
    MODEL_NAME
  );
  const averageBuildingHeightM = requireField(
    inputs.averageBuildingHeightM,
    'averageBuildingHeight',
    MODEL_NAME
  );
  const buildingSeparationM = requireField(inputs.buildingSeparationM, 'buildingSeparation', MODEL_NAME);

  assertPositive(streetWidthM, 'streetWidth');
  assertPositive(buildingSeparationM, 'buildingSeparation');

  if (averageBuildingHeightM <= mobileHeightM) {
    throw new LocalizedError('errors.averageBuildingBelowMobile');
  }

  const deltaHR = averageBuildingHeightM - mobileHeightM;
  const deltaHB = baseStationHeightM - averageBuildingHeightM;
  const logF = Math.log10(frequencyMHz);
  const logD = Math.log10(distanceKm);

  const lori = calculateLori(streetOrientationDeg);
  const rawLrts = -16.9 - 10 * Math.log10(streetWidthM) + 10 * logF + 20 * Math.log10(deltaHR) + lori;
  const lrts = Math.max(rawLrts, 0);

  const lbsh = deltaHB >= 0 ? -18 * Math.log10(1 + deltaHB) : 0;

  let ka: number;
  if (deltaHB >= 0) {
    ka = 54;
  } else if (distanceKm >= 0.5) {
    ka = 54 - 0.8 * deltaHB;
  } else {
    ka = 54 - 1.6 * deltaHB * distanceKm;
  }

  const kd = deltaHB >= 0 ? 18 : 18 - 15 * (deltaHB / averageBuildingHeightM);
  const kf = metropolitanCenter ? -4 + 1.5 * (frequencyMHz / 925 - 1) : -4 + 0.7 * (frequencyMHz / 925 - 1);

  const lmsd = lbsh + ka + kd * logD + kf * logF + 9 * Math.log10(buildingSeparationM);

  const { pathLossDb: l0 } = calculateFreeSpaceLoss(inputs);

  return { pathLossDb: l0 + lrts + lmsd, warnings: [] };
}

export const cost231WalfishIkegamiModel: PropagationModelDefinition = {
  id: 'cost231-walfish-ikegami',
  implemented: true,
  extraFields: ['streetWidthM', 'streetOrientationDeg', 'averageBuildingHeightM', 'buildingSeparationM'],
  calculate: calculateCost231WalfishIkegamiLoss,
};
