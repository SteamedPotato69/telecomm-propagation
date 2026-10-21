import { polygonBounds } from './areaShape';
import { clusterTools } from './clusterLattice';
import type { ClusterTranslation } from './clusterLattice';
import { axialKey, axialToPoint, pointToAxial } from './hexGrid';
import type { HexFrame, Point } from './hexGrid';
import { DEFAULT_SAMPLE_COUNT, sampleArea } from './coverage';

/**
 * Lattice rotations the search tries, degrees. The player is offered exactly the
 * same ones, so the minimum the game found is a number the player can actually reach.
 */
export const LATTICE_ROTATIONS_DEG: readonly number[] = [0, 10, 20, 30, 40, 50];

export interface TilingOptions {
  /** Lattice rotations to try, degrees. Hexagons repeat every 60 degrees, so 0-50 covers everything. */
  rotationsDeg?: number[];
  /** Offsets tried along each cluster axis (k x k offsets per rotation). */
  offsetsPerAxis?: number;
  sampleCount?: number;
}

export interface TilingSolution {
  frame: HexFrame;
  translations: ClusterTranslation[];
  /** Clusters used. */
  clusters: number;
  /** Cells in those clusters (clusters * N). */
  cells: number;
  /** Cells that actually contain a part of the area (<= cells; the rest is border overhang). */
  cellsTouchingArea: number;
}

/**
 * The fewest clusters that cover the whole area, found by searching the
 * lattice's rotation and position.
 *
 * Because clusters tile the plane with no overlap, every point of the area
 * belongs to exactly one cluster once the lattice frame is fixed -- so "the
 * clusters needed" for a frame is simply the number of distinct clusters the
 * area's sample points fall into. The search tries rotations and offsets of the
 * frame and keeps the best. This is the game's reference ("optimum") for the
 * stars and for hints; it is a search over a grid of frames, so it is a very
 * good solution, not a proof of the global minimum.
 */
export function findMinimalTiling(
  polygon: Point[],
  radiusKm: number,
  clusterSize: number,
  options: TilingOptions = {}
): TilingSolution {
  const { rotationsDeg = [...LATTICE_ROTATIONS_DEG], offsetsPerAxis = 5, sampleCount = DEFAULT_SAMPLE_COUNT } = options;
  const samples = sampleArea(polygon, sampleCount);
  const tools = clusterTools(clusterSize);
  const { minX, minY, maxX, maxY } = polygonBounds(polygon);
  const middle: Point = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

  let best: (TilingSolution & { rank: [number, number] }) | null = null;

  for (const rotationDeg of rotationsDeg) {
    const rotationRad = (rotationDeg * Math.PI) / 180;
    const axes: HexFrame = { radius: radiusKm, rotationRad, origin: { x: 0, y: 0 } };
    const along1 = axialToPoint(tools.lattice.v1, axes);
    const along2 = axialToPoint(tools.lattice.v2, axes);

    for (let u = 0; u < offsetsPerAxis; u++) {
      for (let w = 0; w < offsetsPerAxis; w++) {
        const frame: HexFrame = {
          radius: radiusKm,
          rotationRad,
          origin: {
            x: middle.x + (u / offsetsPerAxis) * along1.x + (w / offsetsPerAxis) * along2.x,
            y: middle.y + (u / offsetsPerAxis) * along1.y + (w / offsetsPerAxis) * along2.y,
          },
        };

        const translations = new Map<string, ClusterTranslation>();
        const touchedCells = new Set<string>();
        for (const sample of samples) {
          const cell = pointToAxial(sample, frame);
          touchedCells.add(axialKey(cell));
          const translation = tools.translationOf(cell);
          translations.set(`${translation.a},${translation.b}`, translation);
        }

        const rank: [number, number] = [translations.size, touchedCells.size];
        if (best === null || rank[0] < best.rank[0] || (rank[0] === best.rank[0] && rank[1] < best.rank[1])) {
          best = {
            frame,
            translations: [...translations.values()],
            clusters: translations.size,
            cells: translations.size * clusterSize,
            cellsTouchingArea: touchedCells.size,
            rank,
          };
        }
      }
    }
  }

  const { rank: _rank, ...solution } = best as NonNullable<typeof best>;
  return solution;
}
