import { describe, expect, it } from 'vitest';
import { solveHataDistanceKm } from '../propagation/hata';
import { calculateDimensioning } from './dimensioning';
import type { DimensioningInputs } from './types';

const HATA_GEOMETRY = {
  frequencyMHz: 900,
  baseStationHeightM: 30,
  mobileHeightM: 1.5,
  citySize: 'large' as const,
  environment: 'urban' as const,
  metropolitanCenter: false,
};

describe('calculateDimensioning', () => {
  // docs/curso-referencia.md §13.3 (diap. 44-45): 1G example.
  // Capacity side matches the course exactly (250 Erl / 59 ch/cell ->
  // A_c~=48.7 Erl/cell -> ceil(250/48.7)=6 cells, same as the course's
  // rounded 47 Erl/cell -> ceil(250/47)=6). Coverage side diverges from
  // the course's stated 3 cells: this pipeline computes MAPL=143dB (the
  // already-documented, unexplained 2dB-above-slide gap from Phase 4,
  // see linkBudget.ts), which gives a larger R (2.90km vs the slide's
  // 2.5km) and therefore fewer coverage cells (2, not 3) -- a downstream
  // consequence of that Phase 4 finding, not a new bug. The qualitative
  // conclusion the course reaches (1G is capacity-bound) still holds.
  it('1G example: capacity-bound, matches the course on cellsByCapacity and the binding constraint', () => {
    const inputs: DimensioningInputs = {
      totalTrafficErlangs: 250,
      channelsPerCell: 59,
      targetGoS: 0.02,
      linkBudget: {
        transmitPowerDbm: 33,
        transmitAntennaGainDbi: 0,
        bodyLossDb: 3,
        receiveAntennaGainDbi: 13,
        feederLossDb: 3,
        receiverSensitivityDbm: -116,
        shadowFadingMarginDb: 8,
        interferenceMarginDb: 5,
      },
      propagationInputs: HATA_GEOMETRY,
      solveDistanceKm: solveHataDistanceKm,
      totalAreaKm2: 50,
    };
    const result = calculateDimensioning(inputs);

    expect(result.cellsByCapacity).toBe(6); // matches §13.3 exactly
    expect(result.maplDb).toBeCloseTo(143, 6); // Phase 4's documented value, not the slide's 141
    expect(result.cellRadiusKm).toBeCloseTo(2.8995, 3);
    expect(result.cellsByCoverage).toBe(2); // diverges from the slide's 3 -- see comment above
    expect(result.cellsFinal).toBe(6);
    expect(result.bindingConstraint).toBe('capacity'); // matches the course's conclusion
  });

  // docs/curso-referencia.md §13.3 (diap. 44, 46): 2G example. Capacity
  // side again matches exactly (5 cells). MAPL matches the slide exactly
  // (133dB, see linkBudget.ts's 2G finding), but the resulting R (1.508km)
  // is just slightly above the slide's rounded 1.5km -- enough to tip
  // ceil(50/area) from 8 down to 7 at this specific boundary. Course's
  // qualitative conclusion (2G is coverage-bound) still holds.
  it('2G example: coverage-bound, matches the course on cellsByCapacity, MAPL, and the binding constraint', () => {
    const inputs: DimensioningInputs = {
      totalTrafficErlangs: 250,
      channelsPerCell: 70,
      targetGoS: 0.02,
      linkBudget: {
        transmitPowerDbm: 30,
        transmitAntennaGainDbi: 0,
        bodyLossDb: 3,
        receiveAntennaGainDbi: 15,
        feederLossDb: 3,
        receiverSensitivityDbm: -104,
        shadowFadingMarginDb: 8,
        interferenceMarginDb: 2,
      },
      propagationInputs: HATA_GEOMETRY,
      solveDistanceKm: solveHataDistanceKm,
      totalAreaKm2: 50,
    };
    const result = calculateDimensioning(inputs);

    expect(result.cellsByCapacity).toBe(5); // matches §13.3 exactly
    expect(result.maplDb).toBeCloseTo(133, 6); // matches the slide exactly
    expect(result.cellRadiusKm).toBeCloseTo(1.5081, 3);
    expect(result.cellsByCoverage).toBe(7); // diverges from the slide's 8 -- see comment above
    expect(result.cellsFinal).toBe(7);
    expect(result.bindingConstraint).toBe('coverage'); // matches the course's conclusion
  });

  it('throws for non-positive total traffic or area', () => {
    const base: DimensioningInputs = {
      totalTrafficErlangs: 250,
      channelsPerCell: 59,
      targetGoS: 0.02,
      linkBudget: {
        transmitPowerDbm: 33,
        transmitAntennaGainDbi: 0,
        bodyLossDb: 3,
        receiveAntennaGainDbi: 13,
        feederLossDb: 3,
        receiverSensitivityDbm: -116,
        shadowFadingMarginDb: 8,
        interferenceMarginDb: 5,
      },
      propagationInputs: HATA_GEOMETRY,
      solveDistanceKm: solveHataDistanceKm,
      totalAreaKm2: 50,
    };
    expect(() => calculateDimensioning({ ...base, totalTrafficErlangs: 0 })).toThrow();
    expect(() => calculateDimensioning({ ...base, totalAreaKm2: 0 })).toThrow();
  });
});
