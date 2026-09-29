import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BackButton } from '../components/BackButton';
import { DimensioningResultPanel } from '../components/DimensioningResultPanel';
import { DEFAULT_LINK_BUDGET_VALUES, LinkBudgetForm } from '../components/LinkBudgetForm';
import type { LinkBudgetFormValues } from '../components/LinkBudgetForm';
import { ModelSelector } from '../components/ModelSelector';
import { NumericField } from '../components/NumericField';
import { calculateDimensioning } from '../models/dimensioning';
import type { DimensioningResult } from '../models/dimensioning';
import { PROPAGATION_MODEL_LIST } from '../models/propagation';
import type { CitySize, Environment, PropagationModelId } from '../models/propagation';
import { useTheme } from '../theme';
import { parseDecimal } from '../utils/validation';

interface DimensioningScreenProps {
  onBack: () => void;
}

const INVERTIBLE_MODELS = PROPAGATION_MODEL_LIST.filter((m) => m.solveDistanceKm);

const ENVIRONMENT_LABELS: Record<Environment, string> = {
  urban: 'Urbano',
  suburban: 'Suburbano',
  'open-rural': 'Abierto/rural',
};

export function DimensioningScreen({ onBack }: DimensioningScreenProps) {
  const { colors } = useTheme();
  const [modelId, setModelId] = useState<PropagationModelId>(INVERTIBLE_MODELS[0]?.id ?? 'hata');
  const [totalTrafficErlangs, setTotalTrafficErlangs] = useState('250');
  const [channelsPerCell, setChannelsPerCell] = useState('59');
  const [targetGoS, setTargetGoS] = useState('0.02');
  const [totalAreaKm2, setTotalAreaKm2] = useState('50');
  const [frequencyMHz, setFrequencyMHz] = useState('900');
  const [baseStationHeightM, setBaseStationHeightM] = useState('30');
  const [mobileHeightM, setMobileHeightM] = useState('1.5');
  const [citySize, setCitySize] = useState<CitySize>('large');
  const [envOption, setEnvOption] = useState<Environment>('urban');
  const [metropolitanCenter, setMetropolitanCenter] = useState(false);
  const [linkBudgetValues, setLinkBudgetValues] = useState<LinkBudgetFormValues>(DEFAULT_LINK_BUDGET_VALUES);

  const model = INVERTIBLE_MODELS.find((m) => m.id === modelId) ?? INVERTIBLE_MODELS[0];

  const { result, errorMessage } = useMemo<{ result: DimensioningResult | null; errorMessage: string | null }>(() => {
    const parsedTraffic = parseDecimal(totalTrafficErlangs);
    const parsedChannels = parseDecimal(channelsPerCell);
    const parsedGos = parseDecimal(targetGoS);
    const parsedArea = parseDecimal(totalAreaKm2);
    const parsedFrequency = parseDecimal(frequencyMHz);
    const parsedBaseStationHeight = parseDecimal(baseStationHeightM);
    const parsedMobileHeight = parseDecimal(mobileHeightM);
    const parsedLinkBudget = {
      transmitPowerDbm: parseDecimal(linkBudgetValues.transmitPowerDbm),
      transmitAntennaGainDbi: parseDecimal(linkBudgetValues.transmitAntennaGainDbi),
      bodyLossDb: parseDecimal(linkBudgetValues.bodyLossDb),
      receiveAntennaGainDbi: parseDecimal(linkBudgetValues.receiveAntennaGainDbi),
      feederLossDb: parseDecimal(linkBudgetValues.feederLossDb),
      receiverSensitivityDbm: parseDecimal(linkBudgetValues.receiverSensitivityDbm),
      shadowFadingMarginDb: parseDecimal(linkBudgetValues.shadowFadingMarginDb),
      interferenceMarginDb: parseDecimal(linkBudgetValues.interferenceMarginDb),
    };

    const scalarValues = [
      parsedTraffic,
      parsedChannels,
      parsedGos,
      parsedArea,
      parsedFrequency,
      parsedBaseStationHeight,
      parsedMobileHeight,
      ...Object.values(parsedLinkBudget),
    ];
    if (scalarValues.some(Number.isNaN) || !model?.solveDistanceKm) {
      return { result: null, errorMessage: 'Todos los campos numéricos deben tener un valor.' };
    }

    try {
      const calculated = calculateDimensioning({
        totalTrafficErlangs: parsedTraffic,
        channelsPerCell: parsedChannels,
        targetGoS: parsedGos,
        linkBudget: parsedLinkBudget,
        propagationInputs: {
          frequencyMHz: parsedFrequency,
          baseStationHeightM: parsedBaseStationHeight,
          mobileHeightM: parsedMobileHeight,
          citySize,
          environment: envOption,
          metropolitanCenter,
        },
        solveDistanceKm: model.solveDistanceKm,
        totalAreaKm2: parsedArea,
      });
      return { result: calculated, errorMessage: null };
    } catch (error) {
      return { result: null, errorMessage: error instanceof Error ? error.message : 'Error desconocido.' };
    }
  }, [
    totalTrafficErlangs,
    channelsPerCell,
    targetGoS,
    totalAreaKm2,
    frequencyMHz,
    baseStationHeightM,
    mobileHeightM,
    citySize,
    envOption,
    metropolitanCenter,
    linkBudgetValues,
    model,
  ]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton onPress={onBack} />

        <Text style={[styles.title, { color: colors.textPrimary }]}>Dimensionamiento 1G/2G</Text>
        <Text style={[styles.citation, { color: colors.textMuted }]}>
          Capacidad vs. cobertura -- el resultado final es el factor limitante. docs/curso-referencia.md §13.3.
        </Text>

        <NumericField
          label="Tráfico total"
          unit="Erlang"
          value={totalTrafficErlangs}
          onChangeText={setTotalTrafficErlangs}
        />
        <NumericField label="Canales por celda (K)" value={channelsPerCell} onChangeText={setChannelsPerCell} />
        <NumericField
          label="GoS objetivo"
          value={targetGoS}
          onChangeText={setTargetGoS}
          helperText="Fracción entre 0 y 1 (0.02 = 2%)."
        />
        <NumericField label="Área total a cubrir (S_T)" unit="km²" value={totalAreaKm2} onChangeText={setTotalAreaKm2} />

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Modelo de propagación (cobertura)</Text>
        <ModelSelector
          items={PROPAGATION_MODEL_LIST.map((m) => ({ id: m.id, label: m.shortLabel, disabled: !m.solveDistanceKm }))}
          selectedId={modelId}
          onSelect={(id) => setModelId(id as PropagationModelId)}
        />
        <NumericField label="Frecuencia" unit="MHz" value={frequencyMHz} onChangeText={setFrequencyMHz} />
        <NumericField
          label="Altura estación base"
          unit="m"
          value={baseStationHeightM}
          onChangeText={setBaseStationHeightM}
        />
        <NumericField label="Altura del móvil" unit="m" value={mobileHeightM} onChangeText={setMobileHeightM} />

        <View style={styles.row}>
          <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Ciudad grande (solo Hata)</Text>
          <Switch
            value={citySize === 'large'}
            onValueChange={(value) => setCitySize(value ? 'large' : 'small-medium')}
            trackColor={{ true: colors.accentSolid }}
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Centro metropolitano — Cm (solo COST-231)</Text>
          <Switch value={metropolitanCenter} onValueChange={setMetropolitanCenter} trackColor={{ true: colors.accentSolid }} />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Entorno (solo Hata)</Text>
        <View style={styles.row}>
          {(Object.keys(ENVIRONMENT_LABELS) as Environment[]).map((option) => {
            const isSelected = envOption === option;
            return (
              <Pressable
                key={option}
                onPress={() => setEnvOption(option)}
                style={[
                  styles.envChip,
                  { borderColor: colors.border },
                  isSelected && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
                ]}
              >
                <Text style={[styles.envChipText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
                  {ENVIRONMENT_LABELS[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Presupuesto de enlace</Text>
        <LinkBudgetForm
          values={linkBudgetValues}
          onChange={(field, value) => setLinkBudgetValues((previous) => ({ ...previous, [field]: value }))}
        />

        <DimensioningResultPanel result={result} errorMessage={errorMessage} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700' },
  citation: { fontSize: 11, marginTop: 4, marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  toggleLabel: { fontSize: 14, flex: 1, marginRight: 12 },
  envChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  envChipText: { fontSize: 13 },
});
