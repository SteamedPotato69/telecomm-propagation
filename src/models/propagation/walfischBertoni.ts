import { assertPositive, rangeWarningMessage, requireField } from '../../utils/validation';
import type { PropagationInputs, PropagationModelDefinition, PropagationResult, PropagationWarning } from './types';

const MODEL_NAME = 'Walfisch-Bertoni';

/**
 * Walfisch-Bertoni model (Walfisch & Bertoni, 1988).
 *
 * L[dB] = 89.55 + A + 21*log10(f) + 38*log10(d)
 *         - 18*log10(H) - 18*log10(1 + d^2/(17*H))
 *
 * A[dB] = 5*log10[(b/2)^2 + (hR-hm)^2] - 9*log10(b)
 *         + 20*log10(atan(2*(hR-hm)/b))
 *
 * Per docs/curso-referencia.md §5.7. This is already the combined
 * form (the course derives it as Lb + free-space L0, and 57.1+32.44
 * rounds to 89.55) -- do NOT add freeSpace.ts's result on top of this.
 *
 * f in MHz, d in km, H/hR/hm/b in meters.
 *
 * Two judgment calls the course source doesn't resolve, both flagged
 * here rather than silently picked:
 *
 * 1. H is described as "altura antena Tx sobre edificios próximos"
 *    (transmitter height *over* nearby buildings) -- read here as
 *    height ABOVE the rooftop line, not absolute height above ground.
 *    Modeled as its own direct input (baseStationHeightAboveRoofM)
 *    instead of auto-computed as baseStationHeightM minus a building
 *    height, since the source doesn't spell out that subtraction and
 *    guessing it would silently bake in an assumption.
 * 2. atan() is assumed to return radians (Math.atan's native unit) --
 *    the source doesn't state units for tan^-1 either. This is the
 *    standard convention but wasn't independently re-derived.
 *
 * Range per course: f 300-3000 MHz, d 0.2-5 km.
 */
export function calculateWalfischBertoniLoss(inputs: PropagationInputs): PropagationResult {
  const { frequencyMHz, distanceKm, mobileHeightM } = inputs;

  assertPositive(frequencyMHz, 'Frecuencia');
  assertPositive(distanceKm, 'Distancia');
  assertPositive(mobileHeightM, 'Altura del móvil');

  const heightAboveRoofM = requireField(
    inputs.baseStationHeightAboveRoofM,
    'Altura de estación base sobre tejados (H)',
    MODEL_NAME
  );
  const averageBuildingHeightM = requireField(
    inputs.averageBuildingHeightM,
    'Altura media de edificios (hR)',
    MODEL_NAME
  );
  const buildingSeparationM = requireField(
    inputs.buildingSeparationM,
    'Separación entre edificios (b)',
    MODEL_NAME
  );

  assertPositive(heightAboveRoofM, 'Altura de estación base sobre tejados (H)');
  assertPositive(buildingSeparationM, 'Separación entre edificios (b)');

  if (averageBuildingHeightM <= mobileHeightM) {
    throw new Error(
      'La altura media de edificios (hR) debe ser mayor que la altura del móvil (hm): el término arcotangente de A queda indefinido o sin sentido físico si no lo es.'
    );
  }

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

  pushRangeWarning('frequencyMHz', frequencyMHz, 300, 3000, 'Frecuencia', 'MHz');
  pushRangeWarning('distanceKm', distanceKm, 0.2, 5, 'Distancia', 'km');

  const heightDiffM = averageBuildingHeightM - mobileHeightM;
  const a =
    5 * Math.log10(Math.pow(buildingSeparationM / 2, 2) + Math.pow(heightDiffM, 2)) -
    9 * Math.log10(buildingSeparationM) +
    20 * Math.log10(Math.atan((2 * heightDiffM) / buildingSeparationM));

  const pathLossDb =
    89.55 +
    a +
    21 * Math.log10(frequencyMHz) +
    38 * Math.log10(distanceKm) -
    18 * Math.log10(heightAboveRoofM) -
    18 * Math.log10(1 + Math.pow(distanceKm, 2) / (17 * heightAboveRoofM));

  return { pathLossDb, warnings };
}

export const walfischBertoniModel: PropagationModelDefinition = {
  id: 'walfisch-bertoni',
  label: 'Walfisch-Bertoni',
  shortLabel: 'Walfisch-B.',
  citation:
    'Walfisch & Bertoni (1988). Fórmula: docs/curso-referencia.md §5.7. Válido para f: 300-3000 MHz, d: 0.2-5 km.',
  implemented: true,
  calculate: calculateWalfischBertoniLoss,
};
