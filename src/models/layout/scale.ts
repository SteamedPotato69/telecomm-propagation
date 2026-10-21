import { LocalizedError } from '../../utils/localizedMessage';
import { assertPositive } from '../../utils/validation';
import { polygonBounds } from './areaShape';
import type { Point } from './hexGrid';

/**
 * The scale of the whole game: the player traces a line over the image and says
 * how long it is in reality (1 km by default). Everything else -- the area
 * shape, the hexagons -- is sized from that one measurement.
 *
 * Points are in the image's own pixels. Normalising x and y separately (0-1)
 * would distort distances on a non-square image, so the true width and height
 * are always used.
 */
export interface ReferenceLine {
  a: Point;
  b: Point;
  /** Real length of the traced line, km (the default is 1). */
  realKm: number;
}

/** Shorter than this and the tap/click error is a large fraction of the line, so the scale would be junk. */
export const MIN_REFERENCE_LINE_PX = 8;

/** Smaller hexagons than this are not readable or touchable. */
export const MIN_READABLE_HEX_PX = 14;

export const DEFAULT_REFERENCE_KM = 1;

/** Image pixels per kilometre. */
export function pixelsPerKm(line: ReferenceLine): number {
  assertPositive(line.realKm, 'referenceLength');
  const lengthPx = Math.hypot(line.b.x - line.a.x, line.b.y - line.a.y);
  if (lengthPx < MIN_REFERENCE_LINE_PX) {
    throw new LocalizedError('errors.referenceLineTooShort', { min: MIN_REFERENCE_LINE_PX });
  }
  return lengthPx / line.realKm;
}

export const kmToPx = (km: number, pxPerKm: number): number => km * pxPerKm;
export const pxToKm = (px: number, pxPerKm: number): number => px / pxPerKm;

export interface ImageSize {
  width: number;
  height: number;
}

export interface AreaFit {
  fits: boolean;
  /** Pixels the area's bounding box needs at the current scale. */
  requiredWidthPx: number;
  requiredHeightPx: number;
  /**
   * Largest scale (px per km) at which the area still fits inside the image.
   * Drawing the reference line shorter than this makes it fit: it is what the
   * "your 50 km^2 does not fit, trace a shorter 1 km line" message is based on.
   */
  maxPxPerKmToFit: number;
}

/** Does the area (a polygon in km) fit inside the image at this scale? */
export function checkAreaFits(polygonKm: Point[], pxPerKm: number, image: ImageSize): AreaFit {
  const { minX, minY, maxX, maxY } = polygonBounds(polygonKm);
  const widthKm = maxX - minX;
  const heightKm = maxY - minY;
  const requiredWidthPx = widthKm * pxPerKm;
  const requiredHeightPx = heightKm * pxPerKm;
  return {
    fits: requiredWidthPx <= image.width && requiredHeightPx <= image.height,
    requiredWidthPx,
    requiredHeightPx,
    maxPxPerKmToFit: Math.min(image.width / widthKm, image.height / heightKm),
  };
}

/** Radius of a hexagon on screen, in pixels. */
export const hexRadiusPx = (hexRadiusKm: number, pxPerKm: number): number => hexRadiusKm * pxPerKm;

/** true when the hexagons would be too small to see or touch at this scale. */
export const hexesTooSmall = (hexRadiusKm: number, pxPerKm: number): boolean =>
  hexRadiusPx(hexRadiusKm, pxPerKm) < MIN_READABLE_HEX_PX;
