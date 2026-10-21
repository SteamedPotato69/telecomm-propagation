import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ledger1g2g } from '../../models/plan';
import type { Plan1g2gInputs } from '../../models/plan';
import type { Environment } from '../../models/propagation';
import type { Plan1g2gHandle } from '../../plan/PlanContext';
import { useTheme } from '../../theme';
import { ChoiceChips } from './ChoiceChips';
import { PlanNumberField } from './PlanNumberField';
import { ResultRows, useLedgerRows } from './ResultRows';
import { AdvancedSection, ErrorBox, Intro, Panel, WarningList } from './parts';

interface StepProps {
  plan: Plan1g2gHandle;
  generation: '1g' | '2g';
}

const CLUSTER_CHIPS = [3, 4, 7, 9, 12, 13];
const ENVIRONMENTS: Environment[] = ['urban', 'suburban', 'open-rural'];

type Scenario = Plan1g2gInputs['scenario'];
type Spectrum = Plan1g2gInputs['spectrum'];
type Coverage = Plan1g2gInputs['coverage'];
type LinkBudget = Coverage['linkBudget'];

/** Immutable partial updates of the nested inputs. */
const patchScenario = (patch: Partial<Scenario>) => (previous: Plan1g2gInputs): Plan1g2gInputs => ({
  ...previous,
  scenario: { ...previous.scenario, ...patch },
});
const patchSpectrum = (patch: Partial<Spectrum>) => (previous: Plan1g2gInputs): Plan1g2gInputs => ({
  ...previous,
  spectrum: { ...previous.spectrum, ...patch },
});
const patchCoverage = (patch: Partial<Coverage>) => (previous: Plan1g2gInputs): Plan1g2gInputs => ({
  ...previous,
  coverage: { ...previous.coverage, ...patch },
});
const patchLinkBudget = (patch: Partial<LinkBudget>) => (previous: Plan1g2gInputs): Plan1g2gInputs => ({
  ...previous,
  coverage: { ...previous.coverage, linkBudget: { ...previous.coverage.linkBudget, ...patch } },
});

// ---- 1. Scenario -----------------------------------------------------------------------------------------

export function ScenarioStep({ plan }: StepProps) {
  const { t } = useTranslation();
  const { inputs, computed, setInputs } = plan;
  return (
    <View>
      <Intro>{t('plan.steps.scenario.intro')}</Intro>
      <PlanNumberField
        label={t('fields.totalCoverageArea')}
        unit="km²"
        value={inputs.scenario.totalAreaKm2}
        onChange={(totalAreaKm2) => setInputs(patchScenario({ totalAreaKm2 }))}
      />
      <PlanNumberField
        label={t('plan.steps.scenario.users')}
        value={inputs.scenario.users}
        onChange={(users) => setInputs(patchScenario({ users }))}
      />
      <PlanNumberField
        label={t('plan.steps.scenario.erlangPerUser')}
        unit="Erlang"
        value={inputs.scenario.erlangPerUser}
        onChange={(erlangPerUser) => setInputs(patchScenario({ erlangPerUser }))}
      />
      <PlanNumberField
        label={t('fields.targetGos')}
        value={inputs.scenario.targetGoS}
        helperText={t('plan.steps.scenario.gosHelper')}
        onChange={(targetGoS) => setInputs(patchScenario({ targetGoS }))}
      />
      {computed.error ? (
        <ErrorBox error={computed.error} />
      ) : (
        <Panel>
          <Text>{t('plan.steps.scenario.result', { value: (computed.result?.totalTrafficErlangs ?? 0).toFixed(1) })}</Text>
        </Panel>
      )}
    </View>
  );
}

// ---- 2. Spectrum and cluster -----------------------------------------------------------------------------

