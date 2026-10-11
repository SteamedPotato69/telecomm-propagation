import { describe, expect, it } from 'vitest';
import { blockingFromDensity, maxDensityForGoS } from './density';
import { erlangBInverseTraffic } from './erlangB';

describe('maxDensityForGoS', () => {
  // Not an independent course oracle: this is Phase 2's own already-verified
  // B^-1(42, 0.01) = 30.77 divided by the course's cell area (500 km^2,
  // diap. 31-32) -- a derived consistency check, not a new citation.
  it('matches rho = 30.77/500 = 0.0615 Erlang/km^2 (diap. 31-32)', () => {
    const density = maxDensityForGoS(42, 0.01, 500);
    expect(density).toBeCloseTo(30.77 / 500, 4);
  });

  it('agrees with erlangBInverseTraffic directly (density * area = traffic)', () => {
    const traffic = erlangBInverseTraffic(59, 0.02);
    const density = maxDensityForGoS(59, 0.02, 200);
    expect(density * 200).toBeCloseTo(traffic, 6);
  });
});

describe('blockingFromDensity', () => {
  it('round-trips through maxDensityForGoS back to the target GoS', () => {
    const channels = 70;
    const targetGoS = 0.02;
    const cellAreaKm2 = 150;
    const density = maxDensityForGoS(channels, targetGoS, cellAreaKm2);
    expect(blockingFromDensity(density, cellAreaKm2, channels)).toBeCloseTo(targetGoS, 4);
  });

  it('matches erlangBBlocking directly for a hand-picked density/area pair', () => {
    // rho=1 Erlang/km^2, Sc=30.77 km^2 -> A=30.77, same course-verified case as Phase 2.
    const blocking = blockingFromDensity(1, 30.77, 42);
    expect(blocking).toBeCloseTo(0.01, 2);
  });
});
