import { describe, expect, it } from 'vitest';
import { erlangBBlocking, erlangBInverseChannels, erlangBInverseTraffic } from './erlangB';

describe('erlangBBlocking', () => {
  it('B(0, A) = 1 for any traffic (no channels -> always blocked)', () => {
    expect(erlangBBlocking(0, 5)).toBe(1);
  });

  it('B(n, 0) = 0 for any channel count (no traffic -> never blocked)', () => {
    expect(erlangBBlocking(10, 0)).toBe(0);
  });

  it('stays finite for large K/A instead of overflowing (the reason for the recursive form)', () => {
    const result = erlangBBlocking(1000, 900);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it('throws for a non-integer channel count', () => {
    expect(() => erlangBBlocking(5.5, 3)).toThrow();
  });
});

describe('erlangBInverseTraffic (A = B^-1(K, GoS))', () => {
  it('matches the course example exactly: B^-1(42, 0.01) = 30.77 (§13.2, diap. 31)', () => {
    expect(erlangBInverseTraffic(42, 0.01)).toBeCloseTo(30.77, 1);
  });

  // The course's other two "verified" numbers are off by ~3-4% from a
  // continuous bisection inverse of this exact same recursion -- almost
  // certainly because the original material used a rounded/tabulated
  // Erlang B lookup table, not continuous inversion. The formula itself
  // is right (confirmed independently); asserting against the *continuous*
  // value here, and separately checking the course's rounded number is
  // only within a loose tolerance, keeps both facts visible instead of
  // quietly rounding away the discrepancy.
  it('B^-1(59, 0.02): matches the continuous inverse; course figure (47) is ~3.6% off, not a bug', () => {
    const traffic = erlangBInverseTraffic(59, 0.02);
    expect(traffic).toBeCloseTo(48.700404, 4);
    expect(Math.abs(traffic - 47) / 47).toBeLessThan(0.05);
  });

  it('B^-1(70, 0.02): matches the continuous inverse; course figure (57) is ~3.7% off, not a bug', () => {
    const traffic = erlangBInverseTraffic(70, 0.02);
    expect(traffic).toBeCloseTo(59.129109, 4);
    expect(Math.abs(traffic - 57) / 57).toBeLessThan(0.05);
  });

  it('round-trips through erlangBBlocking back to the target GoS', () => {
    const channels = 30;
    const targetGoS = 0.015;
    const traffic = erlangBInverseTraffic(channels, targetGoS);
    expect(erlangBBlocking(channels, traffic)).toBeCloseTo(targetGoS, 4);
  });

  it('throws for GoS outside (0,1)', () => {
    expect(() => erlangBInverseTraffic(10, 0)).toThrow();
    expect(() => erlangBInverseTraffic(10, 1)).toThrow();
  });
});

describe('erlangBInverseChannels (K = ceil(B^-1(A, GoS)))', () => {
  it('is consistent with the course example in the other direction (A=30.77, GoS=0.01 -> ~42 channels)', () => {
    // 30.77 is itself the course's rounded figure, not an exact input, so
    // this checks proximity (+/-1 channel), not an exact match.
    const channels = erlangBInverseChannels(30.77, 0.01);
    expect(Math.abs(channels - 42)).toBeLessThanOrEqual(1);
  });

  it('the returned channel count actually meets the target GoS', () => {
    const channels = erlangBInverseChannels(20, 0.02);
    expect(erlangBBlocking(channels, 20)).toBeLessThanOrEqual(0.02);
    expect(erlangBBlocking(channels - 1, 20)).toBeGreaterThan(0.02);
  });

  it('throws for GoS outside (0,1)', () => {
    expect(() => erlangBInverseChannels(20, 0)).toThrow();
    expect(() => erlangBInverseChannels(20, 1)).toThrow();
  });
});
