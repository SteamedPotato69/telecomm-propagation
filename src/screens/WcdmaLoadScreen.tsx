import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { ModelSelector } from '../components/ModelSelector';
import { NumericField } from '../components/NumericField';
import { WcdmaResultPanel } from '../components/WcdmaResultPanel';
import { calculateWcdmaUplinkLoad, DEFAULT_SERVICE_MIX } from '../models/wcdma';
import type { WcdmaLoadResult, WcdmaServiceId } from '../models/wcdma';
import { PROPAGATION_MODEL_LIST, recommendInvertibleModel } from '../models/propagation';
import type { CitySize, Environment, PropagationModelId } from '../models/propagation';
import { translateError } from '../i18n';
import { useTheme } from '../theme';
import { parseDecimal } from '../utils/validation';

interface WcdmaLoadScreenProps {
  onBack: () => void;
}

const INVERTIBLE_MODELS = PROPAGATION_MODEL_LIST.filter((m) => m.solveDistanceKm);

// The course's 3G example is at 2100 MHz (diap. 72). Plain Hata (150-1500 MHz) is far out of
// range there and the cell-breathing loop fails to converge with it; the model whose range
// fits best (COST-231-Hata) converges. Chosen from the frequency, not hard-coded.
const DEFAULT_FREQUENCY_MHZ = 2100;

const ENVIRONMENT_OPTIONS: Environment[] = ['urban', 'suburban', 'open-rural'];

