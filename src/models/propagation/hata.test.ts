import { describe, expect, it } from 'vitest';
import { calculateHataLoss, solveHataDistanceKm } from './hata';
import type { PropagationInputs } from './types';

const BASE_INPUTS: Omit<PropagationInputs, 'distanceKm'> = {
  frequencyMHz: 900,
  baseStationHeightM: 30,
  mobileHeightM: 1.5,
  citySize: 'large',
  environment: 'urban',
  metropolitanCenter: false,
};

describe('solveHataDistanceKm', () => {
  // docs/curso-referencia.md §13.3 (diap. 45-46, confirmed against the
  // original PDF): both worked examples state "modelo Okumura-Hata
  // Urbano" explicitly. Tolerance is loose (the professor rounds MAPL to
  // whole dB and R to 1 decimal km) -- solving for the *exact* stated
  // MAPL gives R=2.544/1.508 km, not exactly 2.5/1.5.
  it('MAPL=141dB -> R~=2.5km (1G example)', () => {
    expect(solveHataDistanceKm(BASE_INPUTS, 141)).toBeCloseTo(2.5, 1);
  });

  it('MAPL=133dB -> R~=1.5km (2G example)', () => {
    expect(solveHataDistanceKm(BASE_INPUTS, 133)).toBeCloseTo(1.5, 1);
  });

  it('round-trips with calculateHataLoss', () => {
    const distanceKm = 4.2;
    const loss = calculateHataLoss({ ...BASE_INPUTS, distanceKm }).pathLossDb;
    expect(solveHataDistanceKm(BASE_INPUTS, loss)).toBeCloseTo(distanceKm, 6);
  });

  it('throws for a non-positive frequency', () => {
    expect(() => solveHataDistanceKm({ ...BASE_INPUTS, frequencyMHz: 0 }, 140)).toThrow();
  });
});
