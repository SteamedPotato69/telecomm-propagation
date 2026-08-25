import type { PropagationInputs, PropagationModelDefinition, PropagationResult } from './types';

/**
 * PENDING IMPLEMENTATION.
 *
 * The Ikegami model (Ikegami et al., 1984) needs street-level geometry
 * that `PropagationInputs` doesn't model yet -- street width, rooftop
 * height at the receiver, and the road-orientation angle relative to
 * the base station. Cross-referencing web sources for this project
 * turned up several inconsistent variants (the standalone Ikegami
 * model is not the same formula as the COST231-Walfisch-Ikegami hybrid
 * that reuses part of it), so the exact coefficients could not be
 * verified with confidence.
 *
 * Rather than ship guessed constants into an academic deliverable,
 * this is intentionally left unimplemented until the course's exact
 * reference formula (Énfasis 2 - Análisis de Redes Móviles,
 * Universidad del Cauca) is confirmed.
 */
export function calculateIkegamiLoss(_inputs: PropagationInputs): PropagationResult {
  throw new Error(
    'Modelo Ikegami pendiente: faltan confirmar constantes y parámetros geométricos (ancho de calle, orientación) contra el material del curso.'
  );
}

export const ikegamiModel: PropagationModelDefinition = {
  id: 'ikegami',
  label: 'Ikegami',
  shortLabel: 'Ikegami',
  citation: 'Pendiente de verificación (Ikegami et al., 1984).',
  implemented: false,
  calculate: calculateIkegamiLoss,
};
