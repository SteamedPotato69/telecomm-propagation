import type { LocalizedMessage } from '../../utils/localizedMessage';
import { assertPositive } from '../../utils/validation';
import { PROPAGATION_MODELS, recommendInvertibleModel } from '../propagation';
import type { InvertibleModelRecommendation, PropagationInputs } from '../propagation';
import { DEFAULT_SERVICE_MIX, calculateWcdmaUplinkLoad } from '../wcdma';
import type { ServiceMix, WcdmaCommonLinkBudget, WcdmaLoadResult, WcdmaServiceId } from '../wcdma';

/**
 * 3G planning, automated: the student gives three numbers (area, users,
 * traffic per user) and everything else comes from the course's worked UMTS
 * example (docs/curso-referencia.md §13.4, diap. 66-74) -- service mix, link
 * budget, load targets, band -- and is computed under the hood by the WCDMA
 * uplink-load model. Every default can still be overridden through `advanced`.
 */
export interface Plan3gAdvanced {
  /** W: chip rate, Mcps. */
  chipRateMcps: number;
  services: ServiceMix[];
  /** Service whose coverage defines the cell (the course uses voice). */
  referenceServiceId: WcdmaServiceId;
  /** i_oc: other-cell interference factor. */
  interferenceFactor: number;
  /** eta_UL,max: target uplink load, strictly between 0 and 1. */
  targetUplinkLoad: number;
  linkBudget: WcdmaCommonLinkBudget;
  frequencyMHz: number;
  baseStationHeightM: number;
  mobileHeightM: number;
  citySize: PropagationInputs['citySize'];
  environment: PropagationInputs['environment'];
  metropolitanCenter: boolean;
  maxIterations?: number;
  dampingFactor?: number;
}

/** Diap. 66/71-72: 3.84 Mcps, 70/20/10 mix, eta 50 %, i_oc 0.55, 2100 MHz, hb 30 m, EIRP 18 dBm. */
export const PLAN_3G_DEFAULTS: Plan3gAdvanced = {
  chipRateMcps: 3.84,
  services: DEFAULT_SERVICE_MIX,
  referenceServiceId: 'voice',
  interferenceFactor: 0.55,
  targetUplinkLoad: 0.5,
  linkBudget: {
    eirpDbm: 18,
    thermalNoiseDbm: -108.2,
    noiseFigureDb: 5.0,
    receiveAntennaGainDbi: 18,
    feederLossDb: 2,
    shadowFadingMarginDb: 8,
  },
  frequencyMHz: 2100,
  baseStationHeightM: 30,
  mobileHeightM: 1.5,
  citySize: 'large',
  environment: 'urban',
  metropolitanCenter: true,
};

/**
 * The cell-breathing loop is a damped fixed-point iteration. At the course's
 * density (10 000 users / 50 km^2) the default step (0.3) settles in 6
 * iterations, but at higher densities it oscillates and never settles.
 * Re-running with a smaller step finds the SAME fixed point (checked: 15 000
 * users gives R = 1.075 km with 0.3, 0.1 and 0.03), only more slowly, so the
 * plan retries with smaller steps instead of reporting "no result" for
 * a scenario that has one. Skipped when the caller fixes dampingFactor or
 * maxIterations: then exactly what was asked is run.
 */
const DAMPING_LADDER: readonly { dampingFactor: number; maxIterations: number }[] = [
  { dampingFactor: 0.3, maxIterations: 50 },
  { dampingFactor: 0.1, maxIterations: 300 },
  { dampingFactor: 0.03, maxIterations: 1500 },
];

export interface Plan3gInputs {
  /** S_T: total area to cover, km^2. */
  totalAreaKm2: number;
  users: number;
  /** Average traffic per user, Erlang (the course: 0.025). */
  erlangPerUser: number;
  advanced?: Partial<Plan3gAdvanced>;
}

