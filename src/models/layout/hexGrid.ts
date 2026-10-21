/**
 * Hexagonal cell grid in axial coordinates (docs/curso-referencia.md §13.1,
 * diap. 20-22: the planning lattice). Pure geometry in kilometres -- the
 * conversion to image pixels lives in scale.ts, so nothing here knows about
 * screens or images.
 *
 * Cells are "pointy-top" hexagons of circumradius R. Adjacent centres are
 * d = R*sqrt(3) apart (diap. 21). A whole lattice can be rotated and moved
 * with a HexFrame; rotation is a property of the frame, not of a cell.
 */
export interface Point {
  x: number;
  y: number;
}

/** Axial hex coordinates: q along the lattice's first axis, r along the second (60 degrees apart). */
export interface Axial {
  q: number;
  r: number;
}

export interface HexFrame {
  /** R: circumradius of every cell. */
  radius: number;
  /** Rotation of the whole lattice, radians, counter-clockwise. */
  rotationRad: number;
  /** Where cell (0,0) has its centre. */
  origin: Point;
}

const SQRT3 = Math.sqrt(3);

export const axialKey = (cell: Axial): string => `${cell.q},${cell.r}`;

export const axialFromKey = (key: string): Axial => {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
};

/** The six neighbours of a cell, in a fixed order starting along the lattice's x axis. */
export const AXIAL_DIRECTIONS: readonly Axial[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export const axialNeighbors = (cell: Axial): Axial[] =>
  AXIAL_DIRECTIONS.map((d) => ({ q: cell.q + d.q, r: cell.r + d.r }));

/** Number of steps between two cells (0 for the same cell, 1 for neighbours). */
export function axialDistance(a: Axial, b: Axial): number {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
}

/** Centre of a cell in the frame's coordinates. */
export function axialToPoint(cell: Axial, frame: HexFrame): Point {
  const x = frame.radius * SQRT3 * (cell.q + cell.r / 2);
  const y = frame.radius * 1.5 * cell.r;
  const cos = Math.cos(frame.rotationRad);
  const sin = Math.sin(frame.rotationRad);
  return { x: frame.origin.x + x * cos - y * sin, y: frame.origin.y + x * sin + y * cos };
}

/** The cell that contains a point (rounding in cube coordinates, so points on edges resolve consistently). */
export function pointToAxial(point: Point, frame: HexFrame): Axial {
  const dx = point.x - frame.origin.x;
  const dy = point.y - frame.origin.y;
  const cos = Math.cos(frame.rotationRad);
  const sin = Math.sin(frame.rotationRad);
  // undo the rotation
  const lx = dx * cos + dy * sin;
  const ly = -dx * sin + dy * cos;
  const q = ((SQRT3 / 3) * lx - ly / 3) / frame.radius;
  const r = ((2 / 3) * ly) / frame.radius;
  return cubeRound(q, r);
}

function cubeRound(q: number, r: number): Axial {
  const x = q;
  const z = r;
  const y = -x - z;
  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);
  const dx = Math.abs(rx - x);
  const dy = Math.abs(ry - y);
  const dz = Math.abs(rz - z);
  if (dx > dy && dx > dz) rx = -ry - rz;
  else if (dy > dz) ry = -rx - rz;
  else rz = -rx - ry;
  // `+ 0` turns a -0 into 0 so keys and equality checks behave
  return { q: rx + 0, r: rz + 0 };
}

/** The six corners of a hexagon centred at `center`, circumradius `radius`, lattice rotated by `rotationRad`. */
export function hexVertices(center: Point, radius: number, rotationRad: number): Point[] {
  return Array.from({ length: 6 }, (_, k) => {
    const angle = rotationRad + Math.PI / 6 + (k * Math.PI) / 3;
    return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
  });
}

/** Area of a regular hexagon of circumradius R: 3*sqrt(3)/2 * R^2 (diap. 21). */
export const hexArea = (radius: number): number => ((3 * SQRT3) / 2) * radius * radius;
