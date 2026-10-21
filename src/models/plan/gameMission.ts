import type { LocalizedMessage } from '../../utils/localizedMessage';
import { assertInteger, assertPositive } from '../../utils/validation';
import { calculateCellularGeometry } from '../geometry';
import type { Plan1g2gResult } from './plan1g2g';
import type { Plan3gResult } from './plan3g';

/** Area of a regular hexagon of circumradius R is HEX_AREA_FACTOR * R^2 (diap. 21: Sc = 3*sqrt(3)/2 * R^2). */
const HEX_AREA_FACTOR = (3 * Math.sqrt(3)) / 2;

/**
 * Everything the cell-puzzle needs from a finished plan, and nothing it could
 * change: the game reads this and never writes back to the plan.
 *
 * The hexagon's size is chosen so that its AREA equals the cell area the plan
 * decided (S_T / planned cells). The course uses two conventions -- a circular
 * cell area pi*R^2 when it counts cells by coverage (diap. 45-46) and a
 * hexagonal Sc = 3*sqrt(3)/2*R^2 in the geometry (diap. 21) -- so a hexagon
 * drawn with the plan's R would not cover the area the plan assumed. Keeping
 * the area makes the planned number of cells the target of the game, so the game
 * does not contradict the plan; the equivalent circle radius is reported so the
 * student can relate it to the R of the link budget.
 */
export interface GameMission {
  generation: '1g' | '2g' | '3g';
  /** S_T, km^2 -- the area to cover. */
  totalAreaKm2: number;
  /** N: cells per cluster (1G: 7, 2G: 4, 3G: 1). */
  clusterSize: number;
  /** Cells the plan says are needed. */
  plannedCells: number;
  /** S_T / plannedCells, km^2. */
  cellAreaKm2: number;
  /** Circumradius of the hexagon with that area, km -- the size drawn in the game. */
  hexRadiusKm: number;
  /** Radius of the circle with that same area, km (compare with the link-budget R). */
  circleEquivalentRadiusKm: number;
  /** d = R*sqrt(3), km: distance between centres of adjacent cells. */
  latticeStepKm: number;
  /** D = sqrt(3N)*R, km: distance between co-channel cells. */
  reuseDistanceKm: number;
  /** Q: clusters to cover S_T (diap. 24), for comparison with what the player uses. */
  clusterCountQ: number;
  warnings: LocalizedMessage[];
}

export interface GameMissionInput {
  generation: GameMission['generation'];
  totalAreaKm2: number;
  clusterSize: number;
  plannedCells: number;
}

export function deriveGameMission(input: GameMissionInput): GameMission {
  const { generation, totalAreaKm2, clusterSize, plannedCells } = input;
  assertPositive(totalAreaKm2, 'totalCoverageArea');
  assertPositive(plannedCells, 'plannedCells');
  assertInteger(plannedCells, 'plannedCells');

  const cellAreaKm2 = totalAreaKm2 / plannedCells;
  const hexRadiusKm = Math.sqrt(cellAreaKm2 / HEX_AREA_FACTOR);
  const geometry = calculateCellularGeometry({ cellRadiusKm: hexRadiusKm, clusterSize, totalAreaKm2 });

  const warnings: LocalizedMessage[] = [];
  if (plannedCells < clusterSize) {
    warnings.push({ key: 'warnings.clusterLargerThanPlan', params: { n: clusterSize, cells: plannedCells } });
  }

  return {
    generation,
    totalAreaKm2,
    clusterSize,
    plannedCells,
    cellAreaKm2,
    hexRadiusKm,
    circleEquivalentRadiusKm: Math.sqrt(cellAreaKm2 / Math.PI),
    latticeStepKm: geometry.latticeStepKm,
    reuseDistanceKm: geometry.reuseDistanceKm,
    clusterCountQ: geometry.clusterCount as number,
    warnings,
  };
}

export function missionFromPlan1g2g(plan: Plan1g2gResult): GameMission {
  return deriveGameMission({
    generation: plan.generation,
    totalAreaKm2: plan.totalAreaKm2,
    clusterSize: plan.clusterSize,
    plannedCells: plan.cellsFinal,
  });
}

/** null when the 3G plan has no final NodeB count (the cell-breathing loop did not converge). */
export function missionFromPlan3g(plan: Plan3gResult): GameMission | null {
  if (plan.cellsFinal === null) return null;
  return deriveGameMission({
    generation: '3g',
    totalAreaKm2: plan.totalAreaKm2,
    clusterSize: plan.clusterSize,
    plannedCells: plan.cellsFinal,
  });
}