export function SpectrumStep({ plan, generation }: StepProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { inputs, computed, setInputs } = plan;
  const result = computed.result;

  return (
    <View>
      <Intro>{generation === '1g' ? t('plan.steps.spectrum.intro1g') : t('plan.steps.spectrum.intro2g')}</Intro>

      <ChoiceChips
        accessibilityLabel={t('fields.clusterSize')}
        options={CLUSTER_CHIPS.map((n) => ({ value: n, label: `N=${n}` }))}
        selected={inputs.spectrum.clusterSize}
        onSelect={(clusterSize) => setInputs(patchSpectrum({ clusterSize }))}
      />
      <PlanNumberField
        label={t('fields.clusterSize')}
        value={inputs.spectrum.clusterSize}
        helperText={t('plan.steps.spectrum.clusterHelper')}
        onChange={(clusterSize) => setInputs(patchSpectrum({ clusterSize }))}
      />
      <PlanNumberField
        label={t('fields.bandwidth')}
        unit="MHz"
        value={inputs.spectrum.bandwidthMHz}
        onChange={(bandwidthMHz) => setInputs(patchSpectrum({ bandwidthMHz }))}
      />
      <PlanNumberField
        label={generation === '1g' ? t('fields.channelWidth') : t('plan.steps.spectrum.carrierWidth')}
        unit="kHz"
        value={inputs.spectrum.channelWidthKHz}
        onChange={(channelWidthKHz) => setInputs(patchSpectrum({ channelWidthKHz }))}
      />
      {generation === '2g' ? (
        <PlanNumberField
          label={t('fields.tchPerCarrier')}
          value={inputs.spectrum.tchPerCarrier ?? 7}
          helperText={t('plan.steps.spectrum.tchHelper')}
          onChange={(tchPerCarrier) => setInputs(patchSpectrum({ tchPerCarrier }))}
        />
      ) : (
        <AdvancedSection intro={t('plan.steps.spectrum.controlHelper')}>
          <PlanNumberField
            label={t('fields.controlChannels')}
            value={inputs.spectrum.controlChannels ?? 0}
            onChange={(controlChannels) => setInputs(patchSpectrum({ controlChannels }))}
          />
        </AdvancedSection>
      )}

      {computed.error ? (
        <ErrorBox error={computed.error} />
      ) : result ? (
        <Panel>
          <Text style={{ color: colors.textPrimary }}>
            {result.frequencyPlan.carriers === undefined
              ? t('plan.steps.spectrum.result1g', {
                  total: result.frequencyPlan.totalChannels,
                  n: result.clusterSize,
                  perCell: result.frequencyPlan.channelsPerCell,
                })
              : t('plan.steps.spectrum.result2g', {
                  carriers: result.frequencyPlan.carriers,
                  trx: result.frequencyPlan.transceiversPerCell as number,
                  tch: inputs.spectrum.tchPerCarrier ?? 7,
                  perCell: result.frequencyPlan.channelsPerCell,
                })}
          </Text>
        </Panel>
      ) : null}
    </View>
  );
}

// ---- 3. Capacity -----------------------------------------------------------------------------------------

export function CapacityStep({ plan }: StepProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const result = plan.computed.result;
  const rows = useLedgerRows(result ? ledger1g2g(result, 3).slice(-2) : []);
  return (
    <View>
      <Intro>{t('plan.steps.capacity.intro')}</Intro>
      <Text style={[styles.formula, { color: colors.accentText }]}>{t('plan.steps.capacity.formula')}</Text>
      {plan.computed.error ? (
        <ErrorBox error={plan.computed.error} />
      ) : (
        <Panel>
          <ResultRows rows={rows} />
        </Panel>
      )}
      <Text style={[styles.note, { color: colors.textMuted }]}>{t('plan.steps.capacity.note')}</Text>
    </View>
  );
}

// ---- 4. Coverage -----------------------------------------------------------------------------------------

