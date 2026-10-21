import { hexArea, initialAreaPlacement, areaDimensionsKm } from '../layout';
import type { AreaPlacement } from '../layout';
import { deriveGameMission } from '../plan';
import type { GameMission, Generation } from '../plan';

/**
 * The path: four short tutorials with made-up data, then the student's own
 * mission (their plan, their picture). The tutorials teach the pieces one idea
 * at a time and run on the same puzzle screen as the mission -- they are data,
 * not a second game.
 */
export type TutorialId = 'hexagon' | 'patch' | 'cluster' | 'reuse';
export type MissionId = 'mission-1g' | 'mission-2g' | 'mission-3g';
/** Anything the player can earn stars in. */
export type LevelKey = TutorialId | MissionId;

export const missionKey = (generation: Generation): MissionId => `mission-${generation}`;

export interface TutorialLevel {
  id: TutorialId;
  /** N: cells per cluster. 1, 3 and 7 are valid "rhombic numbers" (docs/curso-referencia.md §13.1, diap. 22-23). */
  clusterSize: number;
  /** How many cells' worth of area has to be covered: the area is `targetCells` hexagons of radius 1 km. */
  targetCells: number;
  /** Width / height of the rectangle. */
  aspectRatio: number;
  /** Draw the distance D between same-colour cells of neighbouring clusters (level "reuse"). */
  showReuseDistance: boolean;
}

/** In order: each one unlocks the next. */
export const TUTORIAL_LEVELS: readonly TutorialLevel[] = [
  // One hexagon is the cell; hexagons tile with no gaps and no overlap.
  { id: 'hexagon', clusterSize: 1, targetCells: 2, aspectRatio: 1.5, showReuseDistance: false },
  // Same idea on a bigger patch: practise snapping.
  { id: 'patch', clusterSize: 1, targetCells: 9, aspectRatio: 1.5, showReuseDistance: false },
  // A cluster of N cells = N frequency groups (N = 3: the smallest one with more than a single colour).
  { id: 'cluster', clusterSize: 3, targetCells: 6, aspectRatio: 1.5, showReuseDistance: false },
  // The course's own example: N = 7, so the reuse distance is D = sqrt(21)*R.
  { id: 'reuse', clusterSize: 7, targetCells: 14, aspectRatio: 2, showReuseDistance: true },
];

export const TUTORIAL_IDS: readonly TutorialId[] = TUTORIAL_LEVELS.map((level) => level.id);

export const isTutorial = (key: LevelKey): key is TutorialId => (TUTORIAL_IDS as readonly string[]).includes(key);

export const tutorialLevel = (id: TutorialId): TutorialLevel => TUTORIAL_LEVELS.find((level) => level.id === id) as TutorialLevel;

/** The tutorial that comes right after this one, or null for the last. */
export function nextTutorial(id: TutorialId): TutorialId | null {
  const index = TUTORIAL_IDS.indexOf(id);
  return TUTORIAL_IDS[index + 1] ?? null;
}

/** The made-up map is a plain canvas of this size (the tutorials do not use a picture). */
export const TUTORIAL_CANVAS = { width: 800, height: 600 } as const;

/** Every tutorial hexagon has this circumradius, so the maths in the text is easy to follow. */
export const TUTORIAL_HEX_RADIUS_KM = 1;

/** Share of the canvas the tutorial area's bounding box takes: leaves room around it. */
const AREA_SHARE_OF_CANVAS = 0.72;

export interface TutorialSetup {
  mission: GameMission;
  canvas: { width: number; height: number };
  pxPerKm: number;
  placement: AreaPlacement;
}

/** Everything the puzzle needs to play a tutorial: no image, no reference line, no area placement to do. */
export function tutorialSetup(id: TutorialId): TutorialSetup {
  const level = tutorialLevel(id);
  const areaKm2 = level.targetCells * hexArea(TUTORIAL_HEX_RADIUS_KM);
  // `generation` only satisfies the type: a tutorial belongs to no generation of the course.
  const mission = deriveGameMission({
    generation: '1g',
    totalAreaKm2: areaKm2,
    clusterSize: level.clusterSize,
    plannedCells: level.targetCells,
  });

  const { widthKm, heightKm } = areaDimensionsKm('rectangle', areaKm2, level.aspectRatio);
  const pxPerKm =
    AREA_SHARE_OF_CANVAS * Math.min(TUTORIAL_CANVAS.width / widthKm, TUTORIAL_CANVAS.height / heightKm);
  const placement: AreaPlacement = { ...initialAreaPlacement(TUTORIAL_CANVAS), aspectRatio: level.aspectRatio };

  return { mission, canvas: TUTORIAL_CANVAS, pxPerKm, placement };
}
