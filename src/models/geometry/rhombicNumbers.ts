/**
 * Sample {m,n,N} triples from docs/curso-referencia.md §13.1 (diap. 23) --
 * illustrative examples from the slide, not the full set of valid cluster
 * sizes. See isValidRhombicNumber below for the actual membership test.
 */
export const RHOMBIC_NUMBER_EXAMPLES: { m: number; n: number; clusterSize: number }[] = [
  { m: 0, n: 2, clusterSize: 4 },
  { m: 1, n: 1, clusterSize: 3 },
  { m: 1, n: 2, clusterSize: 7 },
  { m: 1, n: 3, clusterSize: 13 },
  { m: -1, n: 2, clusterSize: 3 },
  { m: -1, n: 3, clusterSize: 7 },
  { m: 2, n: 2, clusterSize: 12 },
  { m: 0, n: 3, clusterSize: 9 },
];

/**
 * A cluster size N is geometrically possible for hexagonal frequency reuse
 * only if N = i^2 + i*j + j^2 for some non-negative integers i, j (the
 * "rhombic"/Loschian numbers -- the norm form of the hexagonal lattice).
 * The course's own worked table above is a handful of examples from one
 * slide, not the complete set (N=1, 16, 19, 21... are valid too but don't
 * appear there) -- this checks the actual algebraic condition instead of
 * only matching the sample table, so a valid N the slide didn't happen to
 * list isn't rejected.
 */
export function isValidRhombicNumber(clusterSize: number): boolean {
  if (!Number.isInteger(clusterSize) || clusterSize <= 0) return false;
  const bound = Math.ceil(Math.sqrt(clusterSize)) + 1;
  for (let i = 0; i <= bound; i++) {
    for (let j = 0; j <= bound; j++) {
      if (i * i + i * j + j * j === clusterSize) return true;
    }
  }
  return false;
}
