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

  // Ikegami-only geometry (docs/curso-referencia.md §5.6). Defaults
  // match the worked exercise in §5.2 so the fields aren't blank.
  const [streetWidthM, setStreetWidthM] = useState('20');
  const [diffractingBuildingHeightM, setDiffractingBuildingHeightM] = useState('12');
  const [streetOrientationDeg, setStreetOrientationDeg] = useState('30');
  const [facadeReflectionLr, setFacadeReflectionLr] = useState('3.2');

  // Walfisch-Bertoni-only geometry (docs/curso-referencia.md §5.7).
  const [baseStationHeightAboveRoofM, setBaseStationHeightAboveRoofM] = useState('28');
  const [averageBuildingHeightM, setAverageBuildingHeightM] = useState('12');
  const [buildingSeparationM, setBuildingSeparationM] = useState('50');

  const model = PROPAGATION_MODELS[modelId];
  const needsIkegamiFields = modelId === 'ikegami';
  const needsWalfischBertoniFields = modelId === 'walfisch-bertoni';

  const { pathLossDb, warnings, errorMessage } = useMemo(() => {
    const parsedFrequency = parseDecimal(frequencyMHz);
    const parsedDistance = parseDecimal(distanceKm);
    const parsedBaseStationHeight = parseDecimal(baseStationHeightM);
    const parsedMobileHeight = parseDecimal(mobileHeightM);

    const coreValues = [parsedFrequency, parsedDistance, parsedBaseStationHeight, parsedMobileHeight];

    const parsedStreetWidth = parseDecimal(streetWidthM);
    const parsedDiffractingBuildingHeight = parseDecimal(diffractingBuildingHeightM);
    const parsedStreetOrientation = parseDecimal(streetOrientationDeg);
    const parsedFacadeReflectionLr = parseDecimal(facadeReflectionLr);
    const ikegamiValues = [
      parsedStreetWidth,
      parsedDiffractingBuildingHeight,
      parsedStreetOrientation,
      parsedFacadeReflectionLr,
    ];

    const parsedHeightAboveRoof = parseDecimal(baseStationHeightAboveRoofM);
    const parsedAverageBuildingHeight = parseDecimal(averageBuildingHeightM);
    const parsedBuildingSeparation = parseDecimal(buildingSeparationM);
    const walfischBertoniValues = [parsedHeightAboveRoof, parsedAverageBuildingHeight, parsedBuildingSeparation];

    const requiredValues = [
      ...coreValues,
      ...(needsIkegamiFields ? ikegamiValues : []),
      ...(needsWalfischBertoniFields ? walfischBertoniValues : []),
    ];

    if (requiredValues.some((value) => Number.isNaN(value))) {
      return {
        pathLossDb: null as number | null,
        warnings: [] as PropagationWarning[],
        errorMessage: 'Todos los campos numéricos visibles deben tener un valor.',
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
      streetWidthM: Number.isNaN(parsedStreetWidth) ? undefined : parsedStreetWidth,
      diffractingBuildingHeightM: Number.isNaN(parsedDiffractingBuildingHeight)
        ? undefined
        : parsedDiffractingBuildingHeight,
      streetOrientationDeg: Number.isNaN(parsedStreetOrientation) ? undefined : parsedStreetOrientation,
      facadeReflectionLr: Number.isNaN(parsedFacadeReflectionLr) ? undefined : parsedFacadeReflectionLr,
      baseStationHeightAboveRoofM: Number.isNaN(parsedHeightAboveRoof) ? undefined : parsedHeightAboveRoof,
      averageBuildingHeightM: Number.isNaN(parsedAverageBuildingHeight) ? undefined : parsedAverageBuildingHeight,
      buildingSeparationM: Number.isNaN(parsedBuildingSeparation) ? undefined : parsedBuildingSeparation,
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
  }, [
    model,
    frequencyMHz,
    distanceKm,
    baseStationHeightM,
    mobileHeightM,
    citySize,
    environment,
    metropolitanCenter,
    needsIkegamiFields,
    needsWalfischBertoniFields,
    streetWidthM,
    diffractingBuildingHeightM,
    streetOrientationDeg,
    facadeReflectionLr,
    baseStationHeightAboveRoofM,
    averageBuildingHeightM,
    buildingSeparationM,
  ]);

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

        {needsIkegamiFields ? (
          <View style={styles.geometrySection}>
            <Text style={styles.sectionLabel}>Geometría de calle (Ikegami)</Text>
            <NumericField label="Ancho de calle (W)" unit="m" value={streetWidthM} onChangeText={setStreetWidthM} />
            <NumericField
              label="Altura del edificio de difracción (H)"
              unit="m"
              value={diffractingBuildingHeightM}
              onChangeText={setDiffractingBuildingHeightM}
              helperText="Debe ser mayor que la altura del móvil de arriba."
            />
            <NumericField
              label="Orientación de calle (Φ)"
              unit="°"
              value={streetOrientationDeg}
              onChangeText={setStreetOrientationDeg}
              helperText="Ángulo entre el rayo incidente y la calle. No puede ser 0° ni 180°."
            />
            <NumericField
              label="Reflexión de fachada (lr)"
              value={facadeReflectionLr}
              onChangeText={setFacadeReflectionLr}
              helperText="Típico: 2 en VHF, 3.2 en UHF."
            />
          </View>
        ) : null}

        {needsWalfischBertoniFields ? (
          <View style={styles.geometrySection}>
            <Text style={styles.sectionLabel}>Geometría de edificios (Walfisch-Bertoni)</Text>
            <NumericField
              label="Altura de estación base sobre tejados (H)"
              unit="m"
              value={baseStationHeightAboveRoofM}
              onChangeText={setBaseStationHeightAboveRoofM}
              helperText="Altura de la antena SOBRE el nivel de los tejados cercanos, no su altura absoluta."
            />
            <NumericField
              label="Altura media de edificios (hR)"
              unit="m"
              value={averageBuildingHeightM}
              onChangeText={setAverageBuildingHeightM}
              helperText="Debe ser mayor que la altura del móvil de arriba."
            />
            <NumericField
              label="Separación entre edificios (b)"
              unit="m"
              value={buildingSeparationM}
              onChangeText={setBuildingSeparationM}
            />
          </View>
        ) : null}

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
  geometrySection: {
    borderWidth: 1,
    borderColor: '#e4e9ee',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f7f9fb',
  },
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
