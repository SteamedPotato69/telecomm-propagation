import { describe, expect, it } from 'vitest';
import { clusterTools, evaluateArea, findMinimalTiling, polygonArea } from '../layout';
import { TUTORIAL_IDS, TUTORIAL_LEVELS, isTutorial, missionKey, nextTutorial, tutorialSetup } from './levels';

describe('the tutorial path', () => {
  it('has the four levels in order and each unlocks the next', () => {
    expect(TUTORIAL_IDS).toEqual(['hexagon', 'patch', 'cluster', 'reuse']);
    expect(nextTutorial('hexagon')).toBe('patch');
    expect(nextTutorial('cluster')).toBe('reuse');
    expect(nextTutorial('reuse')).toBeNull();
  });

  it('tells tutorials from missions', () => {
    expect(isTutorial('patch')).toBe(true);
    expect(isTutorial('mission-1g')).toBe(false);
    expect(missionKey('3g')).toBe('mission-3g');
  });

  it('only teaches cluster sizes the course allows, growing one idea at a time', () => {
    const sizes = TUTORIAL_LEVELS.map((level) => level.clusterSize);
    expect(sizes).toEqual([1, 1, 3, 7]);
    for (const level of TUTORIAL_LEVELS) expect(() => clusterTools(level.clusterSize)).not.toThrow();
    // the reuse distance is only drawn where there is more than one colour to compare
    expect(TUTORIAL_LEVELS.filter((level) => level.showReuseDistance).map((level) => level.id)).toEqual(['reuse']);
  });
});

describe.each(TUTORIAL_LEVELS.map((level) => [level.id] as const))('tutorial "%s"', (id) => {
  const setup = tutorialSetup(id);
  const level = TUTORIAL_LEVELS.find((item) => item.id === id)!;
  const evaluation = evaluateArea(setup.mission, setup.placement, setup.pxPerKm, setup.canvas);

  it('has an area worth exactly the cells it promises, in hexagons of 1 km', () => {
    expect(setup.mission.hexRadiusKm).toBeCloseTo(1, 9);
    expect(setup.mission.plannedCells).toBe(level.targetCells);
    expect(polygonArea(evaluation.polygonKm)).toBeCloseTo(setup.mission.totalAreaKm2, 6);
  });

  it('fits the canvas, with the hexagons big enough to see and touch on a phone', () => {
    expect(evaluation.fit.fits).toBe(true);
    expect(evaluation.playable).toBe(true);
    // the canvas is shown at about 45 % of its size on a 375 px screen: the hexagon must still be readable there
    expect(evaluation.hexRadiusPx * 0.45).toBeGreaterThanOrEqual(24);
  });

  it('can be solved, with a number of clusters a beginner can place', () => {
    const optimum = findMinimalTiling(evaluation.polygonKm, setup.mission.hexRadiusKm, level.clusterSize);
    expect(optimum.clusters).toBeGreaterThanOrEqual(2);
    expect(optimum.clusters).toBeLessThanOrEqual(12);
  });
});