export function WcdmaLoadScreen({ onBack }: WcdmaLoadScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [modelId, setModelId] = useState<PropagationModelId>(
    recommendInvertibleModel(DEFAULT_FREQUENCY_MHZ).modelId
  );
  const [referenceServiceId, setReferenceServiceId] = useState<WcdmaServiceId>(DEFAULT_SERVICE_MIX[0].id);
  const [chipRateMcps, setChipRateMcps] = useState('3.84');
  const [interferenceFactor, setInterferenceFactor] = useState('0.55');
  const [targetUplinkLoad, setTargetUplinkLoad] = useState('0.5');
  const [totalUsers, setTotalUsers] = useState('10000');
  const [averageErlangPerUser, setAverageErlangPerUser] = useState('0.025');
  const [totalAreaKm2, setTotalAreaKm2] = useState('50');

  const [eirpDbm, setEirpDbm] = useState('18');
  const [thermalNoiseDbm, setThermalNoiseDbm] = useState('-108.2');
  const [noiseFigureDb, setNoiseFigureDb] = useState('5.0');
  const [receiveAntennaGainDbi, setReceiveAntennaGainDbi] = useState('18');
  const [feederLossDb, setFeederLossDb] = useState('2');
  const [shadowFadingMarginDb, setShadowFadingMarginDb] = useState('8');

  const [frequencyMHz, setFrequencyMHz] = useState(String(DEFAULT_FREQUENCY_MHZ));
  const [baseStationHeightM, setBaseStationHeightM] = useState('30');
  const [mobileHeightM, setMobileHeightM] = useState('1.5');
  const [citySize, setCitySize] = useState<CitySize>('large');
  const [envOption, setEnvOption] = useState<Environment>('urban');
  const [metropolitanCenter, setMetropolitanCenter] = useState(true);

  const model = INVERTIBLE_MODELS.find((m) => m.id === modelId) ?? INVERTIBLE_MODELS[0];

  const { result, errorMessage } = useMemo<{ result: WcdmaLoadResult | null; errorMessage: string | null }>(() => {
    const scalarInputs = {
      chipRateMcps: parseDecimal(chipRateMcps),
      interferenceFactor: parseDecimal(interferenceFactor),
      targetUplinkLoad: parseDecimal(targetUplinkLoad),
      totalUsers: parseDecimal(totalUsers),
      averageErlangPerUser: parseDecimal(averageErlangPerUser),
      totalAreaKm2: parseDecimal(totalAreaKm2),
      eirpDbm: parseDecimal(eirpDbm),
      thermalNoiseDbm: parseDecimal(thermalNoiseDbm),
      noiseFigureDb: parseDecimal(noiseFigureDb),
      receiveAntennaGainDbi: parseDecimal(receiveAntennaGainDbi),
      feederLossDb: parseDecimal(feederLossDb),
      shadowFadingMarginDb: parseDecimal(shadowFadingMarginDb),
      frequencyMHz: parseDecimal(frequencyMHz),
      baseStationHeightM: parseDecimal(baseStationHeightM),
      mobileHeightM: parseDecimal(mobileHeightM),
    };

    if (Object.values(scalarInputs).some(Number.isNaN) || !model?.solveDistanceKm) {
      return { result: null, errorMessage: t('common.missingValues') };
    }

    try {
      const calculated = calculateWcdmaUplinkLoad({
        chipRateMcps: scalarInputs.chipRateMcps,
        services: DEFAULT_SERVICE_MIX,
        referenceServiceId,
        interferenceFactor: scalarInputs.interferenceFactor,
        targetUplinkLoad: scalarInputs.targetUplinkLoad,
        linkBudget: {
          eirpDbm: scalarInputs.eirpDbm,
          thermalNoiseDbm: scalarInputs.thermalNoiseDbm,
          noiseFigureDb: scalarInputs.noiseFigureDb,
          receiveAntennaGainDbi: scalarInputs.receiveAntennaGainDbi,
          feederLossDb: scalarInputs.feederLossDb,
          shadowFadingMarginDb: scalarInputs.shadowFadingMarginDb,
        },
        propagationInputs: {
          frequencyMHz: scalarInputs.frequencyMHz,
          baseStationHeightM: scalarInputs.baseStationHeightM,
          mobileHeightM: scalarInputs.mobileHeightM,
          citySize,
          environment: envOption,
          metropolitanCenter,
        },
        solveDistanceKm: model.solveDistanceKm,
        totalUsers: scalarInputs.totalUsers,
        averageErlangPerUser: scalarInputs.averageErlangPerUser,
        totalAreaKm2: scalarInputs.totalAreaKm2,
      });
      return { result: calculated, errorMessage: null };
    } catch (error) {
      return { result: null, errorMessage: translateError(t, error) };
    }
  }, [
    chipRateMcps,
    interferenceFactor,
    targetUplinkLoad,
    totalUsers,
    averageErlangPerUser,
    totalAreaKm2,
    eirpDbm,
    thermalNoiseDbm,
    noiseFigureDb,
    receiveAntennaGainDbi,
    feederLossDb,
    shadowFadingMarginDb,
    frequencyMHz,
    baseStationHeightM,
    mobileHeightM,
    citySize,
    envOption,
    metropolitanCenter,
    referenceServiceId,
    model,
    t,
  ]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton onPress={onBack} />

        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('wcdma.title')}</Text>
        <Text style={[styles.citation, { color: colors.textMuted }]}>
          {t('wcdma.subtitle')}
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          {t('wcdma.serviceMixHeading')}
        </Text>
        {DEFAULT_SERVICE_MIX.map((service) => (
          <Text key={service.id} style={[styles.serviceLine, { color: colors.textSecondary }]}>
            {`${(service.shareOfUsers * 100).toFixed(0)}% ${t(`wcdma.services.${service.id}`)} (${service.bitRateKbps} kbps, Eb/No=${service.ebN0Db}dB)`}
          </Text>
        ))}

        <NumericField label={t('fields.chipRate')} unit="Mcps" value={chipRateMcps} onChangeText={setChipRateMcps} />
        <NumericField
          label={t('fields.interferenceFactor')}
          value={interferenceFactor}
          onChangeText={setInterferenceFactor}
        />
        <NumericField
          label={t('fields.targetLoad')}
          value={targetUplinkLoad}
          onChangeText={setTargetUplinkLoad}
          helperText={t('wcdma.targetLoadHelper')}
        />
        <NumericField label={t('fields.totalUsers')} value={totalUsers} onChangeText={setTotalUsers} />
        <NumericField
          label={t('fields.averageErlangPerUser')}
          value={averageErlangPerUser}
          onChangeText={setAverageErlangPerUser}
        />
        <NumericField label={t('fields.totalArea')} unit="km²" value={totalAreaKm2} onChangeText={setTotalAreaKm2} />

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('wcdma.referenceService')}</Text>
        <View style={styles.chipRow}>
          {DEFAULT_SERVICE_MIX.map((service) => {
            const isSelected = referenceServiceId === service.id;
            return (
              <Pressable
                key={service.id}
                onPress={() => setReferenceServiceId(service.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  isSelected && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
                ]}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
                  {t(`wcdma.services.${service.id}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('wcdma.linkBudgetHeading')}</Text>
        <NumericField label={t('wcdma.mobileEirp')} unit="dBm" value={eirpDbm} onChangeText={setEirpDbm} />
        <NumericField
          label={t('wcdma.thermalNoise')}
          unit="dBm"
          value={thermalNoiseDbm}
          onChangeText={setThermalNoiseDbm}
        />
        <NumericField label={t('wcdma.noiseFigure')} unit="dB" value={noiseFigureDb} onChangeText={setNoiseFigureDb} />
        <NumericField
          label={t('wcdma.nodeBAntennaGain')}
          unit="dBi"
          value={receiveAntennaGainDbi}
          onChangeText={setReceiveAntennaGainDbi}
        />
        <NumericField label={t('fields.feederLoss')} unit="dB" value={feederLossDb} onChangeText={setFeederLossDb} />
        <NumericField
          label={t('fields.shadowFadingMargin')}
          unit="dB"
          value={shadowFadingMarginDb}
          onChangeText={setShadowFadingMarginDb}
        />

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('propagationOptions.modelCoverage')}</Text>
        <ModelSelector
          items={PROPAGATION_MODEL_LIST.map((m) => ({ id: m.id, label: t(`models.${m.id}.shortLabel`), disabled: !m.solveDistanceKm }))}
          selectedId={modelId}
          onSelect={(id) => setModelId(id as PropagationModelId)}
        />
        <NumericField label={t('fields.frequency')} unit="MHz" value={frequencyMHz} onChangeText={setFrequencyMHz} />
        <NumericField
          label={t('fields.baseStationHeight')}
          unit="m"
          value={baseStationHeightM}
          onChangeText={setBaseStationHeightM}
        />
        <NumericField label={t('fields.mobileHeight')} unit="m" value={mobileHeightM} onChangeText={setMobileHeightM} />

        <View style={styles.row}>
          <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{t('propagationOptions.largeCityHataOnly')}</Text>
          <Switch
            value={citySize === 'large'}
            onValueChange={(value) => setCitySize(value ? 'large' : 'small-medium')}
            trackColor={{ true: colors.accentSolid }}
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{t('propagationOptions.metropolitanCostOnly')}</Text>
          <Switch value={metropolitanCenter} onValueChange={setMetropolitanCenter} trackColor={{ true: colors.accentSolid }} />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('propagationOptions.environmentHataOnly')}</Text>
        <View style={styles.row}>
          {ENVIRONMENT_OPTIONS.map((option) => {
            const isSelected = envOption === option;
            return (
              <Pressable
                key={option}
                onPress={() => setEnvOption(option)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.envChip,
                  { borderColor: colors.border },
                  isSelected && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
                ]}
              >
                <Text style={[styles.envChipText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
                  {t(`envOptions.${option}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <WcdmaResultPanel result={result} errorMessage={errorMessage} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700' },
  citation: { fontSize: 11, marginTop: 4, marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  serviceLine: { fontSize: 12, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  toggleLabel: { fontSize: 14, flex: 1, marginRight: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 13 },
  envChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  envChipText: { fontSize: 13 },
});
