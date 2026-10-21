import type { Generation, Plan1g2gInputs, Plan3gUserInputs } from '../models/plan';

/**
 * Persistence of the guided plan, on the device only.
 *
 * What is saved are the INPUTS (the source of truth) plus the step the student
 * reached and a small snapshot of the result. Results are recomputed from the
 * inputs every time the plan is opened, so correcting a model later never
 * leaves stale numbers behind; the snapshot only lets the app say "this plan
 * now gives 7 cells (it gave 8 when you saved it)".
 *
 * The storage is injected (AsyncStorage satisfies KeyValueStorage), so this
 * module has no React Native import and runs under plain Node in the tests.
 * Anything unreadable -- corrupt JSON, another version, a half-written plan --
 * is dropped, never thrown: a broken save must not stop the app from starting.
 */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const PLAN_STORAGE_KEY = 'telecomm-propagation.plan';
export const PLAN_STORAGE_VERSION = 1;

export interface PlanSnapshot {
  /** Final cell count when the plan was saved (null: the 3G loop had not converged). */
  cellsFinal: number | null;
  computedAt: string;
}

export interface StoredPlanEntry<Inputs> {
  inputs: Inputs;
  /** Index of the wizard step the student was on, to resume there. */
  step: number;
  snapshot: PlanSnapshot | null;
}

export interface StoredPlans {
  version: typeof PLAN_STORAGE_VERSION;
  /** The generation last worked on. */
  active: Generation | null;
  plans: {
    '1g'?: StoredPlanEntry<Plan1g2gInputs>;
    '2g'?: StoredPlanEntry<Plan1g2gInputs>;
    '3g'?: StoredPlanEntry<Plan3gUserInputs>;
  };
}

export const emptyPlans = (): StoredPlans => ({ version: PLAN_STORAGE_VERSION, active: null, plans: {} });

// ---- validation: hand-written guards, no schema library for ~40 fields -------------------------------------

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isOptionalNumber = (value: unknown): boolean => value === undefined || isNumber(value);
const hasNumbers = (value: unknown, keys: readonly string[]): value is Json =>
  isObject(value) && keys.every((key) => isNumber(value[key]));

const CITY_SIZES = ['small-medium', 'large'];
const ENVIRONMENTS = ['urban', 'suburban', 'open-rural'];

const LINK_BUDGET_KEYS = [
  'transmitPowerDbm',
  'transmitAntennaGainDbi',
  'bodyLossDb',
  'receiveAntennaGainDbi',
  'feederLossDb',
  'receiverSensitivityDbm',
  'shadowFadingMarginDb',
  'interferenceMarginDb',
] as const;

function isPlan1g2gInputs(value: unknown, generation: '1g' | '2g'): value is Plan1g2gInputs {
  if (!isObject(value) || value.generation !== generation) return false;
  const { scenario, spectrum, coverage } = value;
  if (!hasNumbers(scenario, ['totalAreaKm2', 'users', 'erlangPerUser', 'targetGoS'])) return false;
  if (!hasNumbers(spectrum, ['bandwidthMHz', 'channelWidthKHz', 'clusterSize'])) return false;
  if (!isOptionalNumber(spectrum.tchPerCarrier) || !isOptionalNumber(spectrum.controlChannels)) return false;
  if (!hasNumbers(coverage, ['frequencyMHz', 'baseStationHeightM', 'mobileHeightM'])) return false;
  if (!CITY_SIZES.includes(coverage.citySize as string)) return false;
  if (!ENVIRONMENTS.includes(coverage.environment as string)) return false;
  if (typeof coverage.metropolitanCenter !== 'boolean') return false;
  return hasNumbers(coverage.linkBudget, LINK_BUDGET_KEYS);
}

const isPlan3gInputs = (value: unknown): value is Plan3gUserInputs =>
  hasNumbers(value, ['totalAreaKm2', 'users', 'erlangPerUser', 'frequencyMHz', 'targetUplinkLoad', 'interferenceFactor']);

function parseSnapshot(value: unknown): PlanSnapshot | null {
  if (!isObject(value) || typeof value.computedAt !== 'string') return null;
  if (value.cellsFinal !== null && !isNumber(value.cellsFinal)) return null;
  return { cellsFinal: value.cellsFinal as number | null, computedAt: value.computedAt };
}

function parseEntry<Inputs>(
  value: unknown,
  inputsGuard: (inputs: unknown) => inputs is Inputs,
  stepCount: number
): StoredPlanEntry<Inputs> | null {
  if (!isObject(value) || !inputsGuard(value.inputs)) return null;
  const step = isNumber(value.step) && Number.isInteger(value.step) ? value.step : 0;
  return {
    inputs: value.inputs,
    step: Math.min(Math.max(step, 0), stepCount - 1),
    snapshot: parseSnapshot(value.snapshot),
  };
}

/** Never throws: anything not understood yields an empty (or partial) set of plans. */
export function parseStoredPlans(raw: string | null): StoredPlans {
  if (raw === null) return emptyPlans();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return emptyPlans();
  }
  if (!isObject(data) || data.version !== PLAN_STORAGE_VERSION || !isObject(data.plans)) return emptyPlans();

  const plans: StoredPlans['plans'] = {};
  const one = parseEntry(data.plans['1g'], (v): v is Plan1g2gInputs => isPlan1g2gInputs(v, '1g'), 6);
  const two = parseEntry(data.plans['2g'], (v): v is Plan1g2gInputs => isPlan1g2gInputs(v, '2g'), 6);
  const three = parseEntry(data.plans['3g'], isPlan3gInputs, 3);
  if (one) plans['1g'] = one;
  if (two) plans['2g'] = two;
  if (three) plans['3g'] = three;

  const active = (['1g', '2g', '3g'] as const).find((g) => g === data.active && plans[g]) ?? null;
  return { version: PLAN_STORAGE_VERSION, active, plans };
}

export const serializePlans = (plans: StoredPlans): string => JSON.stringify(plans);

// ---- storage access -----------------------------------------------------------------------------------------

export async function loadPlans(storage: KeyValueStorage): Promise<StoredPlans> {
  try {
    return parseStoredPlans(await storage.getItem(PLAN_STORAGE_KEY));
  } catch {
    return emptyPlans();
  }
}

/** Resolves to false (instead of throwing) when the device refuses the write, e.g. storage full or blocked. */
export async function savePlans(storage: KeyValueStorage, plans: StoredPlans): Promise<boolean> {
  try {
    await storage.setItem(PLAN_STORAGE_KEY, serializePlans(plans));
    return true;
  } catch {
    return false;
  }
}

export async function clearPlans(storage: KeyValueStorage): Promise<void> {
  try {
    await storage.removeItem(PLAN_STORAGE_KEY);
  } catch {
    // nothing to clear, or storage unavailable: the in-memory state is what matters
  }
}
