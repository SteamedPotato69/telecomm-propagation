import { areaShapePolygon, polygonBounds } from './areaShape';
import type { AreaShapeKind } from './areaShape';
import type { Point } from './hexGrid';
import type { ImageSize } from './scale';

/**
 * Where the player has put the area over the image. The centre is kept in image
 * PIXELS, not km: if the reference line is redrawn the area stays where it is on
 * the map and only its size on screen changes.
 */
export interface AreaPlacement {
  kind: AreaShapeKind;
  aspectRatio: number;
  rotationRad: number;
  centerPx: Point;
}

/** Proportions offered as chips (width : height). */
export const ASPECT_OPTIONS: { value: number; label: string }[] = [
  { value: 1 / 3, label: '1:3' },
  { value: 1 / 2, label: '1:2' },
  { value: 2 / 3, label: '2:3' },
  { value: 1, label: '1:1' },
  { value: 3 / 2, label: '3:2' },
  { value: 2, label: '2:1' },
  { value: 3, label: '3:1' },
];

/** One rotation step of the area, degrees. */
export const AREA_ROTATION_STEP_DEG = 15;

/** The most cells the puzzle draws; beyond that the SVG gets slow on a phone. */
export const MAX_PLAYABLE_CELLS = 800;

export function initialAreaPlacement(image: ImageSize): AreaPlacement {
  return { kind: 'rectangle', aspectRatio: 1, rotationRad: 0, centerPx: { x: image.width / 2, y: image.height / 2 } };
}

/** The shape (km) with the centre expressed in km: image pixel / pxPerKm. */
export function areaPolygonKm(areaKm2: number, placement: AreaPlacement, pxPerKm: number): Point[] {
  return areaShapePolygon({
    kind: placement.kind,
    areaKm2,
    aspectRatio: placement.aspectRatio,
    rotationRad: placement.rotationRad,
    center: { x: placement.centerPx.x / pxPerKm, y: placement.centerPx.y / pxPerKm },
  });
}

/** Extent (km) of the shape before rotation: what "it measures W x H km" reports. */
export function areaDimensionsKm(kind: AreaShapeKind, areaKm2: number, aspectRatio: number): { widthKm: number; heightKm: number } {
  const bounds = polygonBounds(
    areaShapePolygon({ kind, areaKm2, aspectRatio, rotationRad: 0, center: { x: 0, y: 0 } })
  );
  return { widthKm: bounds.maxX - bounds.minX, heightKm: bounds.maxY - bounds.minY };
}

/**
 * Keeps the whole shape inside the image. If the shape is bigger than the image
 * there is no valid position: it is centred, and the screen reports that it does not fit.
 */
export function clampAreaCenterPx(areaKm2: number, placement: AreaPlacement, pxPerKm: number, image: ImageSize): Point {
  const around = polygonBounds(
    areaShapePolygon({
      kind: placement.kind,
      areaKm2,
      aspectRatio: placement.aspectRatio,
      rotationRad: placement.rotationRad,
      center: { x: 0, y: 0 },
    })
  );
  const clampAxis = (value: number, min: number, max: number, size: number) => {
    const low = -min * pxPerKm;
    const high = size - max * pxPerKm;
    if (low > high) return (low + high) / 2;
    return Math.min(Math.max(value, low), high);
  };
  return {
    x: clampAxis(placement.centerPx.x, around.minX, around.maxX, image.width),
    y: clampAxis(placement.centerPx.y, around.minY, around.maxY, image.height),
  };
}
