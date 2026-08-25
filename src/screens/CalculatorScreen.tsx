import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { ModelSelector } from '../components/ModelSelector';
import { NumericField } from '../components/NumericField';
import { ResultPanel } from '../components/ResultPanel';
import { PROPAGATION_MODEL_LIST, PROPAGATION_MODELS } from '../models/propagation';
import type {
  CitySize,
  Environment,
  PropagationInputs,
  PropagationModelId,
  PropagationWarning,
} from '../models/propagation';
import { parseDecimal } from '../utils/validation';

const ENVIRONMENT_LABELS: Record<Environment, string> = {
  urban: 'Urbano',
  suburban: 'Suburbano',
  'open-rural': 'Abierto/rural',
};

export function CalculatorScreen() {
  const [modelId, setModelId] = useState<PropagationModelId>('free-space');
  const [frequencyMHz, setFrequencyMHz] = useState('900');
  const [distanceKm, setDistanceKm] = useState('5');
  const [baseStationHeightM, setBaseStationHeightM] = useState('30');
  const [mobileHeightM, setMobileHeightM] = useState('1.5');
  const [citySize, setCitySize] = useState<CitySize>('small-medium');
  const [environment, setEnvironment] = useState<Environment>('urban');
  const [metropolitanCenter, setMetropolitanCenter] = useState(false);

  const model = PROPAGATION_MODELS[modelId];

  const { pathLossDb, warnings, errorMessage } = useMemo(() => {
    const parsedFrequency = parseDecimal(frequencyMHz);
    const parsedDistance = parseDecimal(distanceKm);
    const parsedBaseStationHeight = parseDecimal(baseStationHeightM);
    const parsedMobileHeight = parseDecimal(mobileHeightM);

    const hasInvalidNumber = [parsedFrequency, parsedDistance, parsedBaseStationHeight, parsedMobileHeight].some(
      (value) => Number.isNaN(value)
    );

    if (hasInvalidNumber) {
      return {
        pathLossDb: null as number | null,
        warnings: [] as PropagationWarning[],
        errorMessage: 'Todos los campos numéricos deben tener un valor.',
      };
    }

    const inputs: PropagationInputs = {
      frequencyMHz: parsedFrequency,
      distanceKm: parsedDistance,
      baseStationHeightM: parsedBaseStationHeight,
      mobileHeightM: parsedMobileHeight,
      citySize,
      environment,
      metropolitanCenter,
    };

    try {
      const result = model.calculate(inputs);
      return { pathLossDb: result.pathLossDb, warnings: result.warnings, errorMessage: null as string | null };
    } catch (error) {
      return {
        pathLossDb: null as number | null,
        warnings: [] as PropagationWarning[],
        errorMessage: error instanceof Error ? error.message : 'Error desconocido.',
      };
    }
  }, [model, frequencyMHz, distanceKm, baseStationHeightM, mobileHeightM, citySize, environment, metropolitanCenter]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Calculadora de pérdida de propagación</Text>
        <Text style={styles.subtitle}>{model.label}</Text>
        <Text style={styles.citation}>{model.citation}</Text>

        <ModelSelector models={PROPAGATION_MODEL_LIST} selectedId={modelId} onSelect={setModelId} />

        <NumericField label="Frecuencia" unit="MHz" value={frequencyMHz} onChangeText={setFrequencyMHz} />
        <NumericField label="Distancia" unit="km" value={distanceKm} onChangeText={setDistanceKm} />
        <NumericField
          label="Altura estación base"
          unit="m"
          value={baseStationHeightM}
          onChangeText={setBaseStationHeightM}
        />
        <NumericField label="Altura del móvil" unit="m" value={mobileHeightM} onChangeText={setMobileHeightM} />

        <View style={styles.row}>
          <Text style={styles.toggleLabel}>Ciudad grande (Hata / ECC-33)</Text>
          <Switch
            value={citySize === 'large'}
            onValueChange={(value) => setCitySize(value ? 'large' : 'small-medium')}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.toggleLabel}>Centro metropolitano — Cm (solo COST-231)</Text>
          <Switch value={metropolitanCenter} onValueChange={setMetropolitanCenter} />
        </View>

        <Text style={styles.sectionLabel}>Entorno (solo Hata)</Text>
        <View style={styles.row}>
          {(Object.keys(ENVIRONMENT_LABELS) as Environment[]).map((option) => (
            <Pressable
              key={option}
              onPress={() => setEnvironment(option)}
              style={[styles.envChip, environment === option && styles.envChipSelected]}
            >
              <Text style={[styles.envChipText, environment === option && styles.envChipTextSelected]}>
                {ENVIRONMENT_LABELS[option]}
              </Text>
            </Pressable>
          ))}
        </View>

        <ResultPanel pathLossDb={pathLossDb} warnings={warnings} errorMessage={errorMessage} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#102a43' },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#1f6feb', marginTop: 4 },
  citation: { fontSize: 11, color: '#7b8794', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  toggleLabel: { fontSize: 14, color: '#1f2933', flex: 1, marginRight: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#1f2933', marginBottom: 8 },
  envChip: {
    borderWidth: 1,
    borderColor: '#c7ccd1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  envChipSelected: { backgroundColor: '#1f6feb', borderColor: '#1f6feb' },
  envChipText: { fontSize: 13, color: '#1f2933' },
  envChipTextSelected: { color: '#fff' },
});
