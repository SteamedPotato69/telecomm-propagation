import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  COURSE_1G,
  COURSE_2G,
  COURSE_3G,
  computePlan1g2g,
  computePlan3g,
  stepsFor,
} from '../models/plan';
import type { Computed, Generation, Plan1g2gInputs, Plan1g2gResult, Plan3gResult, Plan3gUserInputs } from '../models/plan';
import { emptyPlans, loadPlans, savePlans } from '../storage/planStore';
import type { StoredPlanEntry, StoredPlans } from '../storage/planStore';

/** Wait this long after the last edit before writing: typing a number must not hit storage per keystroke. */
const SAVE_DELAY_MS = 400;

/** The presets are shared module constants: always hand out copies, never the object itself. */
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const course1g2g = (generation: '1g' | '2g'): Plan1g2gInputs => clone(generation === '1g' ? COURSE_1G : COURSE_2G);

interface PlanContextValue {
  /** false until the saved plans have been read: nothing may be written before that, or it would overwrite them. */
  ready: boolean;
  /** true when the device refused the last write; the plan then only lives in memory. */
  saveFailed: boolean;
  stored: StoredPlans;
  /** Start (or restart) a generation with the course's example. */
  begin: (generation: Generation) => void;
  /** Make a generation the active one (resume it). */
  resume: (generation: Generation) => void;
  update1g2g: (generation: '1g' | '2g', updater: (previous: Plan1g2gInputs) => Plan1g2gInputs) => void;
  update3g: (updater: (previous: Plan3gUserInputs) => Plan3gUserInputs) => void;
  setStep: (generation: Generation, step: number) => void;
  recordSnapshot: (generation: Generation, cellsFinal: number | null) => void;
}

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredPlans>(emptyPlans);
  const [ready, setReady] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPlans(AsyncStorage).then((loaded) => {
      if (cancelled) return;
      setStored(loaded);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced save, only once the saved plans have been read.
  const firstRun = useRef(true);
  useEffect(() => {
    if (!ready) return;
    if (firstRun.current) {
      // the state just loaded from storage: writing it straight back is pointless
      firstRun.current = false;
      return;
    }
    const timer = setTimeout(() => {
      savePlans(AsyncStorage, stored).then((ok) => setSaveFailed(!ok));
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [stored, ready]);

  const begin = useCallback((generation: Generation) => {
    setStored((previous) => {
      const entry =
        generation === '3g'
          ? ({ inputs: clone(COURSE_3G), step: 0, snapshot: null } as StoredPlanEntry<Plan3gUserInputs>)
          : ({ inputs: course1g2g(generation), step: 0, snapshot: null } as StoredPlanEntry<Plan1g2gInputs>);
      return { ...previous, active: generation, plans: { ...previous.plans, [generation]: entry } };
    });
  }, []);

  const resume = useCallback((generation: Generation) => {
    setStored((previous) => (previous.plans[generation] ? { ...previous, active: generation } : previous));
  }, []);

  const update1g2g = useCallback<PlanContextValue['update1g2g']>((generation, updater) => {
    setStored((previous) => {
      const current = previous.plans[generation];
      const inputs = updater(current ? current.inputs : course1g2g(generation));
      return {
        ...previous,
        active: generation,
        plans: { ...previous.plans, [generation]: { inputs, step: current?.step ?? 0, snapshot: current?.snapshot ?? null } },
      };
    });
  }, []);

  const update3g = useCallback<PlanContextValue['update3g']>((updater) => {
    setStored((previous) => {
      const current = previous.plans['3g'];
      const inputs = updater(current ? current.inputs : clone(COURSE_3G));
      return {
        ...previous,
        active: '3g',
        plans: { ...previous.plans, '3g': { inputs, step: current?.step ?? 0, snapshot: current?.snapshot ?? null } },
      };
    });
  }, []);

  const setStep = useCallback((generation: Generation, step: number) => {
    setStored((previous) => {
      const current = previous.plans[generation];
      if (!current || current.step === step) return previous;
      return { ...previous, plans: { ...previous.plans, [generation]: { ...current, step } } };
    });
  }, []);

  const recordSnapshot = useCallback((generation: Generation, cellsFinal: number | null) => {
    setStored((previous) => {
      const current = previous.plans[generation];
      // Only when the number actually changed, or there is none yet: otherwise this would loop with the save effect.
      if (!current || (current.snapshot !== null && current.snapshot.cellsFinal === cellsFinal)) return previous;
      return {
        ...previous,
        plans: { ...previous.plans, [generation]: { ...current, snapshot: { cellsFinal, computedAt: new Date().toISOString() } } },
      };
    });
  }, []);

  const value = useMemo<PlanContextValue>(
    () => ({ ready, saveFailed, stored, begin, resume, update1g2g, update3g, setStep, recordSnapshot }),
    [ready, saveFailed, stored, begin, resume, update1g2g, update3g, setStep, recordSnapshot]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlanStore(): PlanContextValue {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlanStore must be used inside a PlanProvider.');
  }
  return context;
}

export interface Plan1g2gHandle {
  inputs: Plan1g2gInputs;
  computed: Computed<Plan1g2gResult>;
  setInputs: (updater: (previous: Plan1g2gInputs) => Plan1g2gInputs) => void;
}

/** The saved 1G/2G inputs (the course example if nothing is saved yet) and their result, recomputed on every change. */
export function usePlan1g2g(generation: '1g' | '2g'): Plan1g2gHandle {
  const { stored, update1g2g, recordSnapshot } = usePlanStore();
  const entry = stored.plans[generation];
  const fallback = useMemo(() => course1g2g(generation), [generation]);
  const inputs = entry ? entry.inputs : fallback;
  const computed = useMemo(() => computePlan1g2g(inputs), [inputs]);

  const cellsFinal = computed.result?.cellsFinal ?? null;
  useEffect(() => {
    recordSnapshot(generation, cellsFinal);
  }, [generation, cellsFinal, recordSnapshot]);

  const setInputs = useCallback<Plan1g2gHandle['setInputs']>((updater) => update1g2g(generation, updater), [generation, update1g2g]);
  return { inputs, computed, setInputs };
}

export interface Plan3gHandle {
  inputs: Plan3gUserInputs;
  computed: Computed<Plan3gResult>;
  setInputs: (updater: (previous: Plan3gUserInputs) => Plan3gUserInputs) => void;
}

export function usePlan3g(): Plan3gHandle {
  const { stored, update3g, recordSnapshot } = usePlanStore();
  const entry = stored.plans['3g'];
  const fallback = useMemo(() => clone(COURSE_3G), []);
  const inputs = entry ? entry.inputs : fallback;
  const computed = useMemo(() => computePlan3g(inputs), [inputs]);

  const cellsFinal = computed.result?.cellsFinal ?? null;
  useEffect(() => {
    recordSnapshot('3g', cellsFinal);
  }, [cellsFinal, recordSnapshot]);

  return { inputs, computed, setInputs: update3g };
}

/** How many wizard steps a generation has (for "step 3 of 6"). */
export const stepCount = (generation: Generation): number => stepsFor(generation).length;
