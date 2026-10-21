import { LocalizedError } from '../../utils/localizedMessage';
import type { LocalizedMessage } from '../../utils/localizedMessage';
import { calculatePlan1g2g } from './plan1g2g';
import type { Plan1g2gInputs, Plan1g2gResult } from './plan1g2g';
import { calculatePlan3g } from './plan3g';
import type { Plan3gResult } from './plan3g';

/** The three generations the guided plan covers. */
export type Generation = '1g' | '2g' | '3g';

/** Steps of the wizard, in the order of the course's pencil-and-paper solution (diap. 44-46). */
export const STEPS_1G2G = ['scenario', 'spectrum', 'capacity', 'coverage', 'result', 'summary'] as const;
/** 3G is automated: three inputs, one result, one summary. */
export const STEPS_3G = ['scenario', 'result', 'summary'] as const;

export type Step1g2g = (typeof STEPS_1G2G)[number];
export type Step3g = (typeof STEPS_3G)[number];

export const stepsFor = (generation: Generation): readonly string[] => (generation === '3g' ? STEPS_3G : STEPS_1G2G);

/**
 * What the student types for 3G: three numbers plus the few knobs worth
 * exposing. Everything else comes from PLAN_3G_DEFAULTS (the course's UMTS
 * example) inside calculatePlan3g, and is computed under the hood.
 */
export interface Plan3gUserInputs {
  totalAreaKm2: number;
  users: number;
  erlangPerUser: number;
  /** Advanced: band, MHz (default 2100, diap. 72). */
  frequencyMHz: number;
  /** Advanced: eta_UL,max (default 0.5). */
  targetUplinkLoad: number;
  /** Advanced: i_oc (default 0.55). */
  interferenceFactor: number;
}

/** Diap. 71-72: 10 000 users over 50 km^2 at 0.025 Erlang, 2100 MHz, eta 50 %, i_oc 0.55. */
export const COURSE_3G: Plan3gUserInputs = {
  totalAreaKm2: 50,
  users: 10000,
  erlangPerUser: 0.025,
  frequencyMHz: 2100,
  targetUplinkLoad: 0.5,
  interferenceFactor: 0.55,
};

/** A calculation that never throws: exactly one of `result` / `error` is set. */
export interface Computed<T> {
  result: T | null;
  /** Language-neutral; the UI translates it with translateMessage. */
  error: LocalizedMessage | null;
}

function safely<T>(compute: () => T): Computed<T> {
  try {
    return { result: compute(), error: null };
  } catch (error) {
    if (error instanceof LocalizedError) {
      return { result: null, error: { key: error.key, params: error.params } };
    }
    return { result: null, error: { key: 'errors.unknown', params: {} } };
  }
}

/** A wizard step shows its own message instead of crashing when the typed values are impossible. */
export const computePlan1g2g = (inputs: Plan1g2gInputs): Computed<Plan1g2gResult> => safely(() => calculatePlan1g2g(inputs));

export const computePlan3g = (inputs: Plan3gUserInputs): Computed<Plan3gResult> =>
  safely(() =>
    calculatePlan3g({
      totalAreaKm2: inputs.totalAreaKm2,
      users: inputs.users,
      erlangPerUser: inputs.erlangPerUser,
      advanced: {
        frequencyMHz: inputs.frequencyMHz,
        targetUplinkLoad: inputs.targetUplinkLoad,
        interferenceFactor: inputs.interferenceFactor,
      },
    })
  );
