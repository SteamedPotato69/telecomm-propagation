import type { LocalizedMessage } from '../../utils/localizedMessage';
import { assertPositive } from '../../utils/validation';
import { calculateDimensioning } from '../dimensioning';
import type { DimensioningResult } from '../dimensioning';
import { PROPAGATION_MODELS, recommendInvertibleModel } from '../propagation';
import type { InvertibleModelRecommendation, LinkBudgetInputs, PropagationInputs } from '../propagation';
import { calculateAnalogFrequencyPlan, calculateDigitalFrequencyPlan } from './frequencyPlan';
import type { FrequencyPlanResult } from './frequencyPlan';

/**
 * The 1G/2G planning flow in the same order as the course's pencil-and-paper
 * solution (docs/curso-referencia.md §13.3, diap. 44-46):
 *
 *   1. scenario       -> A_T = users * Erlang/user
 *   2. spectrum       -> channels per cell (frequency plan, depends on N)
 *   3. capacity       -> A_c = B^-1(K, GoS), cells = ceil(A_T / A_c)
 *   4. coverage       -> link budget -> MAPL -> R -> cells = ceil(S_T / (pi R^2))
 *   5. result         -> cells = max(capacity, coverage)
 *
 * Pure orchestration of models that already exist (frequencyPlan,
 * dimensioning, propagation) -- no new formulas. The propagation model is
 * chosen from the frequency (see recommendInvertibleModel).
 */
export type Generation1g2g = '1g' | '2g';

export interface Plan1g2gScenario {
  /** S_T: total area to cover, km^2. */
  totalAreaKm2: number;
  /** Active users in the peak hour. */
  users: number;
  /** Average traffic per user, Erlang. */
  erlangPerUser: number;
  /** Target blocking probability (GoS), strictly between 0 and 1. */
  targetGoS: number;
}

export interface Plan1g2gSpectrum {
  bandwidthMHz: number;
  /** 1G channel width / 2G carrier spacing, kHz. */
  channelWidthKHz: number;
  /** N: cluster size. */
  clusterSize: number;
  /** 2G only: traffic channels per carrier (the course uses 7). */
  tchPerCarrier?: number;
  /** 1G only: control channels not available for traffic (the course uses 0). */
  controlChannels?: number;
}

export interface Plan1g2gCoverage {
  frequencyMHz: number;
  baseStationHeightM: number;
  mobileHeightM: number;
  citySize: PropagationInputs['citySize'];
  environment: PropagationInputs['environment'];
  metropolitanCenter: boolean;
  linkBudget: LinkBudgetInputs;
}

export interface Plan1g2gInputs {
  generation: Generation1g2g;
  scenario: Plan1g2gScenario;
  spectrum: Plan1g2gSpectrum;
  coverage: Plan1g2gCoverage;
}

export interface Plan1g2gResult {
  generation: Generation1g2g;
  totalAreaKm2: number;
  /** A_T = users * Erlang/user. */
  totalTrafficErlangs: number;
  clusterSize: number;
  frequencyPlan: FrequencyPlanResult;
  propagationModel: InvertibleModelRecommendation;
  /** Capacity path, link budget, coverage path and the final count (models/dimensioning). */
  dimensioning: DimensioningResult;
  /** Number of cells the plan needs: max(capacity, coverage). */
  cellsFinal: number;
  bindingConstraint: 'capacity' | 'coverage';
  warnings: LocalizedMessage[];
}

export function calculatePlan1g2g(inputs: Plan1g2gInputs): Plan1g2gResult {
  const { generation, scenario, spectrum, coverage } = inputs;

  assertPositive(scenario.totalAreaKm2, 'totalCoverageArea');
  assertPositive(scenario.users, 'totalUsers');
  assertPositive(scenario.erlangPerUser, 'averageErlangPerUser');
  const totalTrafficErlangs = scenario.users * scenario.erlangPerUser;

  const frequencyPlan =
    generation === '1g'
      ? calculateAnalogFrequencyPlan({
          bandwidthMHz: spectrum.bandwidthMHz,
          channelWidthKHz: spectrum.channelWidthKHz,
          clusterSize: spectrum.clusterSize,
          controlChannels: spectrum.controlChannels,
        })
      : calculateDigitalFrequencyPlan({
          bandwidthMHz: spectrum.bandwidthMHz,
          carrierWidthKHz: spectrum.channelWidthKHz,
          clusterSize: spectrum.clusterSize,
          tchPerCarrier: spectrum.tchPerCarrier ?? 7,
        });

  const propagationModel = recommendInvertibleModel(coverage.frequencyMHz);
  const model = PROPAGATION_MODELS[propagationModel.modelId];

  const dimensioning = calculateDimensioning({
    totalTrafficErlangs,
    channelsPerCell: frequencyPlan.channelsPerCell,
    targetGoS: scenario.targetGoS,
    linkBudget: coverage.linkBudget,
    propagationInputs: {
      frequencyMHz: coverage.frequencyMHz,
      baseStationHeightM: coverage.baseStationHeightM,
      mobileHeightM: coverage.mobileHeightM,
      citySize: coverage.citySize,
      environment: coverage.environment,
      metropolitanCenter: coverage.metropolitanCenter,
    },
    solveDistanceKm: model.solveDistanceKm!,
    totalAreaKm2: scenario.totalAreaKm2,
  });

  const warnings: LocalizedMessage[] = [];
  if (!propagationModel.inRange && model.frequencyRangeMHz) {
    warnings.push({
      key: 'warnings.modelOutOfRange',
      params: {
        model: { key: `models.${model.id}.label` },
        frequency: coverage.frequencyMHz,
        min: model.frequencyRangeMHz[0],
        max: model.frequencyRangeMHz[1],
      },
    });
  }

  return {
    generation,
    totalAreaKm2: scenario.totalAreaKm2,
    totalTrafficErlangs,
    clusterSize: spectrum.clusterSize,
    frequencyPlan,
    propagationModel,
    dimensioning,
    cellsFinal: dimensioning.cellsFinal,
    bindingConstraint: dimensioning.bindingConstraint,
    warnings,
  };
}