export function CoverageStep({ plan }: StepProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { inputs, computed, setInputs } = plan;
  const result = computed.result;
  // Model name is shown on its own line below; the remaining four rows are the outcome of the step.
  const rows = useLedgerRows(result ? ledger1g2g(result, 4).slice(-4) : []);
  const { coverage } = inputs;

  return (
    <View>
      <Intro>{t('plan.steps.coverage.intro')}</Intro>
      <PlanNumberField
        label={t('fields.frequency')}
        unit="MHz"
        value={coverage.frequencyMHz}
        onChange={(frequencyMHz) => setInputs(patchCoverage({ frequencyMHz }))}
      />
      <PlanNumberField
        label={t('fields.baseStationHeight')}
        unit="m"
        value={coverage.baseStationHeightM}
        onChange={(baseStationHeightM) => setInputs(patchCoverage({ baseStationHeightM }))}
      />
      <PlanNumberField
        label={t('fields.mobileHeight')}
        unit="m"
        value={coverage.mobileHeightM}
        onChange={(mobileHeightM) => setInputs(patchCoverage({ mobileHeightM }))}
      />

      <AdvancedSection intro={t('plan.steps.coverage.advancedIntro')}>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>{t('propagationOptions.largeCityHataOnly')}</Text>
          <Switch
            value={coverage.citySize === 'large'}
            onValueChange={(on) => setInputs(patchCoverage({ citySize: on ? 'large' : 'small-medium' }))}
            trackColor={{ true: colors.accentSolid }}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>{t('propagationOptions.metropolitanCostOnly')}</Text>
          <Switch
            value={coverage.metropolitanCenter}
            onValueChange={(metropolitanCenter) => setInputs(patchCoverage({ metropolitanCenter }))}
            trackColor={{ true: colors.accentSolid }}
          />
        </View>
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('propagationOptions.environmentHataOnly')}</Text>
        <ChoiceChips
          accessibilityLabel={t('propagationOptions.environmentHataOnly')}
          options={ENVIRONMENTS.map((value) => ({ value, label: t(`envOptions.${value}`) }))}
          selected={coverage.environment}
          onSelect={(environment) => setInputs(patchCoverage({ environment }))}
        />
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('propagationOptions.budgetHeading')}</Text>
        <PlanNumberField
          label={t('linkBudgetForm.transmitPower')}
          unit="dBm"
          value={coverage.linkBudget.transmitPowerDbm}
          onChange={(transmitPowerDbm) => setInputs(patchLinkBudget({ transmitPowerDbm }))}
        />
        <PlanNumberField
          label={t('linkBudgetForm.msAntennaGain')}
          unit="dBi"
          value={coverage.linkBudget.transmitAntennaGainDbi}
          onChange={(transmitAntennaGainDbi) => setInputs(patchLinkBudget({ transmitAntennaGainDbi }))}
        />
        <PlanNumberField
          label={t('fields.bodyLoss')}
          unit="dB"
          value={coverage.linkBudget.bodyLossDb}
          onChange={(bodyLossDb) => setInputs(patchLinkBudget({ bodyLossDb }))}
        />
        <PlanNumberField
          label={t('linkBudgetForm.btsAntennaGain')}
          unit="dBi"
          value={coverage.linkBudget.receiveAntennaGainDbi}
          onChange={(receiveAntennaGainDbi) => setInputs(patchLinkBudget({ receiveAntennaGainDbi }))}
        />
        <PlanNumberField
          label={t('linkBudgetForm.btsFeederLoss')}
          unit="dB"
          value={coverage.linkBudget.feederLossDb}
          onChange={(feederLossDb) => setInputs(patchLinkBudget({ feederLossDb }))}
        />
        <PlanNumberField
          label={t('linkBudgetForm.btsSensitivity')}
          unit="dBm"
          value={coverage.linkBudget.receiverSensitivityDbm}
          helperText={t('linkBudgetForm.sensitivityHelper')}
          onChange={(receiverSensitivityDbm) => setInputs(patchLinkBudget({ receiverSensitivityDbm }))}
        />
        <PlanNumberField
          label={t('fields.shadowFadingMargin')}
          unit="dB"
          value={coverage.linkBudget.shadowFadingMarginDb}
          onChange={(shadowFadingMarginDb) => setInputs(patchLinkBudget({ shadowFadingMarginDb }))}
        />
        <PlanNumberField
          label={t('fields.interferenceMargin')}
          unit="dB"
          value={coverage.linkBudget.interferenceMarginDb}
          onChange={(interferenceMarginDb) => setInputs(patchLinkBudget({ interferenceMarginDb }))}
        />
      </AdvancedSection>

      {computed.error ? (
        <ErrorBox error={computed.error} />
      ) : result ? (
        <View>
          <Text style={[styles.note, { color: colors.textSecondary }]}>
            {t('plan.steps.coverage.modelAuto', { model: t(`models.${result.propagationModel.modelId}.label`) })}
          </Text>
          <Panel>
            <ResultRows rows={rows} />
          </Panel>
          <WarningList warnings={result.warnings} />
        </View>
      ) : null}
    </View>
  );
}

// ---- 5. Result -------------------------------------------------------------------------------------------

export function ResultStep({ plan }: StepProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const result = plan.computed.result;
  if (plan.computed.error) return <ErrorBox error={plan.computed.error} />;
  if (!result) return null;
  return (
    <View>
      <Intro>{t('plan.steps.result.intro')}</Intro>
      <Panel>
        <ResultRows rows={[{ label: t('plan.steps.result.cellsTitle'), value: String(result.cellsFinal), emphasis: true }]} />
      </Panel>
      <Text style={[styles.note, { color: colors.textPrimary }]}>
        {result.bindingConstraint === 'capacity' ? t('plan.steps.result.bindingCapacity') : t('plan.steps.result.bindingCoverage')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  formula: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  note: { fontSize: 12, lineHeight: 17, marginTop: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 12 },
  switchLabel: { fontSize: 14, flex: 1 },
});
