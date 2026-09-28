import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NumericField } from '../components/NumericField';
import { TrafficResultPanel } from '../components/TrafficResultPanel';
import { erlangBBlocking, erlangBInverseChannels, erlangBInverseTraffic } from '../models/traffic';
import { useTheme } from '../theme';
import { parseDecimal } from '../utils/validation';

interface TrafficScreenProps {
  onBack: () => void;
}

type Mode = 'blocking' | 'traffic' | 'channels';

const MODE_OPTIONS: { mode: Mode; label: string }[] = [
  { mode: 'blocking', label: 'Bloqueo' },
  { mode: 'traffic', label: 'Tráfico' },
  { mode: 'channels', label: 'Canales' },
];

export function TrafficScreen({ onBack }: TrafficScreenProps) {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>('blocking');
  const [channelsInput, setChannelsInput] = useState('42');
  const [trafficInput, setTrafficInput] = useState('30.77');
  const [gosInput, setGosInput] = useState('0.01');

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

      const traffic = parseDecimal(trafficInput);
      const gos = parseDecimal(gosInput);
      if (Number.isNaN(traffic) || Number.isNaN(gos)) {
        return { resultLabel: '', resultValue: null, errorMessage: 'Todos los campos numéricos deben tener un valor.' };
      }
      const channels = erlangBInverseChannels(traffic, gos);
      return { resultLabel: 'Canales necesarios (K)', resultValue: String(channels), errorMessage: null };
    } catch (error) {
      return { resultLabel: '', resultValue: null, errorMessage: error instanceof Error ? error.message : 'Error desconocido.' };
    }
  }, [mode, channelsInput, trafficInput, gosInput]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.accentText }]}>‹ Planificación celular</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Tráfico (Erlang B)</Text>
        <Text style={[styles.citation, { color: colors.textMuted }]}>
          Bloqueo, tráfico soportable o canales necesarios -- docs/curso-referencia.md §13.2.
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

        {mode !== 'channels' ? (
          <NumericField label="Número de canales (K)" value={channelsInput} onChangeText={setChannelsInput} />
        ) : null}

        {mode !== 'traffic' ? (
          <NumericField
            label="Tráfico ofrecido (A)"
            unit="Erlang"
            value={trafficInput}
            onChangeText={setTrafficInput}
          />
        ) : null}

        {mode !== 'blocking' ? (
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
  backButton: { marginBottom: 12 },
  backButtonText: { fontSize: 14, fontWeight: '600' },
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
