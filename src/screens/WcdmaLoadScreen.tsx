import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BackButton } from '../components/BackButton';
import { ModelSelector } from '../components/ModelSelector';
import { NumericField } from '../components/NumericField';
import { WcdmaResultPanel } from '../components/WcdmaResultPanel';
import { calculateWcdmaUplinkLoad, DEFAULT_SERVICE_MIX } from '../models/wcdma';
import type { WcdmaLoadResult } from '../models/wcdma';
import { PROPAGATION_MODEL_LIST } from '../models/propagation';
import type { CitySize, Environment, PropagationModelId } from '../models/propagation';
import { useTheme } from '../theme';
import { parseDecimal } from '../utils/validation';

interface WcdmaLoadScreenProps {
  onBack: () => void;
}

const INVERTIBLE_MODELS = PROPAGATION_MODEL_LIST.filter((m) => m.solveDistanceKm);

const ENVIRONMENT_LABELS: Record<Environment, string> = {
  urban: 'Urbano',
  suburban: 'Suburbano',
  'open-rural': 'Abierto/rural',
};

export function WcdmaLoadScreen({ onBack }: WcdmaLoadScreenProps) {
  const { colors } = useTheme();
  const [modelId, setModelId] = useState<PropagationModelId>(INVERTIBLE_MODELS[0]?.id ?? 'hata');
  const [referenceServiceLabel, setReferenceServiceLabel] = useState(DEFAULT_SERVICE_MIX[0].label);
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

  const [frequencyMHz, setFrequencyMHz] = useState('2100');
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
      return { result: null, errorMessage: 'Todos los campos numéricos deben tener un valor.' };
    }

    try {
      const calculated = calculateWcdmaUplinkLoad({
        chipRateMcps: scalarInputs.chipRateMcps,
        services: DEFAULT_SERVICE_MIX,
        referenceServiceLabel,
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
      return { result: null, errorMessage: error instanceof Error ? error.message : 'Error desconocido.' };
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
    referenceServiceLabel,
    model,
  ]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton onPress={onBack} />

        <Text style={[styles.title, { color: colors.textPrimary }]}>Carga UMTS uplink y cell breathing</Text>
        <Text style={[styles.citation, { color: colors.textMuted }]}>
          Ganancia de procesado, carga por usuario y bucle iterativo de convergencia -- docs/curso-referencia.md
          §13.4.
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          Mix de servicios (fijo, ejemplo del curso)
        </Text>
        {DEFAULT_SERVICE_MIX.map((service) => (
          <Text key={service.label} style={[styles.serviceLine, { color: colors.textSecondary }]}>
            {`${(service.shareOfUsers * 100).toFixed(0)}% ${service.label} (${service.bitRateKbps} kbps, Eb/No=${service.ebN0Db}dB)`}
          </Text>
        ))}

        <NumericField label="Chip rate (W)" unit="Mcps" value={chipRateMcps} onChangeText={setChipRateMcps} />
        <NumericField
          label="Factor de interferencia (i_oc)"
          value={interferenceFactor}
          onChangeText={setInterferenceFactor}
        />
        <NumericField
          label="Carga objetivo (η)"
          value={targetUplinkLoad}
          onChangeText={setTargetUplinkLoad}
          helperText="Fracción entre 0 y 1 (0.5 = 50%)."
        />
        <NumericField label="Usuarios totales" value={totalUsers} onChangeText={setTotalUsers} />
        <NumericField
          label="Erlang promedio por usuario"
          value={averageErlangPerUser}
          onChangeText={setAverageErlangPerUser}
        />
        <NumericField label="Área total" unit="km²" value={totalAreaKm2} onChangeText={setTotalAreaKm2} />

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Servicio de referencia (cobertura)</Text>
        <View style={styles.chipRow}>
          {DEFAULT_SERVICE_MIX.map((service) => {
            const isSelected = referenceServiceLabel === service.label;
            return (
              <Pressable
                key={service.label}
                onPress={() => setReferenceServiceLabel(service.label)}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  isSelected && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
                ]}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
                  {service.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Presupuesto de enlace UMTS</Text>
        <NumericField label="EIRP móvil" unit="dBm" value={eirpDbm} onChangeText={setEirpDbm} />
        <NumericField
          label="Ruido térmico (kTB)"
          unit="dBm"
          value={thermalNoiseDbm}
          onChangeText={setThermalNoiseDbm}
        />
        <NumericField label="Figura de ruido NodeB" unit="dB" value={noiseFigureDb} onChangeText={setNoiseFigureDb} />
        <NumericField
          label="Ganancia antena NodeB"
          unit="dBi"
          value={receiveAntennaGainDbi}
          onChangeText={setReceiveAntennaGainDbi}
        />
        <NumericField label="Pérdida feeder" unit="dB" value={feederLossDb} onChangeText={setFeederLossDb} />
        <NumericField
          label="Margen de sombra"
          unit="dB"
          value={shadowFadingMarginDb}
          onChangeText={setShadowFadingMarginDb}
        />

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
