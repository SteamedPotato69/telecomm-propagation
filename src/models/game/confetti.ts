/**
 * Where the confetti pieces fall. Pure and seeded: the same result always throws
 * the same confetti (testable), and the screen only has to animate the numbers.
 */
export interface ConfettiPiece {
  /** Horizontal start, 0-1 of the width. */
  x: number;
  /** Seconds to wait before this piece falls. */
  delay: number;
  /** Seconds the fall takes. */
  duration: number;
  /** Sideways drift while falling, -1..1 of a quarter of the width. */
  drift: number;
  /** Turns while falling (can be negative). */
  turns: number;
  /** Edge of the piece, px. */
  size: number;
  /** Index into the palette the screen provides. */
  colorIndex: number;
}

/** More stars, more confetti. No stars: none. */
export const confettiCount = (stars: number): number => Math.max(0, Math.min(3, Math.floor(stars))) * 18;

/** Small deterministic generator (mulberry32): enough for scattering confetti, nothing more. */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function confettiPieces(count: number, seed: number, paletteSize: number): ConfettiPiece[] {
  const next = random(seed);
  return Array.from({ length: count }, () => ({
    x: next(),
    delay: next() * 0.6,
    duration: 1.4 + next() * 1.2,
    drift: next() * 2 - 1,
    turns: (next() * 2 - 1) * 3,
    size: 6 + Math.floor(next() * 7),
    colorIndex: Math.floor(next() * paletteSize),
  }));
}

/** Time until the last piece has landed, seconds: when the layer can be removed. */
export const confettiDuration = (pieces: ConfettiPiece[]): number =>
  pieces.reduce((latest, piece) => Math.max(latest, piece.delay + piece.duration), 0);
