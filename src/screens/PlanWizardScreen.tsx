import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CapacityStep, CoverageStep, ResultStep, ScenarioStep, SpectrumStep } from '../components/plan/Plan1g2gSteps';
import { Result3gStep, Scenario3gStep } from '../components/plan/Plan3gSteps';
import { PlanLedger } from '../components/plan/PlanLedger';
import { PlanShell } from '../components/plan/PlanShell';
import { SummaryStep } from '../components/plan/SummaryStep';
import {
  STEPS_1G2G,
  STEPS_3G,
  ledger1g2g,
  ledger3g,
  missionFromPlan1g2g,
  missionFromPlan3g,
} from '../models/plan';
import { usePlan1g2g, usePlan3g, usePlanStore } from '../plan/PlanContext';

interface WizardProps {
  step: number;
  onStep: (step: number) => void;
  /** Back to the "choose a generation" screen. */
  onLeave: () => void;
}

/** 1G and 2G: the course's pencil-and-paper order, one screen per step. */
export function Plan1g2gWizard({ generation, step, onStep, onLeave }: WizardProps & { generation: '1g' | '2g' }) {
  const { t } = useTranslation();
  const { setStep } = usePlanStore();
  const plan = usePlan1g2g(generation);
  const total = STEPS_1G2G.length;
  const name = STEPS_1G2G[Math.min(Math.max(step, 0), total - 1)];
  const index = STEPS_1G2G.indexOf(name);

  useEffect(() => {
    setStep(generation, index);
  }, [generation, index, setStep]);

  const result = plan.computed.result;
  const showLedger = index >= 1 && index <= 4 && result !== null;

  return (
    <PlanShell
      title={t(`plan.steps.${name}.title`)}
      stepIndex={index}
      totalSteps={total}
      onLeave={onLeave}
      onPrevious={() => (index > 0 ? onStep(index - 1) : onLeave())}
      onNext={index < total - 1 ? () => onStep(index + 1) : undefined}
      nextDisabled={result === null}
      ledger={showLedger ? <PlanLedger items={ledger1g2g(result, index)} /> : undefined}
    >
      {name === 'scenario' ? <ScenarioStep plan={plan} generation={generation} /> : null}
      {name === 'spectrum' ? <SpectrumStep plan={plan} generation={generation} /> : null}
      {name === 'capacity' ? <CapacityStep plan={plan} generation={generation} /> : null}
      {name === 'coverage' ? <CoverageStep plan={plan} generation={generation} /> : null}
      {name === 'result' ? <ResultStep plan={plan} generation={generation} /> : null}
      {name === 'summary' ? <SummaryStep mission={result ? missionFromPlan1g2g(result) : null} /> : null}
    </PlanShell>
  );
}

const TITLE_3G = { scenario: 'scenario3g', result: 'result3g', summary: 'summary' } as const;

/** 3G: three inputs, then everything computed for the student. */
export function Plan3gWizard({ step, onStep, onLeave }: WizardProps) {
  const { t } = useTranslation();
  const { setStep } = usePlanStore();
  const plan = usePlan3g();
  const total = STEPS_3G.length;
  const name = STEPS_3G[Math.min(Math.max(step, 0), total - 1)];
  const index = STEPS_3G.indexOf(name);

  useEffect(() => {
    setStep('3g', index);
  }, [index, setStep]);

  const result = plan.computed.result;

  return (
    <PlanShell
      title={t(`plan.steps.${TITLE_3G[name]}.title`)}
      stepIndex={index}
      totalSteps={total}
      onLeave={onLeave}
      onPrevious={() => (index > 0 ? onStep(index - 1) : onLeave())}
      onNext={index < total - 1 ? () => onStep(index + 1) : undefined}
      nextDisabled={result === null}
      ledger={
        index === 1 && result ? (
          <PlanLedger items={ledger3g(result, plan.inputs.users, plan.inputs.erlangPerUser, 1)} />
        ) : undefined
      }
    >
      {name === 'scenario' ? <Scenario3gStep plan={plan} /> : null}
      {name === 'result' ? <Result3gStep plan={plan} /> : null}
      {name === 'summary' ? <SummaryStep mission={result ? missionFromPlan3g(result) : null} /> : null}
    </PlanShell>
  );
}
