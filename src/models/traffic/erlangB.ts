import { assertNonNegative, assertPositive, assertUnitInterval } from '../../utils/validation';

/**
 * Erlang B loss formula (docs/curso-referencia.md §13.2), used to dimension
 * traffic channels per cell -- the course cites erlang.com/calculator/erlb.
 * Recursive form, not the factorial form (which overflows numerically for
 * realistic channel counts): B(0,A)=1, B(n,A) = A*B(n-1,A) / (n + A*B(n-1,A)).
 */
export function erlangBBlocking(channels: number, trafficErlangs: number): number {
  assertNonNegative(channels, 'Número de canales (K)');
  if (!Number.isInteger(channels)) {
    throw new Error('El número de canales (K) debe ser un entero.');
  }
  assertNonNegative(trafficErlangs, 'Tráfico ofrecido (A)');

  let blocking = 1;
  for (let n = 1; n <= channels; n++) {
    blocking = (trafficErlangs * blocking) / (n + trafficErlangs * blocking);
  }
  return blocking;
}

/**
 * A = B^-1(K, GoS): traffic supportable by K channels at a target blocking
 * probability. B(K,A) is monotonically increasing in A for fixed K, so this
 * is a plain expand-then-bisect search, not a closed-form inverse.
 */
export function erlangBInverseTraffic(channels: number, targetGoS: number): number {
  assertPositive(channels, 'Número de canales (K)');
  if (!Number.isInteger(channels)) {
    throw new Error('El número de canales (K) debe ser un entero.');
  }
  assertUnitInterval(targetGoS, 'GoS objetivo');

  let low = 0;
  let high = 1;
  while (erlangBBlocking(channels, high) < targetGoS) {
    high *= 2;
  }
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    if (erlangBBlocking(channels, mid) < targetGoS) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

/**
 * K = ceil(B^-1(A, GoS)): smallest integer channel count that keeps
 * blocking at or under a target GoS for a given offered traffic. B(n,A) is
 * monotonically decreasing in n for fixed A, so this walks n upward,
 * carrying the recursion forward incrementally (O(K) total, not O(K^2)
 * from calling erlangBBlocking from scratch at every step).
 */
export function erlangBInverseChannels(trafficErlangs: number, targetGoS: number): number {
  assertPositive(trafficErlangs, 'Tráfico ofrecido (A)');
  assertUnitInterval(targetGoS, 'GoS objetivo');

  const MAX_CHANNELS = 100_000; // guard against a pathological/unreachable target
  let blocking = 1;
  let channels = 0;
  while (blocking > targetGoS) {
    channels += 1;
    if (channels > MAX_CHANNELS) {
      throw new Error('No se alcanzó el GoS objetivo con un número razonable de canales.');
    }
    blocking = (trafficErlangs * blocking) / (channels + trafficErlangs * blocking);
  }
  return channels;
}
