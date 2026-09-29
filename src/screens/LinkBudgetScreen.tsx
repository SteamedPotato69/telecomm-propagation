import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BackButton } from '../components/BackButton';
import { DEFAULT_LINK_BUDGET_VALUES, LinkBudgetForm } from '../components/LinkBudgetForm';
import type { LinkBudgetFormValues } from '../components/LinkBudgetForm';
import { LinkBudgetResultPanel } from '../components/LinkBudgetResultPanel';
import { ModelSelector } from '../components/ModelSelector';
import { NumericField } from '../components/NumericField';
import { PROPAGATION_MODEL_LIST, calculateMapl } from '../models/propagation';
import type { CitySize, Environment, PropagationModelId } from '../models/propagation';
import { useTheme } from '../theme';
import { parseDecimal } from '../utils/validation';

interface LinkBudgetScreenProps {
  onBack: () => void;
}

// Only models the registry itself marks as invertible -- see the
// PropagationModelDefinition.solveDistanceKm doc comment. Ikegami/
// Walfisch-Bertoni/COST-231-Walfish-Ikegami are excluded automatically,
// not via a hardcoded id list.
const INVERTIBLE_MODELS = PROPAGATION_MODEL_LIST.filter((m) => m.solveDistanceKm);

const ENVIRONMENT_LABELS: Record<Environment, string> = {
  urban: 'Urbano',
  suburban: 'Suburbano',
  'open-rural': 'Abierto/rural',
};

export function LinkBudgetScreen({ onBack }: LinkBudgetScreenProps) {
  const { colors } = useTheme();
  const [modelId, setModelId] = useState<PropagationModelId>(INVERTIBLE_MODELS[0]?.id ?? 'hata');
  const [frequencyMHz, setFrequencyMHz] = useState('900');
  const [baseStationHeightM, setBaseStationHeightM] = useState('30');
  const [mobileHeightM, setMobileHeightM] = useState('1.5');
  const [citySize, setCitySize] = useState<CitySize>('large');
  const [envOption, setEnvOption] = useState<Environment>('urban');
  const [metropolitanCenter, setMetropolitanCenter] = useState(false);
  const [linkBudgetValues, setLinkBudgetValues] = useState<LinkBudgetFormValues>(DEFAULT_LINK_BUDGET_VALUES);

  const model = INVERTIBLE_MODELS.find((m) => m.id === modelId) ?? INVERTIBLE_MODELS[0];

  const { eirpDbm, maplDb, cellRadiusKm, errorMessage } = useMemo<{
    eirpDbm: number | null;
    maplDb: number | null;
    cellRadiusKm: number | null;
    errorMessage: string | null;
  }>(() => {
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

    const allValues = [parsedFrequency, parsedBaseStationHeight, parsedMobileHeight, ...Object.values(parsedLinkBudget)];
    if (allValues.some(Number.isNaN)) {
      return { eirpDbm: null, maplDb: null, cellRadiusKm: null, errorMessage: 'Todos los campos numéricos deben tener un valor.' };
    }

    try {
      const { eirpDbm: eirp, maplDb: mapl } = calculateMapl(parsedLinkBudget);
      const cellRadiusKm = model?.solveDistanceKm
        ? model.solveDistanceKm(
            {
              frequencyMHz: parsedFrequency,
              baseStationHeightM: parsedBaseStationHeight,
              mobileHeightM: parsedMobileHeight,
              citySize,
              environment: envOption,
              metropolitanCenter,
            },
            mapl
          )
        : null;
      return { eirpDbm: eirp, maplDb: mapl, cellRadiusKm, errorMessage: null };
    } catch (error) {
      return { eirpDbm: null, maplDb: null, cellRadiusKm: null, errorMessage: error instanceof Error ? error.message : 'Error desconocido.' };
    }
  }, [frequencyMHz, baseStationHeightM, mobileHeightM, citySize, envOption, metropolitanCenter, linkBudgetValues, model]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton onPress={onBack} />

        <Text style={[styles.title, { color: colors.textPrimary }]}>Link budget (Hata / COST-231-Hata)</Text>
        <Text style={[styles.citation, { color: colors.textMuted }]}>
          MAPL a partir de un presupuesto de enlace completo, e inversión a radio de celda máximo --
          docs/curso-referencia.md §13.3.
        </Text>

        <ModelSelector
          items={PROPAGATION_MODEL_LIST.map((m) => ({ id: m.id, label: m.shortLabel, disabled: !m.solveDistanceKm }))}
          selectedId={modelId}
          onSelect={(id) => setModelId(id as PropagationModelId)}
        />

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Modelo de propagación</Text>
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

        <LinkBudgetResultPanel eirpDbm={eirpDbm} maplDb={maplDb} cellRadiusKm={cellRadiusKm} errorMessage={errorMessage} />
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  toggleLabel: { fontSize: 14, flex: 1, marginRight: 12 },
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
