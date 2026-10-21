import { clusterTools } from './clusterLattice';
import type { ClusterTranslation } from './clusterLattice';
import type { HexFrame, Point } from './hexGrid';
import { pointToAxial } from './hexGrid';

/**
 * Rules of the puzzle that are not geometry: colours, hints, auto-fill and
 * the score. Pure, so what "3 stars" means is testable and not buried in a screen.
 */

export const translationKey = (t: ClusterTranslation): string => `${t.a},${t.b}`;

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const hex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`;
}

/**
 * One colour per frequency group of a cluster. Spread evenly around the colour
 * wheel so neighbouring groups are told apart; N = 1 (3G, a single shared
 * frequency) uses the app's neon lilac. The colours are the same in light and
 * dark mode on purpose: they mean "frequency group", not "theme".
 */
export function clusterColors(clusterSize: number): string[] {
  if (clusterSize === 1) return ['#c084fc'];
  return Array.from({ length: clusterSize }, (_, k) => hslToHex((k * 360) / clusterSize + 12, 70, 55));
}

export type HelpLevel = 'none' | 'hints' | 'autofill';

export interface PuzzleScoreInput {
  /** 0-1, fraction of the area covered. */
  coverage: number;
  clustersUsed: number;
  /** Fewest clusters the game's own search found (models/layout/autoTiling). */
  optimumClusters: number;
  helpLevel: HelpLevel;
}

export interface PuzzleScore {
  /** The whole area is covered. */
  covered: boolean;
  /** 0-3. */
  stars: 0 | 1 | 2 | 3;
  /** Clusters beyond the optimum (never negative). */
  extraClusters: number;
}

/**
 * ★   the whole area is covered
 * ★★  ... using at most 2 clusters more than the optimum
 * ★★★ ... matching the optimum
 * Hints cap the score at 2 stars and auto-fill at 1: the stars measure what
 * the player worked out. The optimum is a search over lattice positions and
 * rotations, not a proof, so a player can occasionally beat it: that is still 3 stars.
 */
export function scorePuzzle({ coverage, clustersUsed, optimumClusters, helpLevel }: PuzzleScoreInput): PuzzleScore {
  const covered = coverage >= 1;
  const extraClusters = Math.max(0, clustersUsed - optimumClusters);
  if (!covered) return { covered, stars: 0, extraClusters };

  let stars: 1 | 2 | 3 = 1;
  if (extraClusters === 0) stars = 3;
  else if (clustersUsed - optimumClusters <= 2) stars = 2;

  const cap = helpLevel === 'autofill' ? 1 : helpLevel === 'hints' ? 2 : 3;
  return { covered, stars: Math.min(stars, cap) as 1 | 2 | 3, extraClusters };
}

/** How many sample points each not-yet-placed cluster would cover, most useful first. */
function uncoveredBuckets(
  samples: Point[],
  frame: HexFrame,
  clusterSize: number,
  placed: ClusterTranslation[]
): { translation: ClusterTranslation; count: number }[] {
  const tools = clusterTools(clusterSize);
  const have = new Set(placed.map(translationKey));
  const buckets = new Map<string, { translation: ClusterTranslation; count: number }>();
  for (const sample of samples) {
    const translation = tools.translationOf(pointToAxial(sample, frame));
    const key = translationKey(translation);
    if (have.has(key)) continue;
    const bucket = buckets.get(key);
    if (bucket) bucket.count++;
    else buckets.set(key, { translation, count: 1 });
  }
  return [...buckets.values()].sort((u, v) => v.count - u.count);
}

/** The cluster that would cover the most still-uncovered area, or null if everything is covered. */
export function suggestNextCluster(
  samples: Point[],
  frame: HexFrame,
  clusterSize: number,
  placed: ClusterTranslation[]
): ClusterTranslation | null {
  return uncoveredBuckets(samples, frame, clusterSize, placed)[0]?.translation ?? null;
}

/** Every cluster still needed to cover the area in this frame. */
export function remainingClusters(
  samples: Point[],
  frame: HexFrame,
  clusterSize: number,
  placed: ClusterTranslation[]
): ClusterTranslation[] {
  return uncoveredBuckets(samples, frame, clusterSize, placed).map((bucket) => bucket.translation);
}
