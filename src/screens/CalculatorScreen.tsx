import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { ModelSelector } from '../components/ModelSelector';
import { NumericField } from '../components/NumericField';
import { ResultPanel } from '../components/ResultPanel';
import { PROPAGATION_MODELS } from '../models/propagation';
import type {
  CitySize,
  Environment,
  EnvironmentCategory,
  GeometryFieldKey,
  PropagationInputs,
  PropagationModelId,
} from '../models/propagation';
import { GEOMETRY_FIELD_CONFIG } from './geometryFieldConfig';
import { useTheme } from '../theme';
import { parseDecimal } from '../utils/validation';

const ENVIRONMENT_LABELS: Record<Environment, string> = {
  urban: 'Urbano',
  suburban: 'Suburbano',
  'open-rural': 'Abierto/rural',
};

const ALL_GEOMETRY_KEYS = Object.keys(GEOMETRY_FIELD_CONFIG) as GeometryFieldKey[];

interface CalculatorScreenProps {
  environment: EnvironmentCategory;
  onBack: () => void;
  onCompare: (inputs: PropagationInputs) => void;
}

export function CalculatorScreen({ environment, onBack, onCompare }: CalculatorScreenProps) {
  const { colors } = useTheme();
  const applicableModels = useMemo(
    () =>
      environment.applicableModelIds.map((id) => PROPAGATION_MODELS[id]).filter((candidate) => candidate.implemented),
    [environment]
  );

  const [modelId, setModelId] = useState<PropagationModelId>(applicableModels[0]?.id ?? 'free-space');
  const [frequencyMHz, setFrequencyMHz] = useState('900');
  const [distanceKm, setDistanceKm] = useState('5');
  const [baseStationHeightM, setBaseStationHeightM] = useState('30');
  const [mobileHeightM, setMobileHeightM] = useState('1.5');
  const [citySize, setCitySize] = useState<CitySize>(environment.defaultOverrides?.citySize ?? 'small-medium');
  const [envOption, setEnvOption] = useState<Environment>(environment.defaultOverrides?.environment ?? 'urban');
  const [metropolitanCenter, setMetropolitanCenter] = useState(environment.defaultOverrides?.metropolitanCenter ?? false);

  const [geometryValues, setGeometryValues] = useState<Record<GeometryFieldKey, string>>(() => {
    const initial = {} as Record<GeometryFieldKey, string>;
    for (const key of ALL_GEOMETRY_KEYS) {
      initial[key] = GEOMETRY_FIELD_CONFIG[key].defaultValue;
    }
    return initial;
  });
  const setGeometryField = (key: GeometryFieldKey, value: string) =>
    setGeometryValues((previous) => ({ ...previous, [key]: value }));

  const model = PROPAGATION_MODELS[modelId];
  const activeExtraFields = model.extraFields ?? [];

  const inputs = useMemo<PropagationInputs | null>(() => {
    const parsedFrequency = parseDecimal(frequencyMHz);
    const parsedDistance = parseDecimal(distanceKm);
    const parsedBaseStationHeight = parseDecimal(baseStationHeightM);
    const parsedMobileHeight = parseDecimal(mobileHeightM);

    if ([parsedFrequency, parsedDistance, parsedBaseStationHeight, parsedMobileHeight].some(Number.isNaN)) {
      return null;
    }

    const geometry: Partial<Record<GeometryFieldKey, number>> = {};
    for (const key of ALL_GEOMETRY_KEYS) {
      const parsed = parseDecimal(geometryValues[key]);
      geometry[key] = Number.isNaN(parsed) ? undefined : parsed;
    }

    return {
      frequencyMHz: parsedFrequency,
      distanceKm: parsedDistance,
      baseStationHeightM: parsedBaseStationHeight,
      mobileHeightM: parsedMobileHeight,
      citySize,
      environment: envOption,
      metropolitanCenter,
      ...geometry,
    };
  }, [frequencyMHz, distanceKm, baseStationHeightM, mobileHeightM, citySize, envOption, metropolitanCenter, geometryValues]);

  const { pathLossDb, warnings, errorMessage } = useMemo(() => {
    if (!inputs) {
      return { pathLossDb: null as number | null, warnings: [], errorMessage: 'Todos los campos numéricos deben tener un valor.' };
    }
    try {
      const result = model.calculate(inputs);
      return { pathLossDb: result.pathLossDb, warnings: result.warnings, errorMessage: null as string | null };
    } catch (error) {
      return {
        pathLossDb: null as number | null,
        warnings: [],
        errorMessage: error instanceof Error ? error.message : 'Error desconocido.',
      };
    }
  }, [inputs, model]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.accentText }]}>‹ {environment.label}</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Calculadora de pérdida de propagación</Text>
        <Text style={[styles.subtitle, { color: colors.accentText }]}>{model.label}</Text>
        <Text style={[styles.citation, { color: colors.textMuted }]}>{model.citation}</Text>

        <ModelSelector
          items={applicableModels.map((m) => ({ id: m.id, label: m.shortLabel, disabled: !m.implemented }))}
          selectedId={modelId}
          onSelect={(id) => setModelId(id as PropagationModelId)}
        />

        <NumericField label="Frecuencia" unit="MHz" value={frequencyMHz} onChangeText={setFrequencyMHz} />
        <NumericField label="Distancia" unit="km" value={distanceKm} onChangeText={setDistanceKm} />
        <NumericField
          label="Altura estación base"
          unit="m"
          value={baseStationHeightM}
          onChangeText={setBaseStationHeightM}
        />
        <NumericField label="Altura del móvil" unit="m" value={mobileHeightM} onChangeText={setMobileHeightM} />

        {activeExtraFields.length > 0 ? (
          <View style={[styles.geometrySection, { borderColor: colors.borderMuted, backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              Geometría requerida por {model.shortLabel}
            </Text>
            {activeExtraFields.map((key) => {
              const config = GEOMETRY_FIELD_CONFIG[key];
              return (
                <NumericField
                  key={key}
                  label={config.label}
                  unit={config.unit}
                  value={geometryValues[key]}
                  onChangeText={(value) => setGeometryField(key, value)}
                  helperText={config.helperText}
                />
              );
            })}
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Ciudad grande (Hata / ECC-33)</Text>
          <Switch
            value={citySize === 'large'}
            onValueChange={(value) => setCitySize(value ? 'large' : 'small-medium')}
            trackColor={{ true: colors.accentSolid }}
          />
        </View>

        <View style={styles.row}>
          <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Centro metropolitano — Cm (COST-231)</Text>
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

        <ResultPanel pathLossDb={pathLossDb} warnings={warnings} errorMessage={errorMessage} />

        {applicableModels.length > 1 ? (
          <Pressable
            disabled={!inputs}
            onPress={() => inputs && onCompare(inputs)}
            style={[styles.compareButton, { backgroundColor: colors.accentSolid }, !inputs && styles.compareButtonDisabled]}
          >
            <Text style={styles.compareButtonText}>Comparar todos los modelos de este entorno</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 12 },
  backButtonText: { fontSize: 14, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  citation: { fontSize: 11, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  toggleLabel: { fontSize: 14, flex: 1, marginRight: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  geometrySection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  envChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  envChipText: { fontSize: 13 },
  compareButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  compareButtonDisabled: { opacity: 0.4 },
  compareButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});