export interface Plan3gResult {
  generation: '3g';
  totalAreaKm2: number;
  /** UMTS reuses one frequency everywhere (diap. 66), so the "cluster" is a single cell. */
  clusterSize: 1;
  propagationModel: InvertibleModelRecommendation;
  /** Full uplink-load result, including the iteration trace. */
  wcdma: WcdmaLoadResult;
  /** False when the cell-breathing loop did not settle; then there is no final count. */
  converged: boolean;
  /** Damping step that finally settled the loop (or the last one tried). */
  dampingFactorUsed: number;
  /**
   * NodeBs needed by capacity alone -- always available (it does not depend on
   * the loop), so when there is no final count it is still the minimum.
   */
  minCellsByCapacity: number;
  /** NodeBs = max(capacity, coverage); null when the loop did not converge. */
  cellsFinal: number | null;
  bindingConstraint: 'capacity' | 'coverage' | null;
  warnings: LocalizedMessage[];
}

export function calculatePlan3g(inputs: Plan3gInputs): Plan3gResult {
  const { totalAreaKm2, users, erlangPerUser } = inputs;
  assertPositive(totalAreaKm2, 'totalCoverageArea');
  assertPositive(users, 'totalUsers');
  assertPositive(erlangPerUser, 'averageErlangPerUser');

  const params: Plan3gAdvanced = { ...PLAN_3G_DEFAULTS, ...inputs.advanced };

  const propagationModel = recommendInvertibleModel(params.frequencyMHz);
  const model = PROPAGATION_MODELS[propagationModel.modelId];

  const runLoop = (dampingFactor: number | undefined, maxIterations: number | undefined) =>
    calculateWcdmaUplinkLoad({
    chipRateMcps: params.chipRateMcps,
    services: params.services,
    referenceServiceId: params.referenceServiceId,
    interferenceFactor: params.interferenceFactor,
    targetUplinkLoad: params.targetUplinkLoad,
    linkBudget: params.linkBudget,
    propagationInputs: {
      frequencyMHz: params.frequencyMHz,
      baseStationHeightM: params.baseStationHeightM,
      mobileHeightM: params.mobileHeightM,
      citySize: params.citySize,
      environment: params.environment,
      metropolitanCenter: params.metropolitanCenter,
    },
    solveDistanceKm: model.solveDistanceKm!,
    totalUsers: users,
    averageErlangPerUser: erlangPerUser,
    totalAreaKm2,
    maxIterations,
    dampingFactor,
  });

  const callerFixedTheLoop = params.dampingFactor !== undefined || params.maxIterations !== undefined;
  const attempts = callerFixedTheLoop
    ? [{ dampingFactor: params.dampingFactor, maxIterations: params.maxIterations }]
    : DAMPING_LADDER;
  let wcdma = runLoop(attempts[0].dampingFactor, attempts[0].maxIterations);
  let dampingFactorUsed = attempts[0].dampingFactor ?? 0.3; // wcdma.ts's own default step
  for (const attempt of attempts.slice(1)) {
    if (wcdma.converged) break;
    wcdma = runLoop(attempt.dampingFactor, attempt.maxIterations);
    dampingFactorUsed = attempt.dampingFactor as number;
  }

  const warnings: LocalizedMessage[] = [];
  if (!propagationModel.inRange && model.frequencyRangeMHz) {
    warnings.push({
      key: 'warnings.modelOutOfRange',
      params: {
        model: { key: `models.${model.id}.label` },
        frequency: params.frequencyMHz,
        min: model.frequencyRangeMHz[0],
        max: model.frequencyRangeMHz[1],
      },
    });
  }
  if (!wcdma.converged) {
    warnings.push({ key: 'warnings.cellBreathingNotConverged', params: {} });
  }
  // The course gives a downlink equation but no definition of beta (diap. 67), so only the uplink is evaluated.
  warnings.push({ key: 'warnings.uplinkOnly', params: {} });

  return {
    generation: '3g',
    totalAreaKm2,
    clusterSize: 1,
    propagationModel,
    wcdma,
    converged: wcdma.converged,
    dampingFactorUsed,
    minCellsByCapacity: wcdma.nodeBsByCapacity,
    cellsFinal: wcdma.nodeBsFinal,
    bindingConstraint: wcdma.bindingConstraint,
    warnings,
  };
}
