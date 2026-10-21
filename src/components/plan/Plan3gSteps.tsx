import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ledger3g } from '../../models/plan';
import type { Plan3gUserInputs } from '../../models/plan';
import type { Plan3gHandle } from '../../plan/PlanContext';
import { useTheme } from '../../theme';
import { PlanNumberField } from './PlanNumberField';
import { ResultRows, useLedgerRows } from './ResultRows';
import { AdvancedSection, ErrorBox, Intro, Panel, WarningList } from './parts';

const patch = (change: Partial<Plan3gUserInputs>) => (previous: Plan3gUserInputs): Plan3gUserInputs => ({ ...previous, ...change });

/** 3G step 1: three numbers. The rest is the course example, folded under "Advanced". */
export function Scenario3gStep({ plan }: { plan: Plan3gHandle }) {
  const { t } = useTranslation();
  const { inputs, computed, setInputs } = plan;
  return (
    <View>
      <Intro>{t('plan.steps.scenario3g.intro')}</Intro>
      <PlanNumberField
        label={t('fields.totalCoverageArea')}
        unit="km²"
        value={inputs.totalAreaKm2}
        onChange={(totalAreaKm2) => setInputs(patch({ totalAreaKm2 }))}
      />
      <PlanNumberField
        label={t('plan.steps.scenario.users')}
        value={inputs.users}
        onChange={(users) => setInputs(patch({ users }))}
      />
      <PlanNumberField
        label={t('plan.steps.scenario.erlangPerUser')}
        unit="Erlang"
        value={inputs.erlangPerUser}
        onChange={(erlangPerUser) => setInputs(patch({ erlangPerUser }))}
      />

      <AdvancedSection intro={t('plan.steps.scenario3g.advancedIntro')}>
        <PlanNumberField
          label={t('fields.frequency')}
          unit="MHz"
          value={inputs.frequencyMHz}
          onChange={(frequencyMHz) => setInputs(patch({ frequencyMHz }))}
        />
        <PlanNumberField
          label={t('fields.targetLoad')}
          value={inputs.targetUplinkLoad}
          helperText={t('plan.steps.scenario3g.targetLoadHelper')}
          onChange={(targetUplinkLoad) => setInputs(patch({ targetUplinkLoad }))}
        />
        <PlanNumberField
          label={t('fields.interferenceFactor')}
          value={inputs.interferenceFactor}
          onChange={(interferenceFactor) => setInputs(patch({ interferenceFactor }))}
        />
      </AdvancedSection>

      {computed.error ? (
        <ErrorBox error={computed.error} />
      ) : (
        <Panel>
          <Text>{t('plan.steps.scenario.result', { value: (inputs.users * inputs.erlangPerUser).toFixed(1) })}</Text>
        </Panel>
      )}
    </View>
  );
}

/** 3G step 2: everything computed for the student. */
export function Result3gStep({ plan }: { plan: Plan3gHandle }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { inputs, computed } = plan;
  const result = computed.result;
  const rows = useLedgerRows(result ? ledger3g(result, inputs.users, inputs.erlangPerUser, 2).slice(2) : []);

  if (computed.error) return <ErrorBox error={computed.error} />;
  if (!result) return null;

  return (
    <View>
      <Intro>{t('plan.steps.result3g.intro')}</Intro>

      <Text style={[styles.status, { color: result.converged ? colors.textPrimary : colors.warning }]}>
        {result.converged
          ? t('wcdma.result.converged', { count: result.wcdma.iterations.length - 1 })
          : t('wcdma.result.notConverged', { count: result.wcdma.iterations.length })}
      </Text>
      {result.converged && result.dampingFactorUsed !== 0.3 ? (
        <Text style={[styles.note, { color: colors.textMuted }]}>
          {t('plan.steps.result3g.smallerStep', { step: result.dampingFactorUsed })}
        </Text>
      ) : null}

      <Panel>
        <ResultRows rows={rows} />
      </Panel>

      {result.cellsFinal !== null ? (
        <Text style={[styles.note, { color: colors.textPrimary }]}>
          {result.bindingConstraint === 'capacity' ? t('plan.steps.result3g.bindingCapacity') : t('plan.steps.result3g.bindingCoverage')}
        </Text>
      ) : (
        <Text style={[styles.note, { color: colors.warning }]}>
          {t('plan.steps.result3g.minByCapacity', { count: result.minCellsByCapacity })}
        </Text>
      )}
      <WarningList warnings={result.warnings} />
    </View>
  );
}

const styles = StyleSheet.create({
  status: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  note: { fontSize: 12, lineHeight: 17, marginTop: 8 },
});
