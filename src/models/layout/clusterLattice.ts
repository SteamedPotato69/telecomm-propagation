import { LocalizedError } from '../../utils/localizedMessage';
import { isValidRhombicNumber } from '../geometry';
import { axialToPoint, hexVertices, pointToAxial } from './hexGrid';
import type { Axial, HexFrame, Point } from './hexGrid';

/**
 * The puzzle piece: a cluster (agrupación) of N cells, each cell a different
 * frequency group (a different colour), that repeats to cover the plane
 * without gaps or overlaps (docs/curso-referencia.md §13.1, diap. 22-24).
 *
 * Only certain translations repeat a cluster that way: the ones that move a
 * cell onto the next cell using the same frequency, at the reuse distance
 * D = sqrt(3N)*R. In axial coordinates, for N = i^2 + ij + j^2 those are the
 * integer combinations of
 *     v1 = (i, j)        v2 = (-j, i + j)
 * (the "rhombic number" condition of diap. 22-23). Two cells share a colour
 * exactly when they differ by such a combination, so the colour of a cell is
 * its class modulo that sub-lattice. That is what makes the pieces "snap":
 * dropping a cluster anywhere is rounded to the nearest valid translation.
 *
 * Checked in the tests for every valid N up to 91: exactly N colours, the
 * closest two cells of the same colour are exactly D apart, and translating a
 * cluster by v1 or v2 maps it onto itself.
 */
export interface ClusterLattice {
  clusterSize: number;
  i: number;
  j: number;
  v1: Axial;
  v2: Axial;
}

/** A cluster's position: how many v1 and v2 steps it is translated from the reference cluster. */
export interface ClusterTranslation {
  a: number;
  b: number;
}

export interface ClusterTools {
  lattice: ClusterLattice;
  /** The N cells of the reference cluster (translation 0,0), compact around its centre. */
  baseCells: Axial[];
  /** Colour (frequency group) of any cell, 0..N-1. Cells with the same colour are D apart or more. */
  colorOf(cell: Axial): number;
  /** Which cluster translation the given cell belongs to. */
  translationOf(cell: Axial): ClusterTranslation;
  /** The N cells of the cluster at a translation. */
  cellsAt(translation: ClusterTranslation): Axial[];
  /** Geometric centre of the cluster at a translation, in the frame's coordinates. */
  centerOf(translation: ClusterTranslation, frame: HexFrame): Point;
  /** The valid translation whose cluster centre is nearest to `point`. */
  snap(point: Point, frame: HexFrame): ClusterTranslation;
}

/** (i, j) with N = i^2 + ij + j^2, i >= j >= 0 and the smallest i (the choice only fixes the lattice's handedness). */
export function clusterLatticeFor(clusterSize: number): ClusterLattice {
  if (!isValidRhombicNumber(clusterSize)) {
    throw new LocalizedError('errors.invalidClusterSize', { n: clusterSize });
  }
  for (let i = 1; i <= clusterSize; i++) {
    for (let j = 0; j <= i; j++) {
      if (i * i + i * j + j * j === clusterSize) {
        return { clusterSize, i, j, v1: { q: i, r: j }, v2: { q: -j, r: i + j } };
      }
    }
  }
  /* c8 ignore next -- unreachable: isValidRhombicNumber guarantees a solution */
  throw new LocalizedError('errors.invalidClusterSize', { n: clusterSize });
}

const toolsCache = new Map<number, ClusterTools>();

/** Cached per N: the tables are tiny but built often (every drag frame asks for them). */
export function clusterTools(clusterSize: number): ClusterTools {
  const cached = toolsCache.get(clusterSize);
  if (cached) return cached;
  const tools = buildClusterTools(clusterLatticeFor(clusterSize));
  toolsCache.set(clusterSize, tools);
  return tools;
}

const unitFrame: HexFrame = { radius: 1, rotationRad: 0, origin: { x: 0, y: 0 } };
const key = (cell: Axial) => `${cell.q},${cell.r}`;

