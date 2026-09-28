import type { LinkBudgetInputs, PropagationInputs } from '../propagation';

/**
 * Full 1G/2G dimensioning flow (docs/curso-referencia.md §13.3): pure
 * orchestration of models/traffic (capacity path) and
 * models/propagation's linkBudget + a model's own solveDistanceKm
 * (coverage path) -- no new formulas here.
 *
 * `solveDistanceKm` is taken as a plain function rather than a
 * `propagationModelId` this module would look up itself: the caller
 * (DimensioningScreen) already has a model chip selector backed by
 * `PROPAGATION_MODEL_LIST`, so it already knows which models are
 * invertible -- this avoids a second copy of that filtering logic here.
 */
export interface DimensioningInputs {
  /** Total offered traffic across the coverage area, Erlang. */
  totalTrafficErlangs: number;
  /** K: channels available per cell. */
  channelsPerCell: number;
  /** Target blocking probability, strictly between 0 and 1. */
  targetGoS: number;
  linkBudget: LinkBudgetInputs;
  propagationInputs: Omit<PropagationInputs, 'distanceKm'>;
  solveDistanceKm: (inputs: Omit<PropagationInputs, 'distanceKm'>, targetLossDb: number) => number;
  /** S_T: total area to cover, km^2. */
  totalAreaKm2: number;
}

export interface DimensioningResult {
  /** A_c = B^-1(K, GoS), Erlang/cell -- capacity path. */
  trafficPerCellErlangs: number;
  cellsByCapacity: number;
  eirpDbm: number;
  maplDb: number;
  cellRadiusKm: number;
  /** pi*R^2, km^2 -- circular coverage area, distinct from geometry/'s hexagonal Sc (two different design stages, not an inconsistency). */
  cellAreaKm2: number;
  cellsByCoverage: number;
  /** max(cellsByCapacity, cellsByCoverage) -- the binding constraint. */
  cellsFinal: number;
  bindingConstraint: 'capacity' | 'coverage';
}
