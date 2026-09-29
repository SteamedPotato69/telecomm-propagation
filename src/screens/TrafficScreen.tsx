import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackButton } from '../components/BackButton';
import { NumericField } from '../components/NumericField';
import { TrafficResultPanel } from '../components/TrafficResultPanel';
import { erlangBBlocking, erlangBInverseChannels, erlangBInverseTraffic, maxDensityForGoS } from '../models/traffic';
import { useTheme } from '../theme';
import { parseDecimal } from '../utils/validation';

interface TrafficScreenProps {
  onBack: () => void;
}

type Mode = 'blocking' | 'traffic' | 'channels' | 'density';

const MODE_OPTIONS: { mode: Mode; label: string }[] = [
  { mode: 'blocking', label: 'Bloqueo' },
  { mode: 'traffic', label: 'Tráfico' },
  { mode: 'channels', label: 'Canales' },
  { mode: 'density', label: 'Densidad' },
];

export function TrafficScreen({ onBack }: TrafficScreenProps) {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>('blocking');
  const [channelsInput, setChannelsInput] = useState('42');
  const [trafficInput, setTrafficInput] = useState('30.77');
  const [gosInput, setGosInput] = useState('0.01');
  const [cellAreaInput, setCellAreaInput] = useState('500');

  const showChannels = mode === 'blocking' || mode === 'traffic' || mode === 'density';
  const showTraffic = mode === 'blocking' || mode === 'channels';
  const showGos = mode === 'traffic' || mode === 'channels' || mode === 'density';
  const showCellArea = mode === 'density';

  const { resultLabel, resultValue, errorMessage } = useMemo<{
    resultLabel: string;
    resultValue: string | null;
    errorMessage: string | null;
  }>(() => {
    try {
      if (mode === 'blocking') {
        const channels = parseDecimal(channelsInput);
        const traffic = parseDecimal(trafficInput);
        if (Number.isNaN(channels) || Number.isNaN(traffic)) {
          return { resultLabel: '', resultValue: null, errorMessage: 'Todos los campos numéricos deben tener un valor.' };
        }
        const blocking = erlangBBlocking(channels, traffic);
        return { resultLabel: 'Probabilidad de bloqueo (GoS)', resultValue: `${(blocking * 100).toFixed(3)} %`, errorMessage: null };
      }

      if (mode === 'traffic') {
        const channels = parseDecimal(channelsInput);
        const gos = parseDecimal(gosInput);
        if (Number.isNaN(channels) || Number.isNaN(gos)) {
          return { resultLabel: '', resultValue: null, errorMessage: 'Todos los campos numéricos deben tener un valor.' };
        }
        const traffic = erlangBInverseTraffic(channels, gos);
        return { resultLabel: 'Tráfico soportable (A)', resultValue: `${traffic.toFixed(3)} Erlang`, errorMessage: null };
      }

      if (mode === 'channels') {
        const traffic = parseDecimal(trafficInput);
        const gos = parseDecimal(gosInput);
        if (Number.isNaN(traffic) || Number.isNaN(gos)) {
          return { resultLabel: '', resultValue: null, errorMessage: 'Todos los campos numéricos deben tener un valor.' };
        }
        const channels = erlangBInverseChannels(traffic, gos);
        return { resultLabel: 'Canales necesarios (K)', resultValue: String(channels), errorMessage: null };
      }

      const channels = parseDecimal(channelsInput);
      const gos = parseDecimal(gosInput);
      const cellAreaKm2 = parseDecimal(cellAreaInput);
      if (Number.isNaN(channels) || Number.isNaN(gos) || Number.isNaN(cellAreaKm2)) {
        return { resultLabel: '', resultValue: null, errorMessage: 'Todos los campos numéricos deben tener un valor.' };
      }
      const density = maxDensityForGoS(channels, gos, cellAreaKm2);
      return {
        resultLabel: 'Densidad de tráfico máxima soportable (ρ)',
        resultValue: `${density.toFixed(4)} Erlang/km²`,
        errorMessage: null,
      };
    } catch (error) {
      return { resultLabel: '', resultValue: null, errorMessage: error instanceof Error ? error.message : 'Error desconocido.' };
    }
  }, [mode, channelsInput, trafficInput, gosInput, cellAreaInput]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton onPress={onBack} />

        <Text style={[styles.title, { color: colors.textPrimary }]}>Tráfico (Erlang B)</Text>
        <Text style={[styles.citation, { color: colors.textMuted }]}>
          Bloqueo, tráfico soportable, canales necesarios o densidad de tráfico -- docs/curso-referencia.md
          §13.2-13.3.
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>¿Qué quieres calcular?</Text>
        <View style={styles.chipRow}>
          {MODE_OPTIONS.map((option) => {
            const isSelected = mode === option.mode;
            return (
              <Pressable
                key={option.mode}
                onPress={() => setMode(option.mode)}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  isSelected && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
                ]}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {showChannels ? (
          <NumericField label="Número de canales (K)" value={channelsInput} onChangeText={setChannelsInput} />
        ) : null}

        {showTraffic ? (
          <NumericField
            label="Tráfico ofrecido (A)"
            unit="Erlang"
            value={trafficInput}
            onChangeText={setTrafficInput}
          />
        ) : null}

        {showCellArea ? (
          <NumericField
            label="Área de celda (S_c)"
            unit="km²"
            value={cellAreaInput}
            onChangeText={setCellAreaInput}
            helperText="Del módulo de geometría celular, o cualquier área de celda conocida."
          />
        ) : null}

        {showGos ? (
          <NumericField
            label="GoS objetivo"
            value={gosInput}
            onChangeText={setGosInput}
            helperText="Fracción entre 0 y 1 (0.02 = 2% de bloqueo objetivo)."
          />
        ) : null}

        <TrafficResultPanel label={resultLabel} value={resultValue} errorMessage={errorMessage} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700' },
  citation: { fontSize: 11, marginTop: 4, marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 13 },
});
