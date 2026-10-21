import { describe, expect, it } from 'vitest';
import { confettiCount, confettiDuration, confettiPieces } from './confetti';

describe('confetti', () => {
  it('throws more confetti for more stars, none for none, and never more than for three', () => {
    expect(confettiCount(0)).toBe(0);
    expect(confettiCount(1)).toBeLessThan(confettiCount(2));
    expect(confettiCount(2)).toBeLessThan(confettiCount(3));
    expect(confettiCount(7)).toBe(confettiCount(3));
    expect(confettiCount(-1)).toBe(0);
  });

  it('is deterministic: the same seed throws the same confetti', () => {
    expect(confettiPieces(20, 42, 5)).toEqual(confettiPieces(20, 42, 5));
    expect(confettiPieces(20, 42, 5)).not.toEqual(confettiPieces(20, 43, 5));
  });

  it('keeps every number inside the range the screen expects', () => {
    for (const piece of confettiPieces(200, 7, 6)) {
      expect(piece.x).toBeGreaterThanOrEqual(0);
      expect(piece.x).toBeLessThan(1);
      expect(piece.delay).toBeGreaterThanOrEqual(0);
      expect(piece.delay).toBeLessThanOrEqual(0.6);
      expect(piece.duration).toBeGreaterThanOrEqual(1.4);
      expect(piece.duration).toBeLessThanOrEqual(2.6);
      expect(Math.abs(piece.drift)).toBeLessThanOrEqual(1);
      expect(piece.size).toBeGreaterThanOrEqual(6);
      expect(piece.size).toBeLessThanOrEqual(12);
      expect(Number.isInteger(piece.colorIndex)).toBe(true);
      expect(piece.colorIndex).toBeGreaterThanOrEqual(0);
      expect(piece.colorIndex).toBeLessThan(6);
    }
  });

  it('reports when the last piece has landed', () => {
    const pieces = confettiPieces(30, 1, 4);
    const last = Math.max(...pieces.map((piece) => piece.delay + piece.duration));
    expect(confettiDuration(pieces)).toBeCloseTo(last, 12);
    expect(confettiDuration([])).toBe(0);
  });
});
