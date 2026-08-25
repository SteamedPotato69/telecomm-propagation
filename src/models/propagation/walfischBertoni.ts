import type { PropagationInputs, PropagationModelDefinition, PropagationResult } from './types';

/**
 * PENDING IMPLEMENTATION.
 *
 * The Walfisch-Bertoni model (1988) computes path loss as free-space
 * loss plus rooftop-diffraction loss plus a multiple-screen diffraction
 * term that depends on average building separation and the "settled
 * field" region along the whole path -- geometry `PropagationInputs`
 * doesn't model yet. As with Ikegami, web sources for this project
 * returned partial/inconsistent formula fragments, so the coefficients
 * could not be verified with confidence.
 *
 * Left unimplemented until the course's exact reference formula
 * (Énfasis 2 - Análisis de Redes Móviles, Universidad del Cauca) is
 * confirmed, rather than shipping guessed constants.
 */
export function calculateWalfischBertoniLoss(_inputs: PropagationInputs): PropagationResult {
  throw new Error(
    'Modelo Walfisch-Bertoni pendiente: faltan confirmar constantes y geometría de trayecto (separación entre edificios, región de campo asentado) contra el material del curso.'
  );
}

export const walfischBertoniModel: PropagationModelDefinition = {
  id: 'walfisch-bertoni',
  label: 'Walfisch-Bertoni',
  shortLabel: 'Walfisch-B.',
  citation: 'Pendiente de verificación (Walfisch & Bertoni, 1988).',
  implemented: false,
  calculate: calculateWalfischBertoniLoss,
};
