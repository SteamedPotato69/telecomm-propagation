import { describe, expect, it } from 'vitest';
import { LocalizedError } from '../../utils/localizedMessage';
import { deriveGameMission, missionFromPlan1g2g, missionFromPlan3g } from './gameMission';
import { calculatePlan1g2g } from './plan1g2g';
import { calculatePlan3g } from './plan3g';
import { COURSE_1G, COURSE_2G } from './presets';

const HEX = (3 * Math.sqrt(3)) / 2;

describe('deriveGameMission', () => {
  it('the hexagon has exactly the cell area the plan decided: plannedCells * Sc = S_T', () => {
    for (const [area, cells, n] of [[50, 6, 7], [50, 7, 4], [50, 20, 1], [333, 12, 3]] as const) {
      const mission = deriveGameMission({ generation: '1g', totalAreaKm2: area, clusterSize: n, plannedCells: cells });
      expect(HEX * mission.hexRadiusKm ** 2 * cells).toBeCloseTo(area, 9);
      expect(Math.PI * mission.circleEquivalentRadiusKm ** 2 * cells).toBeCloseTo(area, 9);
    }
  });

  it('co-channel distance and lattice step follow the geometry: D = sqrt(3N)*R, d = sqrt(3)*R', () => {
    const mission = deriveGameMission({ generation: '1g', totalAreaKm2: 50, clusterSize: 7, plannedCells: 6 });
    expect(mission.reuseDistanceKm).toBeCloseTo(Math.sqrt(21) * mission.hexRadiusKm, 9);
    expect(mission.latticeStepKm).toBeCloseTo(Math.sqrt(3) * mission.hexRadiusKm, 9);
  });

  it('the hexagon is larger than the equal-area circle (hexagon 3*sqrt(3)/2 R^2 < circle pi R^2 for the same R)', () => {
    const mission = deriveGameMission({ generation: '1g', totalAreaKm2: 50, clusterSize: 7, plannedCells: 6 });
    expect(mission.hexRadiusKm).toBeGreaterThan(mission.circleEquivalentRadiusKm);
    expect(mission.hexRadiusKm / mission.circleEquivalentRadiusKm).toBeCloseTo(Math.sqrt(Math.PI / HEX), 9);
  });

  it('rejects a non-integer or non-positive cell count and an invalid cluster size', () => {
    const ok = { generation: '2g' as const, totalAreaKm2: 50, clusterSize: 4, plannedCells: 7 };
    expect(() => deriveGameMission({ ...ok, plannedCells: 0 })).toThrow(LocalizedError);
    expect(() => deriveGameMission({ ...ok, plannedCells: 6.5 })).toThrow(LocalizedError);
    expect(() => deriveGameMission({ ...ok, clusterSize: 5 })).toThrow(LocalizedError);
  });
});

describe('missions from the course plans', () => {
  it('1G: 6 cells, N=7 -> hex R = 1.791 km, circle R = 1.629 km, D = 8.207 km; warns that 7 > 6', () => {
    const mission = missionFromPlan1g2g(calculatePlan1g2g(COURSE_1G));
    expect(mission.plannedCells).toBe(6);
    expect(mission.cellAreaKm2).toBeCloseTo(8.3333, 3);
    expect(mission.hexRadiusKm).toBeCloseTo(1.7909, 3);
    expect(mission.circleEquivalentRadiusKm).toBeCloseTo(1.6286, 3);
    expect(mission.reuseDistanceKm).toBeCloseTo(8.2068, 3);
    // S_RC = 7 * 8.333 = 58.3 km^2 > S_T = 50: floor(0.857) + 1 = 1 cluster
    expect(mission.clusterCountQ).toBe(1);
    expect(mission.warnings).toEqual([{ key: 'warnings.clusterLargerThanPlan', params: { n: 7, cells: 6 } }]);
  });

  it('2G: 7 cells, N=4 -> hex R = 1.658 km, Q = 2, no cluster warning', () => {
    const mission = missionFromPlan1g2g(calculatePlan1g2g(COURSE_2G));
    expect(mission.plannedCells).toBe(7);
    expect(mission.hexRadiusKm).toBeCloseTo(1.6581, 3);
    expect(mission.reuseDistanceKm).toBeCloseTo(5.7442, 3);
    expect(mission.clusterCountQ).toBe(2);
    expect(mission.warnings).toEqual([]);
  });

  it('3G: 20 NodeBs, N=1 -> hex R = 0.981 km; Q = 21 because the literal E[.]+1 adds one on an exact ratio (50/2.5 = 20)', () => {
    const mission = missionFromPlan3g(calculatePlan3g({ totalAreaKm2: 50, users: 10000, erlangPerUser: 0.025 }));
    expect(mission).not.toBeNull();
    expect(mission!.plannedCells).toBe(20);
    expect(mission!.clusterSize).toBe(1);
    expect(mission!.hexRadiusKm).toBeCloseTo(0.9809, 3);
    expect(mission!.clusterCountQ).toBe(21);
    expect(mission!.warnings).toEqual([]);
  });

  it('3G without a converged loop has no mission (the game cannot start from a plan that has no result)', () => {
    const plan = calculatePlan3g({ totalAreaKm2: 50, users: 10000, erlangPerUser: 0.025, advanced: { maxIterations: 1 } });
    expect(missionFromPlan3g(plan)).toBeNull();
  });
});
