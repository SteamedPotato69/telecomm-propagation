import { assertPositive } from '../../utils/validation';
import { erlangBBlocking, erlangBInverseTraffic } from './erlangB';

/**
 * Traffic-density <-> geometry bridge (docs/curso-referencia.md
 * §13.2-13.3): p = B(rho*Sc, K). Not new math -- just Erlang B with
 * A = rho*Sc, where rho is traffic density (Erlang/km^2) and Sc is a
 * cell's area. Takes cellAreaKm2 as a plain number rather than importing
 * models/geometry directly, so this module stays independently testable
 * and doesn't need to know how Sc itself was derived (hexagonal, circular,
 * or otherwise).
 */
export function blockingFromDensity(
  trafficDensityErlPerKm2: number,
  cellAreaKm2: number,
  channels: number
): number {
  assertPositive(trafficDensityErlPerKm2, 'Densidad de tráfico (ρ)');
  assertPositive(cellAreaKm2, 'Área de celda (S_c)');
  const trafficErlangs = trafficDensityErlPerKm2 * cellAreaKm2;
  return erlangBBlocking(channels, trafficErlangs);
}

/** Maximum traffic density (Erlang/km^2) supportable at a target GoS, given K channels and cell area Sc. */
export function maxDensityForGoS(channels: number, targetGoS: number, cellAreaKm2: number): number {
  assertPositive(cellAreaKm2, 'Área de celda (S_c)');
  const trafficErlangs = erlangBInverseTraffic(channels, targetGoS);
  return trafficErlangs / cellAreaKm2;
}
