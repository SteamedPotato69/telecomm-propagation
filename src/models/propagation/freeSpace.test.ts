import { describe, expect, it } from 'vitest';
import { calculateFreeSpaceLoss } from './freeSpace';
import type { PropagationInputs } from './types';

// Smoke test for the vitest setup itself (scoped to src/models/**, see
// vitest.config.ts) -- not new domain math, just proof the harness runs
// before the cellular-planning modules add their own real tests.
describe('calculateFreeSpaceLoss', () => {
  it('matches the hand-derived Friis value at 900 MHz, 1 km', () => {
    const inputs: PropagationInputs = {
      frequencyMHz: 900,
      distanceKm: 1,
      baseStationHeightM: 30,
      mobileHeightM: 1.5,
      citySize: 'large',
      environment: 'urban',
      metropolitanCenter: false,
    };
    const result = calculateFreeSpaceLoss(inputs);
    // 20*log10(1) + 20*log10(900) + 32.44
    expect(result.pathLossDb).toBeCloseTo(91.5249, 3);
  });
});
