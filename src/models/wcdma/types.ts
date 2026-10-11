import type { PropagationInputs } from '../propagation';

/**
 * WCDMA uplink load + cell breathing (docs/curso-referencia.md §13.4,
 * confirmed against the original PDF diap. 66-74). Distinct vocabulary
 * from propagation/traffic/dimensioning -- continuous cell load, not
 * discrete Erlang-B channels.
 */
/** The course's three example services; the display name is the translation `wcdma.services.<id>`. */
export type WcdmaServiceId = 'voice' | 'ps64' | 'ps384';

export interface ServiceMix {
  id: WcdmaServiceId;
  /** Fraction of active users using this service, e.g. 0.70 for 70% voice. */
  shareOfUsers: number;
  /** R: bit rate, kbps. */
  bitRateKbps: number;
  /** Required Eb/No, dB. */
  ebN0Db: number;
  /** alpha: voice activity factor (1.0 for data services). */
  activityFactor: number;
  /**
   * Soft-handover macro-diversity gain, dB -- the course's own worked
   * example gives a different value per service (voice 3.0, PS64k 1.5,
   * PS384k 0.0), so this lives per-service rather than as one shared
   * link-budget constant.
   */
  softHandoverGainDb: number;
}

export interface ServiceLoad {
  id: WcdmaServiceId;
  /** Gp = 10*log10(W/R), dB. */
  processingGainDb: number;
  /** rho_i, linear (not dB) -- this service's uplink load contribution per active user. */
  loadFactorPerUser: number;
  /** NodeB receiver sensitivity for this service, dBm. */
  sensitivityDbm: number;
  /** Zero-load MAPL for this service, dB. */
  maplZeroLoadDb: number;
}

/** Terms shared by every service's link budget (only Eb/No, Gp, and soft-handover gain vary by service). */
export interface WcdmaCommonLinkBudget {
  /** Mobile EIRP, dBm. */
  eirpDbm: number;
  /** kTB: thermal noise floor over the chip bandwidth, dBm. */
  thermalNoiseDbm: number;
  /** NodeB receiver noise figure, dB. */
  noiseFigureDb: number;
  receiveAntennaGainDbi: number;
  feederLossDb: number;
  shadowFadingMarginDb: number;
}

export interface WcdmaLoadInputs {
  /** W: chip rate, Mcps (3.84 for UMTS). */
  chipRateMcps: number;
  services: ServiceMix[];
  /**
   * Which service's MAPL seeds the convergence loop and defines system
   * coverage -- must match one of `services[].id`. The course's own
   * example uses voice as this reference (a coverage-priority design
   * choice: "el servicio de voz define la cobertura", not the
   * mathematically most-restrictive service -- see wcdma.ts).
   */
  referenceServiceId: WcdmaServiceId;
  /** i_oc: other-cell interference factor. */
  interferenceFactor: number;
  /** eta_UL,max: target uplink load, strictly between 0 and 1. */
  targetUplinkLoad: number;
  linkBudget: WcdmaCommonLinkBudget;
  propagationInputs: Omit<PropagationInputs, 'distanceKm'>;
  solveDistanceKm: (inputs: Omit<PropagationInputs, 'distanceKm'>, targetLossDb: number) => number;
  totalUsers: number;
  /** Average Erlang per user (for the capacity-side NodeB count), same concept as models/dimensioning. */
  averageErlangPerUser: number;
  totalAreaKm2: number;
  maxIterations?: number;
  convergenceToleranceKm?: number;
  /**
   * Relaxation factor in (0,1] for the load update (nextLoad = load +
   * dampingFactor*(computedLoad-load)). Default 0.3 -- undamped
   * fixed-point iteration (1.0) oscillates/diverges for this feedback
   * loop at realistic inputs (verified: population swings from ~1.3km's
   * worth of users straight past the load ceiling and back), so some
   * damping is load-bearing, not cosmetic. See wcdma.ts's doc comment.
   */
  dampingFactor?: number;
}

export interface WcdmaIterationStep {
  iteration: number;
  /** eta at the start of this iteration. */
  loadFactor: number;
  loadMarginDb: number;
  maplEffectiveDb: number;
  radiusKm: number;
  /** Active (simultaneously transmitting) users in the cell, not raw registered population. */
  activeUsersPerCell: number;
  /** R(this) - R(previous); NaN for iteration 0 (no previous radius). */
  deltaRadiusKm: number;
}

export interface WcdmaLoadResult {
  services: ServiceLoad[];
  /** Traffic-weighted average load factor across the service mix. */
  mixLoadFactor: number;
  maxSimultaneousUsersPerCell: number;
  usersPerServicePerCell: { id: WcdmaServiceId; users: number }[];
  /** Full iteration trace, for display and diagnostics -- not just the final result. */
  iterations: WcdmaIterationStep[];
  /**
   * False if maxIterations was reached without the radius settling within
   * convergenceToleranceKm -- a valid computed outcome (like Tc=Infinity
   * in the fading simulator), not an error to throw on.
   */
  converged: boolean;
  finalRadiusKm: number | null;
  finalLoad: number | null;
  nodeBsByCoverage: number | null;
  nodeBsByCapacity: number;
  nodeBsFinal: number | null;
  bindingConstraint: 'capacity' | 'coverage' | null;
}
