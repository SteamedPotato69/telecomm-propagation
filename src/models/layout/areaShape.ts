import { LocalizedError } from '../../utils/localizedMessage';
import { assertInRange, assertPositive } from '../../utils/validation';
import type { Point } from './hexGrid';

/**
 * The area the plan decided (S_T, km^2) as a shape the player can move over the
 * map. The shape always has EXACTLY that area -- the plan fixes S_T and the game
 * never changes it -- so only its proportions, rotation and position are free.
 */
export type AreaShapeKind = 'rectangle' | 'ellipse';

export interface AreaShapeSpec {
  kind: AreaShapeKind;
  /** S_T, km^2: the area of the resulting polygon. */
  areaKm2: number;
  /** Width / height before rotation. 1 = square (rectangle) or circle (ellipse). */
  aspectRatio: number;
  rotationRad: number;
  center: Point;
}

/** Aspect ratios outside this range give needles, not areas worth covering. */
export const MIN_ASPECT_RATIO = 0.2;
export const MAX_ASPECT_RATIO = 5;

const ELLIPSE_SEGMENTS = 96;

/** Shoelace formula; positive or negative depending on winding, so the absolute value is returned. */
export function polygonArea(polygon: Point[]): number {
  let twiceArea = 0;
  polygon.forEach((p, k) => {
    const q = polygon[(k + 1) % polygon.length];
    twiceArea += p.x * q.y - q.x * p.y;
  });
  return Math.abs(twiceArea) / 2;
}

export function polygonBounds(polygon: Point[]): { minX: number; minY: number; maxX: number; maxY: number } {
  const xs = polygon.map((p) => p.x);
  const ys = polygon.map((p) => p.y);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

/** Ray-casting test; a point exactly on an edge may fall either way, which is irrelevant for area sampling. */
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let k = 0, previous = polygon.length - 1; k < polygon.length; previous = k++) {
    const a = polygon[k];
    const b = polygon[previous];
    const crosses = a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

/** Vertices (km) of the shape, with area exactly `areaKm2`. */
export function areaShapePolygon(spec: AreaShapeSpec): Point[] {
  const { kind, areaKm2, aspectRatio, rotationRad, center } = spec;
  assertPositive(areaKm2, 'totalCoverageArea');
  assertInRange(aspectRatio, MIN_ASPECT_RATIO, MAX_ASPECT_RATIO, 'aspectRatio');

  let outline: Point[];
  if (kind === 'rectangle') {
    const halfWidth = Math.sqrt(areaKm2 * aspectRatio) / 2;
    const halfHeight = Math.sqrt(areaKm2 / aspectRatio) / 2;
    outline = [
      { x: -halfWidth, y: -halfHeight },
      { x: halfWidth, y: -halfHeight },
      { x: halfWidth, y: halfHeight },
      { x: -halfWidth, y: halfHeight },
    ];
  } else {
    // semi-axes a, b with pi*a*b = A and a/b = aspect ratio
    const a = Math.sqrt((areaKm2 * aspectRatio) / Math.PI);
    const b = Math.sqrt(areaKm2 / (Math.PI * aspectRatio));
    outline = Array.from({ length: ELLIPSE_SEGMENTS }, (_, k) => {
      const angle = (2 * Math.PI * k) / ELLIPSE_SEGMENTS;
      return { x: a * Math.cos(angle), y: b * Math.sin(angle) };
    });
    // A polygon inscribed in the ellipse is slightly smaller than the ellipse; rescale so the
    // area is exactly S_T (the correction is ~0.04 %).
    const factor = Math.sqrt(areaKm2 / polygonArea(outline));
    outline = outline.map((p) => ({ x: p.x * factor, y: p.y * factor }));
  }

  const cos = Math.cos(rotationRad);
  const sin = Math.sin(rotationRad);
  return outline.map((p) => ({ x: center.x + p.x * cos - p.y * sin, y: center.y + p.x * sin + p.y * cos }));
}

/** A polygon the game can sample: at least 3 distinct vertices and a non-zero area. */
export function assertUsablePolygon(polygon: Point[]): void {
  if (polygon.length < 3 || polygonArea(polygon) <= 1e-12) {
    throw new LocalizedError('errors.polygonDegenerate');
  }
}
