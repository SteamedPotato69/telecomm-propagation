import { assertPositive } from '../../utils/validation';
import { calculateMapl } from '../propagation';
import { erlangBInverseTraffic } from '../traffic';
import type { DimensioningInputs, DimensioningResult } from './types';

/**
 * Composes the capacity path (Erlang B, §13.2) and the coverage path
 * (link budget -> MAPL -> a model's own solveDistanceKm, §13.3) exactly as
 * the course's own worked examples do: total traffic / traffic-per-cell
 * for capacity, total area / (pi*R^2) for coverage, final = max of the
 * two (the binding constraint).
 */
export function calculateDimensioning(inputs: DimensioningInputs): DimensioningResult {
  const { totalTrafficErlangs, channelsPerCell, targetGoS, linkBudget, propagationInputs, solveDistanceKm, totalAreaKm2 } =
    inputs;

  assertPositive(totalTrafficErlangs, 'totalTraffic');
  assertPositive(totalAreaKm2, 'Área total a cubrir');

  const trafficPerCellErlangs = erlangBInverseTraffic(channelsPerCell, targetGoS);
  const cellsByCapacity = Math.ceil(totalTrafficErlangs / trafficPerCellErlangs);

  const { eirpDbm, maplDb } = calculateMapl(linkBudget);
  const cellRadiusKm = solveDistanceKm(propagationInputs, maplDb);
  const cellAreaKm2 = Math.PI * cellRadiusKm ** 2;
  const cellsByCoverage = Math.ceil(totalAreaKm2 / cellAreaKm2);

  const cellsFinal = Math.max(cellsByCapacity, cellsByCoverage);
  const bindingConstraint: 'capacity' | 'coverage' = cellsByCapacity >= cellsByCoverage ? 'capacity' : 'coverage';

  return {
    trafficPerCellErlangs,
    cellsByCapacity,
    eirpDbm,
    maplDb,
    cellRadiusKm,
    cellAreaKm2,
    cellsByCoverage,
    cellsFinal,
    bindingConstraint,
  };
}