function buildClusterTools(lattice: ClusterLattice): ClusterTools {
  const { clusterSize: n, i, j, v1, v2 } = lattice;

  /**
   * Reduce a cell to the canonical member of its class inside the fundamental
   * parallelogram of the sub-lattice. The numerators are integers, so the floor
   * is exact (no epsilon): x = ((i+j)q + j r)/N, y = (-j q + i r)/N.
   */
  const reduce = (cell: Axial): { rep: Axial; a: number; b: number } => {
    const a = Math.floor(((i + j) * cell.q + j * cell.r) / n);
    const b = Math.floor((-j * cell.q + i * cell.r) / n);
    return { rep: { q: cell.q - a * v1.q - b * v2.q, r: cell.r - a * v1.r - b * v2.r }, a, b };
  };

  // Where to centre the reference cluster. Any one-member-per-class choice tiles the plane, but
  // a cluster picked around an arbitrary point can be a skewed parallelogram. Try every cell
  // centre, vertex and edge midpoint near the middle of the fundamental parallelogram and keep
  // the one that minimises the total squared distance to the nearest member of each class: that
  // is the most compact cluster (for N = 7, the centre cell with its six neighbours -- the
  // "flower" diap. 24 draws).
  const p1 = axialToPoint(v1, unitFrame);
  const p2 = axialToPoint(v2, unitFrame);
  const middle: Point = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  const around = pointToAxial(middle, unitFrame);
  const reach = 2 * (i + j) + 3;

  const windowCells: { cell: Axial; point: Point; classKey: string }[] = [];
  for (let dq = -reach; dq <= reach; dq++) {
    for (let dr = -reach; dr <= reach; dr++) {
      const cell = { q: around.q + dq, r: around.r + dr };
      windowCells.push({ cell, point: axialToPoint(cell, unitFrame), classKey: key(reduce(cell).rep) });
    }
  }

  const candidates = new Map<string, Point>();
  for (const { cell, point } of windowCells) {
    if (Math.hypot(point.x - middle.x, point.y - middle.y) > (i + j + 1) * Math.sqrt(3)) continue;
    const corners = [point, ...hexVertices(point, 1, 0)];
    for (const c of corners) candidates.set(`${c.x.toFixed(6)},${c.y.toFixed(6)}`, c);
  }

  type Pick = { cell: Axial; distance: number };
  const nearestPerClass = (c: Point): { picks: Map<string, Pick>; cost: number } => {
    const picks = new Map<string, Pick>();
    for (const { cell, point, classKey } of windowCells) {
      const distance = Math.hypot(point.x - c.x, point.y - c.y);
      const current = picks.get(classKey);
      if (
        !current ||
        distance < current.distance - 1e-9 ||
        (Math.abs(distance - current.distance) <= 1e-9 && (cell.q < current.cell.q || (cell.q === current.cell.q && cell.r < current.cell.r)))
      ) {
        picks.set(classKey, { cell, distance });
      }
    }
    let cost = 0;
    for (const pick of picks.values()) cost += pick.distance * pick.distance;
    return { picks, cost };
  };

  let centre = middle;
  let best = nearestPerClass(middle);
  for (const candidate of candidates.values()) {
    const attempt = nearestPerClass(candidate);
    const closer =
      Math.hypot(candidate.x - middle.x, candidate.y - middle.y) < Math.hypot(centre.x - middle.x, centre.y - middle.y) - 1e-9;
    if (attempt.cost < best.cost - 1e-9 || (Math.abs(attempt.cost - best.cost) <= 1e-9 && closer)) {
      best = attempt;
      centre = candidate;
    }
  }

  // Stable colour order: nearest to the centre first, then by angle around it.
  const ordered = [...best.picks.entries()]
    .map(([classKey, entry]) => {
      const point = axialToPoint(entry.cell, unitFrame);
      return { classKey, cell: entry.cell, distance: entry.distance, angle: Math.atan2(point.y - centre.y, point.x - centre.x) };
    })
    .sort((u, v) => (Math.abs(u.distance - v.distance) > 1e-9 ? u.distance - v.distance : u.angle - v.angle));

  const colorByClass = new Map<string, number>();
  const baseByClass = new Map<string, Axial>();
  ordered.forEach((entry, index) => {
    colorByClass.set(entry.classKey, index);
    baseByClass.set(entry.classKey, entry.cell);
  });
  const baseCells = ordered.map((entry) => entry.cell);

  const colorOf = (cell: Axial): number => colorByClass.get(key(reduce(cell).rep)) as number;

  const translationOf = (cell: Axial): ClusterTranslation => {
    const base = baseByClass.get(key(reduce(cell).rep)) as Axial;
    const dq = cell.q - base.q;
    const dr = cell.r - base.r;
    // dq, dr = a*v1 + b*v2 with integer a, b; solve exactly (the division by N is exact here).
    return { a: Math.round(((i + j) * dq + j * dr) / n), b: Math.round((-j * dq + i * dr) / n) };
  };

  const cellsAt = ({ a, b }: ClusterTranslation): Axial[] =>
    baseCells.map((cell) => ({ q: cell.q + a * v1.q + b * v2.q, r: cell.r + a * v1.r + b * v2.r }));

  const centerOf = (translation: ClusterTranslation, frame: HexFrame): Point => {
    const points = cellsAt(translation).map((cell) => axialToPoint(cell, frame));
    return {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
    };
  };

  const snap = (point: Point, frame: HexFrame): ClusterTranslation => {
    const start = translationOf(pointToAxial(point, frame));
    let bestTranslation = start;
    let bestDistance = Infinity;
    for (let da = -1; da <= 1; da++) {
      for (let db = -1; db <= 1; db++) {
        const candidate = { a: start.a + da, b: start.b + db };
        const c = centerOf(candidate, frame);
        const distance = Math.hypot(c.x - point.x, c.y - point.y);
        if (distance < bestDistance - 1e-12) {
          bestDistance = distance;
          bestTranslation = candidate;
        }
      }
    }
    return bestTranslation;
  };

  return { lattice, baseCells, colorOf, translationOf, cellsAt, centerOf, snap };
}

/**
 * A frame in which the cluster at translation (0,0) is centred on `anchor`.
 * The first piece a player drops decides the lattice's position; every later
 * piece snaps relative to it.
 */
export function frameAnchoredAt(anchor: Point, radius: number, rotationRad: number, clusterSize: number): HexFrame {
  const tools = clusterTools(clusterSize);
  const probe: HexFrame = { radius, rotationRad, origin: { x: 0, y: 0 } };
  const centre = tools.centerOf({ a: 0, b: 0 }, probe);
  return { radius, rotationRad, origin: { x: anchor.x - centre.x, y: anchor.y - centre.y } };
}
