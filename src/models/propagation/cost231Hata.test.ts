import { describe, expect, it } from 'vitest';
import { calculateCost231HataLoss, solveCost231HataDistanceKm } from './cost231Hata';
import type { PropagationInputs } from './types';

const BASE_INPUTS: Omit<PropagationInputs, 'distanceKm'> = {
  frequencyMHz: 1800,
  baseStationHeightM: 30,
  mobileHeightM: 1.5,
  citySize: 'large',
  environment: 'urban',
  metropolitanCenter: false,
};

describe('solveCost231HataDistanceKm', () => {
  // No course-cited worked example uses COST-231-Hata for link budget
  // (both diap. 45-46 examples use plain Okumura-Hata, confirmed against
  // the original PDF) -- verified here by round-trip self-consistency
  // instead of a course oracle.
  it('round-trips with calculateCost231HataLoss', () => {
    const distanceKm = 3.1;
    const loss = calculateCost231HataLoss({ ...BASE_INPUTS, distanceKm }).pathLossDb;
    expect(solveCost231HataDistanceKm(BASE_INPUTS, loss)).toBeCloseTo(distanceKm, 6);
  });

  it('round-trips for a dense metropolitan center too (Cm=3dB)', () => {
    const inputs = { ...BASE_INPUTS, metropolitanCenter: true };
    const distanceKm = 1.8;
    const loss = calculateCost231HataLoss({ ...inputs, distanceKm }).pathLossDb;
    expect(solveCost231HataDistanceKm(inputs, loss)).toBeCloseTo(distanceKm, 6);
  });

  it('throws for a non-positive frequency', () => {
    expect(() => solveCost231HataDistanceKm({ ...BASE_INPUTS, frequencyMHz: 0 }, 140)).toThrow();
  });
});
