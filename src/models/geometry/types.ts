/**
 * Types for the cellular geometry / frequency-reuse module
 * (docs/curso-referencia.md §13.1). Mirrors models/fading's shape (typed
 * Inputs/Result, pure calculate()) -- a separate vocabulary from
 * PropagationInputs/FadingInputs, not a variant of either.
 */
export interface GeometryInputs {
  /** R: cell radius, km. */
  cellRadiusKm: number;
  /** N: cluster size -- must be a valid rhombic/Loschian number, see rhombicNumbers.ts. */
  clusterSize: number;
  /** S_T: total area to cover, km^2. Optional -- only needed for the cluster-count Q. */
  totalAreaKm2?: number;
}

export interface GeometryResult {
  /** d = R*sqrt(3), km -- lattice step. */
  latticeStepKm: number;
  /** D = sqrt(3*N)*R, km -- co-channel reuse distance. */
  reuseDistanceKm: number;
  /** Sc = (3*sqrt(3)/2)*R^2, km^2 -- hexagonal cell area. */
  cellAreaKm2: number;
  /** S_RC = N*Sc, km^2 -- co-channel rhombus area (covers N cells). */
  cocellAreaKm2: number;
  /** Sc/3, km^2 -- area per sector under 120 degree trisectorization. */
  sectorAreaKm2: number;
  /** Q, number of clusters to cover totalAreaKm2 -- present only when that input was supplied. */
  clusterCount?: number;
}
