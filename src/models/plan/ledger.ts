import type { Plan1g2gResult } from './plan1g2g';
import type { Plan3gResult } from './plan3g';

/**
 * "Tu plan hasta ahora": the results of the steps already done, in order, as
 * language-neutral rows -- the UI looks the label up under `plan.ledger.<id>`
 * and formats the value. Pure, so the ordering rules are testable.
 */
export type LedgerItemId =
  | 'totalArea'
  | 'totalTraffic'
  | 'clusterSize'
  | 'totalChannels'
  | 'channelsPerCell'
  | 'carriers'
  | 'transceiversPerCell'
  | 'trafficPerCell'
  | 'cellsByCapacity'
  | 'propagationModel'
  | 'mapl'
  | 'cellRadius'
  | 'cellArea'
  | 'cellsByCoverage'
  | 'cellsFinal'
  | 'bindingConstraint'
  | 'maxUsersPerCell'
  | 'convergedRadius'
  | 'convergedLoad'
  | 'nodeBsByCoverage'
  | 'nodeBsByCapacity';

export interface LedgerItem {
  id: LedgerItemId;
  /** A number, or `{ key }` for a value that is itself a translation (a model name, "capacity"/"coverage"). */
  value: number | { key: string };
  /** Decimals to show for a number (default 0). */
  decimals?: number;
  unit?: string;
}

const model = (id: string) => ({ key: `models.${id}.shortLabel` });
const constraint = (value: 'capacity' | 'coverage') => ({ key: `plan.constraint.${value}` });

/**
 * Results of the first `completedSteps` steps of the 1G/2G wizard:
 * 1 scenario, 2 spectrum, 3 capacity, 4 coverage, 5 result.
 */
export function ledger1g2g(plan: Plan1g2gResult, completedSteps: number): LedgerItem[] {
  const items: LedgerItem[] = [];
  if (completedSteps >= 1) {
    items.push({ id: 'totalArea', value: plan.totalAreaKm2, decimals: 0, unit: 'km²' });
    items.push({ id: 'totalTraffic', value: plan.totalTrafficErlangs, decimals: 1, unit: 'Erlang' });
  }
  if (completedSteps >= 2) {
    items.push({ id: 'clusterSize', value: plan.clusterSize });
    if (plan.frequencyPlan.carriers !== undefined) {
      items.push({ id: 'carriers', value: plan.frequencyPlan.carriers });
      items.push({ id: 'transceiversPerCell', value: plan.frequencyPlan.transceiversPerCell as number });
    } else {
      items.push({ id: 'totalChannels', value: plan.frequencyPlan.totalChannels });
    }
    items.push({ id: 'channelsPerCell', value: plan.frequencyPlan.channelsPerCell });
  }
  if (completedSteps >= 3) {
    items.push({ id: 'trafficPerCell', value: plan.dimensioning.trafficPerCellErlangs, decimals: 2, unit: 'Erlang' });
    items.push({ id: 'cellsByCapacity', value: plan.dimensioning.cellsByCapacity });
  }
  if (completedSteps >= 4) {
    items.push({ id: 'propagationModel', value: model(plan.propagationModel.modelId) });
    items.push({ id: 'mapl', value: plan.dimensioning.maplDb, decimals: 1, unit: 'dB' });
    items.push({ id: 'cellRadius', value: plan.dimensioning.cellRadiusKm, decimals: 2, unit: 'km' });
    items.push({ id: 'cellArea', value: plan.dimensioning.cellAreaKm2, decimals: 2, unit: 'km²' });
    items.push({ id: 'cellsByCoverage', value: plan.dimensioning.cellsByCoverage });
  }
  if (completedSteps >= 5) {
    items.push({ id: 'cellsFinal', value: plan.cellsFinal });
    items.push({ id: 'bindingConstraint', value: constraint(plan.bindingConstraint) });
  }
  return items;
}

/** 3G: step 1 is the scenario, step 2 the (automatic) result. */
export function ledger3g(plan: Plan3gResult, users: number, erlangPerUser: number, completedSteps: number): LedgerItem[] {
  const items: LedgerItem[] = [];
  if (completedSteps >= 1) {
    items.push({ id: 'totalArea', value: plan.totalAreaKm2, decimals: 0, unit: 'km²' });
    items.push({ id: 'totalTraffic', value: users * erlangPerUser, decimals: 1, unit: 'Erlang' });
  }
  if (completedSteps >= 2) {
    items.push({ id: 'propagationModel', value: model(plan.propagationModel.modelId) });
    items.push({ id: 'maxUsersPerCell', value: plan.wcdma.maxSimultaneousUsersPerCell, decimals: 1 });
    if (plan.converged) {
      items.push({ id: 'convergedRadius', value: plan.wcdma.finalRadiusKm as number, decimals: 2, unit: 'km' });
      items.push({ id: 'convergedLoad', value: (plan.wcdma.finalLoad as number) * 100, decimals: 0, unit: '%' });
      items.push({ id: 'nodeBsByCoverage', value: plan.wcdma.nodeBsByCoverage as number });
    }
    items.push({ id: 'nodeBsByCapacity', value: plan.wcdma.nodeBsByCapacity });
    if (plan.cellsFinal !== null && plan.bindingConstraint !== null) {
      items.push({ id: 'cellsFinal', value: plan.cellsFinal });
      items.push({ id: 'bindingConstraint', value: constraint(plan.bindingConstraint) });
    }
  }
  return items;
}
